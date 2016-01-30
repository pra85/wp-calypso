/**
 * External dependencies
 */
import { fromJS } from 'immutable';
import { DESERIALIZE, SERIALIZE } from 'state/action-types';

/**
 * Internal dependencies
 */
import ActionTypes from '../action-types';
import { isValidStateWithSchema } from 'state/utils';
import schema from './schema';

export const initialState = fromJS( {
	isActivating: false,
	hasActivated: false,
	currentThemes: {}
} );

export default ( state = initialState, action ) => {
	switch ( action.type ) {
		case ActionTypes.RECEIVE_CURRENT_THEME:
			return state.setIn( [ 'currentThemes', action.site.ID ], {
				name: action.themeName,
				id: action.themeId,
				cost: action.themeCost
			} );
		case ActionTypes.ACTIVATE_THEME:
			return state.set( 'isActivating', true );
		case ActionTypes.ACTIVATED_THEME:
			return state
				.set( 'isActivating', false )
				.set( 'hasActivated', true )
				.setIn( [ 'currentThemes', action.site.ID ], action.theme );
		case ActionTypes.CLEAR_ACTIVATED_THEME:
			return state.set( 'hasActivated', false );
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, schema ) ) {
				return fromJS( state );
			}
			return initialState;
		case SERIALIZE:
			return state.toJS();
	}
	return state;
};
