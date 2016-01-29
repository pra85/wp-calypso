/**
 * External dependencies
 */
import assign from 'lodash/object/assign';
import mapValues from 'lodash/object/mapValues';

/**
 * Internal dependencies
 */
import Helper from 'lib/themes/helpers';

export function addTracking( options ) {
	return mapValues( options, appendActionTracking );
}

function appendActionTracking( option, name ) {
	const { action } = option;

	if ( ! action ) {
		return option;
	}

	return assign( {}, option, {
		action: trackedAction( action, name )
	} );
}

function trackedAction( action, name ) {
	return t => {
		action( t );
		Helper.trackClick( 'more button', name );
	};
}
