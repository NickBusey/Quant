import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
import { Todos } from '../todos/todos.js';

class DaysCollection extends Mongo.Collection {
  insert(day, callback) {
    const ourDay = day;
    ourDay.name = `Day 1`;

    return super.insert(ourDay, callback);
  }
  remove(selector, callback) {
    Todos.remove({ dayId: selector });
    return super.remove(selector, callback);
  }
}

export const Days = new DaysCollection('Days');

// Deny all client-side updates since we will be using methods to manage this collection
Days.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Days.schema = new SimpleSchema({
  _id: { type: String, regEx: SimpleSchema.RegEx.Id },
  name: { type: String },
  incompleteCount: { type: Number, defaultValue: 0 },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
});

Days.attachSchema(Days.schema);

// This represents the keys from Days objects that should be published
// to the client. If we add secret properties to Day objects, don't day
// them here to keep them private to the server.
Days.publicFields = {
  name: 1,
  incompleteCount: 1,
  userId: 1,
};

Factory.define('day', Days, {});

Days.helpers({
  // A day is considered to be private if it has a userId set
  isPrivate() {
    return !!this.userId;
  },
  isLastPublicDay() {
    const publicDayCount = Days.find({ userId: { $exists: false } }).count();
    return !this.isPrivate() && publicDayCount === 1;
  },
  editableBy(userId) {
    if (!this.userId) {
      return true;
    }

    return this.userId === userId;
  },
  todos() {
    return Todos.find({ dayId: this._id }, { sort: { createdAt: -1 } });
  },
});
