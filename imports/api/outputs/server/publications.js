/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Outputs } from '../outputs.js';
import { Days } from '../../days/days.js';

Meteor.publishComposite('outputs.inDate', function outputsInDay(date) {
  new SimpleSchema({
    date: { type: String },
  }).validate({ date });

  const userId = this.userId;

  return {
    find() {
      const query = {
        date: date,
        userId: userId
      };

      // We only need the _id field in this query, since it's only
      // used to drive the child queries to get the outputs
      const options = {
        fields: Outputs.publicFields,
      };

      return Outputs.find(query, options);
    }
  };
});

Meteor.publishComposite('outputs', function() {

  const userId = this.userId;

  return {
    find() {
      const query = {
        userId: userId
      };

      // We only need the _id field in this query, since it's only
      // used to drive the child queries to get the outputs
      const options = {
        fields: Outputs.publicFields,
      };

      return Outputs.find(query, options);
    }
  };
});
