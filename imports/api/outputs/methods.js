import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

import { Outputs } from './outputs.js';
import { Days } from '../days/days.js';

export const insertOutput = new ValidatedMethod({
  name: 'outputs.insert',
  validate: Outputs.simpleSchema().pick(['text','date']).validator({ clean: true, filter: false }),
  run({ text, date }) {
    const output = {
      text,
      date,
      userId: Meteor.userId()
    };

    Outputs.insert(output);
  },
});

export const updateWeight = new ValidatedMethod({
  name: 'outputs.updateWeight',
  validate: new SimpleSchema({
    weight: {
      type: Number,
      decimal: true,
      min: 1
    },
    date: {
      type: String
    },
  }).validator({ clean: true }),
  run({ weight, date }) {
    var output = Outputs.findOne({date:date});
    if (output) {
      Outputs.update(output._id, {
        $set: { weight: weight },
      });
    } else {
      const output = {
        weight,
        date,
        userId: Meteor.userId()
      };

      Outputs.insert(output);
    }
  },
});

export const remove = new ValidatedMethod({
  name: 'outputs.remove',
  validate: new SimpleSchema({
    outputId: Outputs.simpleSchema().schema('_id'),
  }).validator({ clean: true, filter: false }),
  run({ outputId }) {
    const output = Outputs.findOne(outputId);

    if (!output.editableBy(this.userId)) {
      throw new Meteor.Error('outputs.remove.accessDenied',
        'Cannot remove outputs in a private day that is not yours');
    }

    Outputs.remove(outputId);
  },
});

// Get day of all method names on Outputs
const OUTPUTS_METHODS = _.pluck([
  insertOutput,
  updateWeight,
  remove,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 outputs operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(OUTPUTS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
