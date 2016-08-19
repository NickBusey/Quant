import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Mongo } from 'meteor/mongo';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tracker } from 'meteor/tracker';
import { $ } from 'meteor/jquery';
import { Outputs } from '../../api/outputs/outputs.js';

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
  insertInput,
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
  },
  weight() {
    var output = Outputs.findOne({date:that.data.date});
    if (output) {
      return output.weight;
    }
  }
});

Template.Days_show.events({
  'keyup input[type=text]': _.throttle(function weightItemKeyUpInner(event) {
    updateWeight.call({
      weight: event.target.value,
      date: that.data.date
    }, displayError);
  }, 300),
});
