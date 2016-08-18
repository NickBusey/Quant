import { Mongo } from 'meteor/mongo';
import { Factory } from 'meteor/factory';
import faker from 'faker';

import incompleteCountDenormalizer from './incompleteCountDenormalizer.js';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Days } from '../days/days.js';

class TodosCollection extends Mongo.Collection {
  insert(doc, callback) {
    const ourDoc = doc;
    ourDoc.createdAt = ourDoc.createdAt || new Date();
    const result = super.insert(ourDoc, callback);
    incompleteCountDenormalizer.afterInsertTodo(ourDoc);
    return result;
  }
  update(selector, modifier) {
    const result = super.update(selector, modifier);
    incompleteCountDenormalizer.afterUpdateTodo(selector, modifier);
    return result;
  }
  remove(selector) {
    const todos = this.find(selector).fetch();
    const result = super.remove(selector);
    incompleteCountDenormalizer.afterRemoveTodos(todos);
    return result;
  }
}

export const Todos = new TodosCollection('Todos');

// Deny all client-side updates since we will be using methods to manage this collection
Todos.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

Todos.schema = new SimpleSchema({
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

Todos.attachSchema(Todos.schema);

// This represents the keys from Days objects that should be published
// to the client. If we add secret properties to Day objects, don't day
// them here to keep them private to the server.
Todos.publicFields = {
  dayId: 1,
  text: 1,
  createdAt: 1,
  checked: 1,
};

// TODO This factory has a name - do we have a code style for this?
//   - usually I've used the singular, sometimes you have more than one though, like
//   'todo', 'emptyTodo', 'checkedTodo'
Factory.define('todo', Todos, {
  dayId: () => Factory.get('day'),
  text: () => faker.lorem.sentence(),
  createdAt: () => new Date(),
});

Todos.helpers({
  day() {
    return Days.findOne(this.dayId);
  },
  editableBy(userId) {
    return this.day().editableBy(userId);
  },
});
