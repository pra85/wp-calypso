// Reader Feed Subscription Store

// External dependencies
import { Map, fromJS } from 'immutable';
import debugModule from 'debug';

// Internal dependencies
import { action as actionTypes, state as stateTypes } from './constants';
import { createReducerStore } from 'lib/store';
import FeedSubscriptionHelper from './helper';

const debug = debugModule( 'calypso:reader-feed-subs' ); //eslint-disable-line no-unused-vars

const initialState = fromJS( {
	subscriptions: [],
	errors: [],
	perPage: 50,
	currentPage: 0,
	isLastPage: false,
	isFetching: false,
	subscriptionCount: 0,
} );

const subscriptionTemplate = Map( { // eslint-disable-line new-cap
	state: stateTypes.SUBSCRIBED
} );

const FeedSubscriptionStore = createReducerStore( ( state, payload ) => {
	switch ( payload.action.type ) {
		case actionTypes.FOLLOW_READER_FEED:
			return addSubscription( state, payload.action.data );

		case actionTypes.UNFOLLOW_READER_FEED:
			return removeSubscription( state, payload.action.data );
	}

	return state;
}, initialState );

FeedSubscriptionStore.isFetching = function() {
	const state = FeedSubscriptionStore.get();
	return state.get( 'isFetching' );
};

FeedSubscriptionStore.getLastError = function() {
	const state = FeedSubscriptionStore.get();
	return state.has( 'errors' ) ? state.get( 'errors' ).last() : null;
};

FeedSubscriptionStore.isLastPage = function() {
	const state = FeedSubscriptionStore.get();
	return state.get( 'isLastPage' );
};

FeedSubscriptionStore.getCurrentPage = function() {
	const state = FeedSubscriptionStore.get();
	return state.get( 'currentPage' );
};

FeedSubscriptionStore.clearSubscriptions = function() {
	const state = FeedSubscriptionStore.get();
	return state.set( 'subscriptions', [] );
};

FeedSubscriptionStore.getSubscription = function( key, value, includeUnsubscribed ) { //@todo includeUnsubscribed
	const state = FeedSubscriptionStore.get();

	let preparedValue = value;
	if ( key === 'URL' ) {
		preparedValue = FeedSubscriptionHelper.prepareSiteUrl( value );
	}

	return state.get( 'subscriptions' ).find( function( subscription ) {
		return ( subscription.get( key ) === preparedValue && subscription.get( 'state' ) === stateTypes.SUBSCRIBED );
	} );
};

FeedSubscriptionStore.getSubscriptionIndex = function( key, value ) {
	const state = FeedSubscriptionStore.get();

	let preparedValue = value;
	if ( key === 'URL' ) {
		preparedValue = FeedSubscriptionHelper.prepareSiteUrl( value );
	}

	return state.get( 'subscriptions' ).findIndex( function( subscription ) {
		return ( subscription.get( key ) === preparedValue );
	} );
};

function addSubscription( state, subscription ) {
	if ( ! subscription ) {
		return;
	}

	// Is this URL already in the subscription list (in any state, not just SUBSCRIBED)?
	const subscriptionKey = chooseBestSubscriptionKey( subscription );
	const existingSubscription = FeedSubscriptionStore.getSubscription( subscriptionKey, subscription[ subscriptionKey ], true );
	if ( existingSubscription ) {
		return updateSubscription( state, subscriptionTemplate.merge( subscription ) );
	}

	// Prepare URL, if we have one
	if ( subscription.URL ) {
		subscription.URL = FeedSubscriptionHelper.prepareSiteUrl( subscription.URL );
	}

	// Otherwise, create a new subscription
	const newSubscription = subscriptionTemplate.merge( subscription );
	const subscriptions = state.get( 'subscriptions' ).unshift( newSubscription );
	const subscriptionCount = state.get( 'subscriptionCount' ) + 1;

	return state.set( 'subscriptions', subscriptions ).set( 'subscriptionCount', subscriptionCount );
}

// Update an existing subscription with new information
function updateSubscription( state, newSubscriptionInfo ) {
	if ( ! newSubscriptionInfo ) {
		return;
	}

	// Prepare URL, if we have one
	if ( newSubscriptionInfo.URL ) {
		newSubscriptionInfo.URL = FeedSubscriptionHelper.prepareSiteUrl( newSubscriptionInfo.URL );
	}

	const subscriptionKey = chooseBestSubscriptionKey( newSubscriptionInfo );
	const existingSubscription = FeedSubscriptionStore.getSubscription( subscriptionKey, newSubscriptionInfo.get( subscriptionKey ) );
	const existingSubscriptionIndex = FeedSubscriptionStore.getSubscriptionIndex( subscriptionKey, newSubscriptionInfo.get( subscriptionKey ) );

	// If it's a refollow (i.e. the store has handled an unsubscribe for this feed already), add is_refollow flag to the updated subscription object
	if ( existingSubscription.get( 'state' ) === stateTypes.UNSUBSCRIBED && typeof newSubscriptionInfo.get === 'function' && newSubscriptionInfo.get( 'state' ) === stateTypes.SUBSCRIBED ) {
		newSubscriptionInfo = newSubscriptionInfo.merge( { is_refollow: true } );
	}

	const updatedSubscription = existingSubscription.merge( newSubscriptionInfo );
	const updatedSubscriptionsList = state.get( 'subscriptions' ).setIn( [ existingSubscriptionIndex ], updatedSubscription );

	let subscriptionCount = state.get( 'subscriptionCount' );
	if ( subscriptionCount > 0 && existingSubscription.get( 'state' ) === stateTypes.UNSUBSCRIBED && updatedSubscription.get( 'state' ) === stateTypes.SUBSCRIBED ) {
		subscriptionCount++;
	}

	if ( subscriptionCount > 0 && existingSubscription.get( 'state' ) === stateTypes.SUBSCRIBED && updatedSubscription.get( 'state' ) === stateTypes.UNSUBSCRIBED ) {
		subscriptionCount--;
	}

	return state.set( 'subscriptions', updatedSubscriptionsList ).set( 'subscriptionCount', subscriptionCount );
}

function removeSubscription( state, subscription ) {
	if ( ! subscription ) {
		return;
	}

	const newSubscriptionInfo = fromJS( subscription ).merge( { state: stateTypes.UNSUBSCRIBED } );

	return updateSubscription( state, newSubscriptionInfo );
}

function chooseBestSubscriptionKey( subscription ) {
	// Subscription ID is the most reliable
	if ( subscription.ID && subscription.ID > 0 ) {
		return 'ID';
	}

	return 'URL';
}

export default FeedSubscriptionStore;
