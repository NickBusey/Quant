import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Outputs } from '../../api/outputs/outputs.js';
import { Inputs } from '../../api/inputs/inputs.js';

import './export.html';

Template.App_export.onCreated(function daysShowPageOnCreated() {
  this.getDate = () => FlowRouter.getParam('date');

  this.autorun(() => {
    this.subscribe('outputs');
    this.subscribe('inputs');
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
  exportReady() {
    const instance = Template.instance();
    return instance.subscriptionsReady();
  },
  outputs() {
    var outputs = Outputs.find({},{
      sort: [ "date" ]
    }).fetch();
    for (var ii in outputs) {
      var output = outputs[ii];
      var inputs = Inputs.find({date:output.date}).fetch();
      console.log(inputs);
      output.inputs = inputs;
    }
    console.log(outputs);
    return outputs;
  }
});
