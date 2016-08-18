import './app-body.html';

import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Days } from '../../api/days/days.js';
import { Template } from 'meteor/templating';
import { ActiveRoute } from 'meteor/zimme:active-route';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { TAPi18n } from 'meteor/tap:i18n';

import { insert } from '../../api/days/methods.js';

import '../components/loading.js';

const CONNECTION_ISSUE_TIMEOUT = 5000;

// A store which is local to this file?
const showConnectionIssue = new ReactiveVar(false);

Meteor.startup(() => {
  // Only show the connection error box if it has been 5 seconds since
  // the app started
  setTimeout(() => {
    // FIXME:
    // Launch screen handle created in lib/router.js
    // dataReadyHold.release();

    // Show the connection error box
    showConnectionIssue.set(true);
  }, CONNECTION_ISSUE_TIMEOUT);
});

Template.App_body.onCreated(function appBodyOnCreated() {
  this.subscribe('days');
  var today = Days.find({
    date:new Date().toJSON().slice(0,10)
  });
  if (!today.count()) {
    const dayId = insert.call((err) => {
      if (err) {
        // At this point, we have already redirected to the new day page, but
        // for some reason the day didn't get created. This should almost never
        // happen, but it's good to handle it anyway.
        FlowRouter.go('App.home');
        alert(TAPi18n.__('Could not create day.')); // eslint-disable-line no-alert
      }
    });

    FlowRouter.go('Days.show', { _id: dayId });
  }
  this.state = new ReactiveDict();
  this.state.setDefault({
    menuOpen: false,
    userMenuOpen: false,
  });
});

Template.App_body.helpers({
  menuOpen() {
    const instance = Template.instance();
    return instance.state.get('menuOpen') && 'menu-open';
  },
  cordova() {
    return Meteor.isCordova && 'cordova';
  },
  emailLocalPart() {
    const email = Meteor.user().emails[0].address;
    return email.substring(0, email.indexOf('@'));
  },
  userMenuOpen() {
    const instance = Template.instance();
    return instance.state.get('userMenuOpen');
  },
  days() {
    return Days.find({ $or: [
      { userId: { $exists: false } },
      { userId: Meteor.userId() },
    ] });
  },
  activeDayClass(day) {
    const active = ActiveRoute.name('Days.show')
      && FlowRouter.getParam('_id') === day._id;

    return active && 'active';
  },
  connected() {
    if (showConnectionIssue.get()) {
      return Meteor.status().connected;
    }

    return true;
  },
  templateGestures: {
    'swipeleft .cordova'(event, instance) {
      instance.state.set('menuOpen', false);
    },
    'swiperight .cordova'(event, instance) {
      instance.state.set('menuOpen', true);
    },
  },
});

Template.App_body.events({
  'click .js-menu'(event, instance) {
    instance.state.set('menuOpen', !instance.state.get('menuOpen'));
  },

  'click .content-overlay'(event, instance) {
    instance.state.set('menuOpen', false);
    event.preventDefault();
  },

  'click .js-user-menu'(event, instance) {
    instance.state.set('userMenuOpen', !instance.state.get('userMenuOpen'));
    // stop the menu from closing
    event.stopImmediatePropagation();
  },

  'click #menu a'(event, instance) {
    instance.state.set('menuOpen', false);
  },

  'click .js-logout'() {
    Meteor.logout();

    // if we are on a private day, we'll need to go to a public one
    if (ActiveRoute.name('Days.show')) {
      // INPUT -- test this code path
      const day = Days.findOne(FlowRouter.getParam('_id'));
      if (day.userId) {
        FlowRouter.go('Days.show', Days.findOne({ userId: { $exists: false } }));
      }
    }
  },

  'click .js-new-day'() {
    const dayId = insert.call((err) => {
      if (err) {
        // At this point, we have already redirected to the new day page, but
        // for some reason the day didn't get created. This should almost never
        // happen, but it's good to handle it anyway.
        FlowRouter.go('App.home');
        alert(TAPi18n.__('Could not create day.')); // eslint-disable-line no-alert
      }
    });

    FlowRouter.go('Days.show', { _id: dayId });
  },
});
