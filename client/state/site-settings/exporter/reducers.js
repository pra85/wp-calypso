/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	EXPORT_ADVANCED_SETTINGS_RECEIVE,
	SET_EXPORT_POST_TYPE,
	REQUEST_START_EXPORT,
	REPLY_START_EXPORT,
	FAIL_EXPORT,
	COMPLETE_EXPORT
} from 'state/action-types';

import { States } from './constants';

const initialUIState = Immutable.fromJS( {
	exportingState: States.READY,
	postType: null
} );

/**
 * Reducer for managing the exporter UI
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function ui( state = initialUIState, action ) {
	switch ( action.type ) {
		case SET_EXPORT_POST_TYPE:
			return state.set( 'postType', action.postType );

		case REQUEST_START_EXPORT:
			return state.set( 'exportingState', States.STARTING );

		case REPLY_START_EXPORT:
			return state.set( 'exportingState', States.EXPORTING );

		case FAIL_EXPORT:
		case COMPLETE_EXPORT:
			return state.set( 'exportingState', States.READY );
	}

	return state;
}

/**
 * Tracks available advanced settings for sites.
 * @param  {Object} state  Current global state tree
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function advancedSettings( state = {}, action ) {
	switch ( action.type ) {
		case EXPORT_ADVANCED_SETTINGS_RECEIVE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.advancedSettings
			} );
	}

	return state;
}

export default combineReducers( {
	ui,
	advancedSettings
} );
