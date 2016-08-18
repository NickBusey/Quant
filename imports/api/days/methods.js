import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { _ } from 'meteor/underscore';

import { Days } from './days.js';

const DAY_ID_ONLY = new SimpleSchema({
  dayId: Days.simpleSchema().schema('_id'),
}).validator({ clean: true, filter: false });

export const insert = new ValidatedMethod({
  name: 'days.insert',
  validate: new SimpleSchema({}).validator(),
  run() {
    return Days.insert({});
  },
});

export const makePrivate = new ValidatedMethod({
  name: 'days.makePrivate',
  validate: DAY_ID_ONLY,
  run({ dayId }) {
    if (!this.userId) {
      throw new Meteor.Error('days.makePrivate.notLoggedIn',
        'Must be logged in to make private days.');
    }

    const day = Days.findOne(dayId);

    if (day.isLastPublicDay()) {
      throw new Meteor.Error('days.makePrivate.lastPublicDay',
        'Cannot make the last public day private.');
    }

    Days.update(dayId, {
      $set: { userId: this.userId },
    });
  },
});

export const makePublic = new ValidatedMethod({
  name: 'days.makePublic',
  validate: DAY_ID_ONLY,
  run({ dayId }) {
    if (!this.userId) {
      throw new Meteor.Error('days.makePublic.notLoggedIn',
        'Must be logged in.');
    }

    const day = Days.findOne(dayId);

    if (!day.editableBy(this.userId)) {
      throw new Meteor.Error('days.makePublic.accessDenied',
        'You don\'t have permission to edit this day.');
    }

    // XXX the security check above is not atomic, so in theory a race condition could
    // result in exposing private data
    Days.update(dayId, {
      $unset: { userId: true },
    });
  },
});

export const updateName = new ValidatedMethod({
  name: 'days.updateName',
  validate: new SimpleSchema({
    dayId: Days.simpleSchema().schema('_id'),
    newName: Days.simpleSchema().schema('name'),
  }).validator({ clean: true, filter: false }),
  run({ dayId, newName }) {
    const day = Days.findOne(dayId);

    if (!day.editableBy(this.userId)) {
      throw new Meteor.Error('days.updateName.accessDenied',
        'You don\'t have permission to edit this day.');
    }

    // XXX the security check above is not atomic, so in theory a race condition could
    // result in exposing private data

    Days.update(dayId, {
      $set: { name: newName },
    });
  },
});

export const remove = new ValidatedMethod({
  name: 'days.remove',
  validate: DAY_ID_ONLY,
  run({ dayId }) {
    const day = Days.findOne(dayId);

    if (!day.editableBy(this.userId)) {
      throw new Meteor.Error('days.remove.accessDenied',
        'You don\'t have permission to remove this day.');
    }

    // XXX the security check above is not atomic, so in theory a race condition could
    // result in exposing private data

    if (day.isLastPublicDay()) {
      throw new Meteor.Error('days.remove.lastPublicDay',
        'Cannot delete the last public day.');
    }

    Days.remove(dayId);
  },
});

// Get day of all method names on Days
const DAYS_METHODS = _.pluck([
  insert,
  makePublic,
  makePrivate,
  updateName,
  remove,
], 'name');

if (Meteor.isServer) {
  // Only allow 5 day operations per connection per second
  DDPRateLimiter.addRule({
    name(name) {
      return _.contains(DAYS_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
  }, 5, 1000);
}
