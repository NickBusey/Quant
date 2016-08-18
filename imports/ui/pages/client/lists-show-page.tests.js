/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/factory';
import { Random } from 'meteor/random';
import { chai } from 'meteor/practicalmeteor:chai';
import StubCollections from 'meteor/hwillson:stub-collections';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { $ } from 'meteor/jquery';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { sinon } from 'meteor/practicalmeteor:sinon';


import { withRenderedTemplate } from '../../test-helpers.js';
import '../lists-show-page.js';

import { inputs } from '../../../api/inputs/inputs.js';
import { Lists } from '../../../api/lists/lists.js';

describe('Lists_show_page', function () {
  const listId = Random.id();

  beforeEach(function () {
    StubCollections.stub([inputs, Lists]);
    Template.registerHelper('_', key => key);
    sinon.stub(FlowRouter, 'getParam', () => listId);
    sinon.stub(Meteor, 'subscribe', () => ({
      subscriptionId: 0,
      ready: () => true,
    }));
  });

  afterEach(function () {
    StubCollections.restore();
    Template.deregisterHelper('_');
    FlowRouter.getParam.restore();
    Meteor.subscribe.restore();
  });

  it('renders correctly with simple data', function () {
    Factory.create('list', { _id: listId });
    const timestamp = new Date();
    const inputs = _.times(3, i => Factory.create('input', {
      listId,
      createdAt: new Date(timestamp - (3 - i)),
    }));

    withRenderedTemplate('Lists_show_page', {}, el => {
      const inputsText = inputs.map(t => t.text).reverse();
      const renderedText = $(el).find('.list-items input[type=text]')
        .map((i, e) => $(e).val())
        .toArray();
      chai.assert.deepEqual(renderedText, inputsText);
    });
  });
});
