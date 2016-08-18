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
  updateName,
  makePublic,
  makePrivate,
  remove,
} from '../../api/days/methods.js';

import {
  insert,
} from '../../api/inputs/methods.js';

import { displayError } from '../lib/errors.js';

import { FlowRouter } from 'meteor/kadira:flow-router';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { TAPi18n } from 'meteor/tap:i18n';

Template.Days_show.helpers({
  inputArgs(input) {
    const instance = Template.instance();
    return {
      input,
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
      instance.saveDay();
    }
  },

  'submit .js-edit-form'(event, instance) {
    event.preventDefault();
    instance.saveDay();
  },

  // handle mousedown otherwise the blur handler above will swallow the click
  // on iOS, we still require the click event so handle both
  'mousedown .js-cancel, click .js-cancel'(event, instance) {
    event.preventDefault();
    instance.state.set('editing', false);
  },

  // This is for the mobile dropdown
  'change .day-edit'(event, instance) {
    const target = event.target;
    if ($(target).val() === 'edit') {
      instance.editDay();
    } else if ($(target).val() === 'delete') {
      instance.deleteDay();
    } else {
      instance.toggleDayPrivacy();
    }

    target.selectedIndex = 0;
  },

  'click .js-edit-day'(event, instance) {
    instance.editDay();
  },

  'click .js-toggle-day-privacy'(event, instance) {
    instance.toggleDayPrivacy();
  },

  'click .js-delete-day'(event, instance) {
    instance.deleteDay();
  },

  'click .js-input-add'(event, instance) {
    instance.$('.js-input-new input').focus();
  },

  'submit .js-input-new'(event) {
    event.preventDefault();

    const $input = $(event.target).find('[type=text]');
    if (!$input.val()) {
      return;
    }

    insert.call({
      date: this.date,
      text: $input.val(),
    }, displayError);

    $input.val('');
  },
});
