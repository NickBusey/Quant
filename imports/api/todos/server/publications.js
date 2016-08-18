/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Todos } from '../todos.js';
import { Days } from '../../days/days.js';

Meteor.publishComposite('todos.inDay', function todosInDay(dayId) {
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
      // used to drive the child queries to get the todos
      const options = {
        fields: { _id: 1 },
      };

      return Days.find(query, options);
    },

    children: [{
      find(day) {
        return Todos.find({ dayId: day._id }, { fields: Todos.publicFields });
      },
    }],
  };
});
