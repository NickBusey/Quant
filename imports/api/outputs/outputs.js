import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/factory';
import faker from 'faker';

import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Days } from '../days/days.js';

class OutputsCollection extends Mongo.Collection {
  insert(doc, callback) {
    const result = super.insert(doc, callback);
    return result;
  }
  update(selector, modifier) {
    const result = super.update(selector, modifier);
    return result;
  }
  remove(selector) {
    const outputs = this.find(selector).fetch();
    const result = super.remove(selector);
    return result;
  }
}

export const Outputs = new OutputsCollection('Outputs');

// Deny all client-side updates since we will be using methods to manage this collection
Outputs.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Outputs.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  date: {
    type: String,
  },
  weight: {
    type: Number,
    min: 1,
  },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id },
});

Outputs.attachSchema(Outputs.schema);

// This represents the keys from Days objects that should be published
// to the client. If we add secret properties to Day objects, don't day
// them here to keep them private to the server.
Outputs.publicFields = {
  date: 1,
  weight: 1,
};

// OUTPUT This factory has a name - do we have a code style for this?
//   - usually I've used the singular, sometimes you have more than one though, like
//   'output', 'emptyOutput', 'checkedOutput'
Factory.define('output', Outputs, {
  date: () => new Date().toJSON().slice(0,10),
  weight: () => faker.lorem.number(),
});
