import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { $ } from 'meteor/jquery';

import './days-show.html';

// Component used in the template
import './inputs-item.js';

import {
  insertInput,
  updateText,
} from '../../api/inputs/methods.js';

import {
  updateWeight,
} from '../../api/outputs/methods.js';

import { displayError } from '../lib/errors.js';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { TAPi18n } from 'meteor/tap:i18n';

var that = false;

Template.Days_show.onCreated(function dayShowOnCreated() {
  this.autorun(() => {
    new SimpleSchema({
      date: { type: String },
      inputsReady: { type: Boolean },
      inputs: { type: Mongo.Cursor },
      weight: { type: Number }
    }).validate(Template.currentData());
  });
  that = this;
  this.state = new ReactiveDict();
  this.state.setDefault({
    editing: false,
    editingInput: false,
  });
});

Template.Days_show.helpers({
  inputArgs(input) {
    const instance = Template.instance();
    return {
      input,
      editing: instance.state.equals('editingInput', input._id),
      onEditingChange(editing) {
        instance.state.set('editingInput', editing ? input._id : false);
      },
    };
  }
});

Template.Days_show.events({
  'click .js-cancel'(event, instance) {
    instance.state.set('editing', false);
  },

  'keydown input[type=text]'(event) {
    // ESC
    if (event.which === 27) {
      event.preventDefault();
      $(event.target).blur();
    }
  },

  'blur input[type=text]'(event, instance) {
    // if we are still editing (we haven't just clicked the cancel button)
    if (instance.state.get('editing')) {
      instance.saveList();
    }
  },

  'submit .js-edit-form'(event, instance) {
    event.preventDefault();
    instance.saveList();
  },

  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-cancel, click .js-cancel'(event, instance) {
    event.preventDefault();
    instance.state.set('editing', false);
  },

  // This is for the mobile dropdown
  'change .list-edit'(event, instance) {
    const target = event.target;
    if ($(target).val() === 'edit') {
      instance.editList();
    } else if ($(target).val() === 'delete') {
      instance.deleteList();
    } else {
      instance.toggleListPrivacy();
    }

    target.selectedIndex = 0;
  },

  'click .js-edit-list'(event, instance) {
    instance.editList();
  },

  'click .js-toggle-list-privacy'(event, instance) {
    instance.toggleListPrivacy();
  },

  'click .js-delete-list'(event, instance) {
    instance.deleteList();
  },

  'click .js-input-add'(event, instance) {
    instance.$('.js-todo-new input').focus();
  },

  'submit .js-input-new'(event) {
    event.preventDefault();

    const $input = $(event.target).find('[type=text]');
    if (!$input.val()) {
      return;
    }

    insertInput.call({
      date: that.data.date,
      text: $input.val(),
    }, displayError);

    $input.val('');
  },

  'keyup input.weightInput[type=text]': _.throttle(function weightItemKeyUpInner(event) {
    updateWeight.call({
      weight: event.target.value,
      date: that.data.date
    }, displayError);
  }, 300),
});
