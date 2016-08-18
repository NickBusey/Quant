/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Inputs } from '../inputs.js';
import { Days } from '../../days/days.js';

Meteor.publishComposite('inputs.inDate', function inputsInDay(date) {
  new SimpleSchema({
    date: { type: String },
  }).validate({ date });

  const userId = this.userId;

  return {
    find() {
      const query = {
        date: date,
      };

      // We only need the _id field in this query, since it's only
      // used to drive the child queries to get the inputs
      const options = {
        fields: Inputs.publicFields,
      };

      return Inputs.find(query, options);
    }
  };
});
