import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Inputs } from '../../api/inputs/inputs.js';

import { dayRenderHold } from '../launch-screen.js';
import './days-show-page.html';

// Components used inside the template
import './app-not-found.js';
import '../components/days-show.js';

Template.Days_show_page.onCreated(function daysShowPageOnCreated() {
  this.getDate = () => FlowRouter.getParam('date');

  this.autorun(() => {
    console.log(this.getDate());
    this.subscribe('inputs.inDate', this.getDate());
  });
});

Template.Days_show_page.onRendered(function daysShowPageOnRendered() {
  this.autorun(() => {
    if (this.subscriptionsReady()) {
      dayRenderHold.release();
    }
  });
});

Template.Days_show_page.helpers({
  // We use #each on an array of one item so that the "day" template is
  // removed and a new copy is added when changing days, which is
  // important for animation purposes.
  dayIdArray() {
    const instance = Template.instance();
    const dayId = instance.getDate();
    return Days.findOne(dayId) ? [dayId] : [];
  },
  listArgs(listId) {
    const instance = Template.instance();
    const inputs = Inputs.find({})
    const date = FlowRouter.getParam('date');
    return {
      inputsReady: instance.subscriptionsReady(),
      inputs,
      date
    };
  },
});
