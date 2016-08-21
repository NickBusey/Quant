import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Outputs } from '../../api/outputs/outputs.js';

import './export.html';

Template.App_export.onCreated(function daysShowPageOnCreated() {
  this.getDate = () => FlowRouter.getParam('date');

  this.autorun(() => {
    this.subscribe('outputs');
  });
});

// Template.App_export.onRendered(function daysShowPageOnRendered() {
//   this.autorun(() => {
//     if (this.subscriptionsReady()) {
//       exportRenderHold.release();
//     }
//   });
// });

Template.App_export.helpers({
  // We use #each on an array of one item so that the "day" template is
  // removed and a new copy is added when changing days, which is
  // important for animation purposes.
  dayIdArray() {
    const instance = Template.instance();
    const dayId = instance.getDate();
    return Days.findOne(dayId) ? [dayId] : [];
  },
  exportReady() {
    const instance = Template.instance();
    return instance.subscriptionsReady();
  },
  outputs() {
    return Outputs.find({},{
      sort: [ "date" ]
    });
  }
});
