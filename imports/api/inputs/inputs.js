import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/factory';
import faker from 'faker';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Days } from '../days/days.js';

class InputsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    return result;
  }
  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }
  remove(selector) {
    const inputs = this.find(selector).fetch();
    const result = super.remove(selector);
    return result;
  }
}

export const Inputs = new InputsCollection('Inputs');

// Deny all client-side updates since we will be using methods to manage this collection
Inputs.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Inputs.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  dayId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  text: {
    type: String,
    max: 100,
  },
  createdAt: {
    type: Date,
    denyUpdate: true,
  },
  checked: {
    type: Boolean,
    defaultValue: false,
  },
});

Inputs.attachSchema(Inputs.schema);

// This represents the keys from Days objects that should be published
// to the client. If we add secret properties to Day objects, don't day
// them here to keep them private to the server.
Inputs.publicFields = {
  dayId: 1,
  text: 1,
  createdAt: 1,
  checked: 1,
};

// INPUT This factory has a name - do we have a code style for this?
//   - usually I've used the singular, sometimes you have more than one though, like
//   'input', 'emptyInput', 'checkedInput'
Factory.define('input', Inputs, {
  dayId: () => Factory.get('day'),
  text: () => faker.lorem.sentence(),
  createdAt: () => new Date(),
});

Inputs.helpers({
  day() {
    return Days.findOne(this.dayId);
  },
  editableBy(userId) {
    return this.day().editableBy(userId);
  },
});
