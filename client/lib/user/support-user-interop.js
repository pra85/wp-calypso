/**
 * External dependencies
 */
import { compose } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import User from 'lib/user';
import userSettings from 'lib/user-settings';

import { supportUserTokenFetch, supportUserRestore } from 'state/support/actions';
import { getSupportState } from 'state/support/selectors';

/**
 * Connects the Redux store and the low-level support user functions
 * of the wpcom library. When the support user token is changed in the
 * Redux store, the token is sent to the wpcom library. If a token
 * error occurs in a wpcom API call, the error is forwarded to the
 * Redux store via an action. This also forces any data refreshes
 * that are required due to the change of user.
 */
export default function( reduxStore ) {
	const user = new User();
	const dispatch = reduxStore.dispatch.bind( reduxStore );
	const getState = reduxStore.getState.bind( reduxStore );

	/**
	 * Called when the support user token was updated in wpcom
	 */
	const onTokenChange = () => {
		user.clear();
		user.fetch();
		userSettings.fetchSettings();
	}

	/**
	 * Called when an API call fails due to a token error
	 * @param  {error} error  The token error
	 */
	const onTokenError = ( error ) => {
		reduxStore.dispatch( supportUserRestore( error ) );
	}

	/**
	 * Follow any changes to the support token in the Redux store and
	 * update the wpcom API interceptor accordingly.
	 */
	reduxStore.subscribe( () => {
		const { supportUser, supportToken } = getSupportState( getState() );

		if ( wpcom.setSupportUserToken( supportUser, supportToken ) ) {
			onTokenChange();
		}
	} );

	/**
	 * For testing during development. Adds support user functions to
	 * the dev console. The UI will replace these functions in future PRs.
	 */
	window.supportUser = {
		login: compose( dispatch, supportUserTokenFetch ),
		logout: compose( dispatch, supportUserRestore )
	};
}
