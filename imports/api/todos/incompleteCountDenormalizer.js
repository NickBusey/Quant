import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';

import { Todos } from './todos.js';
import { Days } from '../days/days.js';

const incompleteCountDenormalizer = {
  _updateDay(dayId) {
    // Recalculate the correct incomplete count direct from MongoDB
    const incompleteCount = Todos.find({
      dayId,
      checked: false,
    }).count();

    Days.update(dayId, { $set: { incompleteCount } });
  },
  afterInsertTodo(todo) {
    this._updateDay(todo.dayId);
  },
  afterUpdateTodo(selector, modifier) {
    // We only support very limited operations on todos
    check(modifier, { $set: Object });

    // We can only deal with $set modifiers, but that's all we do in this app
    if (_.has(modifier.$set, 'checked')) {
      Todos.find(selector, { fields: { dayId: 1 } }).forEach(todo => {
        this._updateDay(todo.dayId);
      });
    }
  },
  // Here we need to take the day of todos being removed, selected *before* the update
  // because otherwise we can't figure out the relevant day id(s) (if the todo has been deleted)
  afterRemoveTodos(todos) {
    todos.forEach(todo => this._updateDay(todo.dayId));
  },
};

export default incompleteCountDenormalizer;
