import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Days } from '../../api/days/days.js';

import { dayRenderHold } from '../launch-screen.js';
import './days-show-page.html';

// Components used inside the template
import './app-not-found.js';
import '../components/days-show.js';

Template.Days_show_page.onCreated(function daysShowPageOnCreated() {
  this.getDayId = () => FlowRouter.getParam('_id');

  this.autorun(() => {
    this.subscribe('inputs.inDay', this.getDayId());
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
    const dayId = instance.getDayId();
    return Days.findOne(dayId) ? [dayId] : [];
  },
  dayArgs(dayId) {
    const instance = Template.instance();
    // By finding the day with only the `_id` field set, we don't create a dependency on the
    // `day.incompleteCount`, and avoid re-rendering the inputs when it changes
    const day = Days.findOne(dayId, { fields: { _id: true } });
    const inputs = day && day.inputs();
    return {
      inputsReady: instance.subscriptionsReady(),
      // We pass `day` (which contains the full day, with all fields, as a function
      // because we want to control reactivity. When you check a input item, the
      // `day.incompleteCount` changes. If we didn't do this the entire day would
      // re-render whenever you checked an item. By isolating the reactiviy on the day
      // to the area that cares about it, we stop it from happening.
      day() {
        return Days.findOne(dayId);
      },
      inputs,
    };
  },
});
