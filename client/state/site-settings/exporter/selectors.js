/**
 * Internal dependencies
 */
import { States } from './constants.js';

/**
 * Indicates whether an export activity is in progress.
 *
 * @param  {Object} state    Global state tree
 * @return {boolean}         true if activity is in progress
 */
export function shouldShowProgress( state ) {
	const exportingState = getUIState( state ).exportingState;

	return ( exportingState === States.STARTING || exportingState === States.EXPORTING );
}

/**
 * Return the exporter UI state as a plain JS object.
 *
 * @param  {Object} state    Global state tree
 * @return {Object}          Exporter UI state
 */
export function getUIState( state ) {
	return state.siteSettings.exporter.ui.toJS();
}
