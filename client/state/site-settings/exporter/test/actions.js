/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Chai, { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	EXPORT_ADVANCED_SETTINGS_FETCH,
	EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
} from 'state/action-types';
import {
	advancedSettingsFetch,
	advancedSettingsReceive,
	advancedSettingsFail
} from '../actions';

/**
 * Test setup
 */
Chai.use( sinonChai );

const sampleAdvancedSettings = {
	feedback: [],
	page: {
		authors: [ { ID: 95752520, name: 'Test User', login: 'testuser' } ],
		export_date_options: [
			{ year: '2015', month: '11' },
			{ year: '2015', month: '10' }
		],
		statuses: [ { label: 'Published', name: 'publish' } ]
	},
	post: {
		categories: [ { name: 'Uncategorized' } ],
		authors: [ { ID: 95752520, name: 'Test User', login: 'testuser' } ],
		export_date_options: [
			{ year: '2015', month: '11' },
			{ year: '2015', month: '10' }
		],
		statuses: [ { label: 'Published', name: 'publish' } ]
	}
};

describe( '#advancedSettingsFetch()', () => {
	const spy = sinon.spy();

	before( () => {
		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( '/rest/v1.1/sites/100658273/exports/settings' )
			.reply( 200, sampleAdvancedSettings );
	} );

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.restore();
	} );

	it( 'should dispatch fetch action when thunk triggered', () => {
		advancedSettingsFetch( 100658273 )( spy );

		expect( spy ).to.have.been.calledWith( {
			type: EXPORT_ADVANCED_SETTINGS_FETCH,
			siteId: 100658273
		} );
	} );

	it( 'should dispatch receive action when request completes', ( done ) => {
		advancedSettingsFetch( 100658273 )( spy ).then( () => {
			expect( spy ).to.have.been.calledWithMatch( {
				type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
				siteId: 100658273,
				advancedSettings: sampleAdvancedSettings
			} );

			done();
		} ).catch( done );
	} );

	it( 'should dispatch fail action when request fails', ( done ) => {
		advancedSettingsFetch( 0 )( spy ).then( () => {
			expect( spy ).to.have.been.calledWithMatch( {
				type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
				siteId: 0
			} );

			done();
		} ).catch( done );
	} );
} );

describe( '#advancedSettingsReceive()', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	it( 'should return an action object', () => {
		const action = advancedSettingsReceive( 100658273, sampleAdvancedSettings );

		expect( action ).to.deep.equal( {
			type: EXPORT_ADVANCED_SETTINGS_RECEIVE,
			siteId: 100658273,
			advancedSettings: sampleAdvancedSettings
		} );
	} );
} );

describe( '#advancedSettingsFail()', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	it( 'should return an action object', () => {
		const error = new Error( 'An error occurred fetching advanced settings' );
		const action = advancedSettingsFail( 100658273, error );

		expect( action ).to.deep.equal( {
			type: EXPORT_ADVANCED_SETTINGS_FETCH_FAIL,
			siteId: 100658273,
			error
		} );
	} );
} );
