import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/factory';
import { Inputs } from '../inputs/inputs.js';


class DaysCollection extends Mongo.Collection {
  insert(day, callback) {
    const ourDay = day;
    ourDay.date = new Date().toJSON().slice(0,10);
    ourDay.createdAt = ourDay.createdAt || new Date();
    ourDay.userId = Meteor.userId();

    return super.insert(ourDay, callback);
  }
  remove(selector, callback) {
    Inputs.remove({ dayId: selector });
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
  date: { 
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    denyUpdate: true,
  },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
});

Days.attachSchema(Days.schema);

// This represents the keys from Days objects that should be published
// to the client. If we add secret properties to Day objects, don't day
// them here to keep them private to the server.
Days.publicFields = {
  date: 1,
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
  inputs() {
    return Inputs.find({ dayId: this._id }, { sort: { createdAt: -1 } });
  },
});
