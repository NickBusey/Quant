/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

import { Days } from '../days.js';

Meteor.publish('days', function() {
  if (!this.userId) {
    return this.ready();
  }

  return Days.find({
    // userId: this.userId,
  }, {
    fields: Days.publicFields,
  });
});
