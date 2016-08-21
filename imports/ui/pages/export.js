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
      var date = new Date(output.date);
      console.log(date);
      date.setDate(date.getDate() - 1);
      console.log(date);
      var yesterday = date.toJSON().slice(0,10);
      console.log(date);
      var inputs = Inputs.find({date:yesterday}).fetch();
      console.log(inputs);
      output.inputs = inputs;
    }
    console.log(outputs);
    return outputs;
  }
});
