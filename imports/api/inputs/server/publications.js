/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Inputs } from '../inputs.js';
import { Days } from '../../days/days.js';

Meteor.publishComposite('inputs.inDay', function inputsInDay(dayId) {
  new SimpleSchema({
    dayId: { type: String },
  }).validate({ dayId });

  const userId = this.userId;

  return {
    find() {
      const query = {
        _id: dayId,
        $or: [{ userId: { $exists: false } }, { userId }],
      };

      // We only need the _id field in this query, since it's only
      // used to drive the child queries to get the inputs
      const options = {
        fields: { _id: 1 },
      };

      return Days.find(query, options);
    },

    children: [{
      find(day) {
        return Inputs.find({ dayId: day._id }, { fields: Inputs.publicFields });
      },
    }],
  };
});
