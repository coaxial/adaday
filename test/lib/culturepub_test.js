/*eslint-env node, mocha */
"use strict";

const chai = require('chai');
const assert = chai.assert;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const nock = require('nock');

const cp = require('../../lib/culturepub.js').create();

describe('CulturePub', () => {
  const api_host = 'http://api.cbnews.webtv.flumotion.com';
  const endpoint_regex = /pods\/\d{3}\d?\d?/

  describe('#getAd', () => {
    context('with a valid ID', () => {
      beforeEach(function mockApi() {
        nock(api_host)
        .get(endpoint_regex)
        .query({extended: true})
        .replyWithFile(200, 'fixtures/cp_valid_id.json')
      });

      it('has the URL to the video file', () => {
        return assert.eventually.deepPropertyVal(
          cp.getAd(),
          'video_url',
          'http://wpc.cf8d.edgecastcdn.net/80CF8D/cbnews/video/mp4/hd/5316_017.mp4'
        );
      });

      it("has the advertiser's name", () => {
        return assert.eventually.deepPropertyVal(
          cp.getAd(),
          'advertiser_name',
          'Keiju'
        );
      });

      it('has the country', () => {
        return assert.eventually.deepPropertyVal(
          cp.getAd(),
          'ad_country',
          'Finlande'
        );
      });

      it('has the year', () => {
        return assert.eventually.deepPropertyVal(
          cp.getAd(),
          'ad_year',
          '1996'
        );
      });

      it('has the agency', () => {
        return assert.eventually.deepPropertyVal(
          cp.getAd(),
          'ad_agency',
          'Hasan & Partners'
        );
      });

      it('has the director', () => {
        return assert.eventually.deepPropertyVal(
          cp.getAd(),
          'ad_director',
          'Pehr Seth'
        );
      });

      it('has the title', () => {
        return assert.eventually.deepPropertyVal(
          cp.getAd(),
          'ad_title',
          'Summerdress'
        );
      });
    });

    context('with an invalid ID', () => {
      beforeEach(function mockApi() {
        nock(api_host)
        .get(endpoint_regex)
        .query({extended: true})
        .replyWithFile(404, 'fixtures/cp_invalid_id.json')

        .get(endpoint_regex)
        .query({extended: true})
        .replyWithFile(200, 'fixtures/cp_valid_id.json');
      });
      
      it('retries', () => {
        return assert.eventually.deepPropertyVal(
          cp.getAd(),
          'ad_title',
          'Summerdress'
        );
      });
    });

    context('with any other HTTP error', () => {
      beforeEach(function mockApi() {
        nock(api_host)
        .get(endpoint_regex)
        .query({extended: true})
        .reply(500, 'Internal server error');
      });

      it('rejects the promise', () => {
        return assert.isRejected(cp.getAd());
      });
    });
  });  
});
