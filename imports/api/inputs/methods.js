import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Inputs } from './inputs.js';
import { Days } from '../days/days.js';

export const insertInput = new ValidatedMethod({
  name: 'inputs.insert',
  validate: Inputs.simpleSchema().pick(['text','date']).validator({ clean: true, filter: false }),
  run({ text, date }) {
    console.log(Meteor.userId());
    const input = {
      text,
      date,
      userId: Meteor.userId()
    };

    Inputs.insert(input);
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
  insertInput,
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
