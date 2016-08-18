import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Inputs } from './inputs.js';
import { Days } from '../days/days.js';

export const insert = new ValidatedMethod({
  name: 'inputs.insert',
  validate: Inputs.simpleSchema().pick(['dayId', 'text']).validator({ clean: true, filter: false }),
  run({ dayId, text }) {
    const day = Days.findOne(dayId);

    if (day.isPrivate() && day.userId !== this.userId) {
      throw new Meteor.Error('inputs.insert.accessDenied',
        'Cannot add inputs to a private day that is not yours');
    }

    const input = {
      dayId,
      text,
      checked: false,
      createdAt: new Date(),
    };

    Inputs.insert(input);
  },
});

export const setCheckedStatus = new ValidatedMethod({
  name: 'inputs.makeChecked',
  validate: new SimpleSchema({
    inputId: Inputs.simpleSchema().schema('_id'),
    newCheckedStatus: Inputs.simpleSchema().schema('checked'),
  }).validator({ clean: true, filter: false }),
  run({ inputId, newCheckedStatus }) {
    const input = Inputs.findOne(inputId);

    if (input.checked === newCheckedStatus) {
      // The status is already what we want, let's not do any extra work
      return;
    }

    if (!input.editableBy(this.userId)) {
      throw new Meteor.Error('inputs.setCheckedStatus.accessDenied',
        'Cannot edit checked status in a private day that is not yours');
    }

    Inputs.update(inputId, { $set: {
      checked: newCheckedStatus,
    } });
  },
});

export const updateText = new ValidatedMethod({
  name: 'inputs.updateText',
  validate: new SimpleSchema({
    inputId: Inputs.simpleSchema().schema('_id'),
    newText: Inputs.simpleSchema().schema('text'),
  }).validator({ clean: true, filter: false }),
  run({ inputId, newText }) {
    // This is complex auth stuff - perhaps denormalizing a userId onto inputs
    // would be correct here?
    const input = Inputs.findOne(inputId);

    if (!input.editableBy(this.userId)) {
      throw new Meteor.Error('inputs.updateText.accessDenied',
        'Cannot edit inputs in a private day that is not yours');
    }

    Inputs.update(inputId, {
      $set: { text: newText },
    });
  },
});

export const remove = new ValidatedMethod({
  name: 'inputs.remove',
  validate: new SimpleSchema({
    inputId: Inputs.simpleSchema().schema('_id'),
  }).validator({ clean: true, filter: false }),
  run({ inputId }) {
    const input = Inputs.findOne(inputId);

    if (!input.editableBy(this.userId)) {
      throw new Meteor.Error('inputs.remove.accessDenied',
        'Cannot remove inputs in a private day that is not yours');
    }

    Inputs.remove(inputId);
  },
});

// Get day of all method names on Inputs
const INPUTS_METHODS = _.pluck([
  insert,
  setCheckedStatus,
  updateText,
  remove,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 inputs operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(INPUTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
