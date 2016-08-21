import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/factory';
import faker from 'faker';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';

class InputsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const result = super.insert(doc, callback);
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
  date: {
    type: String,
  },
  text: {
    type: String,
    max: 100,
  },
  count: {
    type: Number,
    decimal: true
  },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id },
});

Inputs.attachSchema(Inputs.schema);

// This represents the keys from Days objects that should be published
// to the client. If we add secret properties to Day objects, don't day
// them here to keep them private to the server.
Inputs.publicFields = {
  date: 1,
  text: 1,
  count: 1,
};

// INPUT This factory has a name - do we have a code style for this?
//   - usually I've used the singular, sometimes you have more than one though, like
//   'input', 'emptyInput', 'checkedInput'
Factory.define('input', Inputs, {
  date: () => new Date().toJSON().slice(0,10),
  text: () => faker.lorem.sentence(),
});
