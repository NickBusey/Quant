import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';

import './inputs-item.html';
import { Inputs } from '../../api/inputs/inputs.js';

import {
  setCheckedStatus,
  updateText,
  remove,
} from '../../api/inputs/methods.js';

import { displayError } from '../lib/errors.js';

// Template.Inputs_item.onCreated(function inputsItemOnCreated() {
//   this.autorun(() => {
//     new SimpleSchema({
//       input: { type: Inputs._helpers },
//       date: { type: String },
//       editing: { type: Boolean, optional: true },
//       onEditingChange: { type: Function },
//     }).validate(Template.currentData());
//   });
// });

Template.Inputs_item.helpers({
  checkedClass(input) {
    return input.checked && 'checked';
  },
  editingClass(editing) {
    return editing && 'editing';
  },
});

Template.Inputs_item.events({
  'change [type=checkbox]'(event) {
    const checked = $(event.target).is(':checked');

    setCheckedStatus.call({
      inputId: this.input._id,
      newCheckedStatus: checked,
    });
  },

  'focus input[type=text]'() {
    this.onEditingChange(true);
  },

  'blur input[type=text]'() {
    if (this.editing) {
      this.onEditingChange(false);
    }
  },

  'keydown input[type=text]'(event) {
    // ESC or ENTER
    if (event.which === 27 || event.which === 13) {
      event.preventDefault();
      event.target.blur();
    }
  },

  // update the text of the item on keypress but throttle the event to ensure
  // we don't flood the server with updates (handles the event at most once
  // every 300ms)
  'keyup input[type=text]': _.throttle(function inputsItemKeyUpInner(event) {
    updateText.call({
      inputId: this.input._id,
      newText: event.target.value,
    }, displayError);
  }, 300),

  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-delete-item, click .js-delete-item'() {
    remove.call({
      inputId: this.input._id,
    }, displayError);
  },
});
