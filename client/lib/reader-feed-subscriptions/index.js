// Reader Feed Subscription Store

// External dependencies
import { Map, List, fromJS } from 'immutable';
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

// const defaultListItems = List(); // eslint-disable-line new-cap

// function getListItems( state, listId ) {
// 	return state.getIn( [ 'lists', +listId, 'items' ], defaultListItems );
// }

// function receiveItems( state, data ) {
// 	// Is it the last page?
// 	let isLastPage = false;
// 	if ( data.number === 0 ) {
// 		isLastPage = true;
// 	}

// 	// What's the current page?
// 	const currentPage = +data.page;

// 	// Add new items from response
// 	let items = getListItems( state, data.list_ID );
// 	if ( data && data.items ) {
// 		items = items.concat( fromJS( data.items ) );
// 	}

// 	const updatedList = fromJS( {
// 		items,
// 		currentPage,
// 		isLastPage
// 	} );

// 	const updatedLists = state.get( 'lists' ).setIn( [ data.list_ID ], updatedList );
// 	return state.set( 'lists', updatedLists );
// };

function addSubscription( state, subscription ) {
	if ( ! subscription ) {
		return;
	}

	// Prepare URL, if we have one
	if ( subscription.URL ) {
		subscription.URL = FeedSubscriptionHelper.prepareSiteUrl( subscription.URL );
	}

	// Is this URL already in the subscription list (in any state, not just SUBSCRIBED)?
	// const subscriptionKey = chooseBestSubscriptionKey( subscription );
	// const existingSubscription = FeedSubscriptionStore.getSubscription( subscriptionKey, subscription[ subscriptionKey ], true );
	// if ( existingSubscription ) {
	// 	//return updateSubscription( preparedSiteUrl, subscriptionTemplate );
	// }

	// Otherwise, create a new subscription
	const newSubscription = subscriptionTemplate.merge( subscription );
	const subscriptions = state.get( 'subscriptions' ).unshift( newSubscription );
	const subscriptionCount = state.get( 'subscriptionCount' ) + 1;

	return state.set( 'subscriptions', subscriptions ).set( 'subscriptionCount', subscriptionCount );
}

function chooseBestSubscriptionKey( subscription ) {
	// Subscription ID is the most reliable
	if ( subscription.ID && subscription.ID > 0 ) {
		return 'ID';
	}

	return 'URL';
}

const FeedSubscriptionStore = createReducerStore( ( state, payload ) => {
	switch ( payload.action.type ) {
		case actionTypes.FOLLOW_READER_FEED:
			return addSubscription( state, payload.action.data );

		// case actionTypes.UNFOLLOW_READER_FEED:
		// 	return receiveUnfollow( state, payload.action );

		// case actionTypes.ACTION_RECEIVE_READER_LIST_ITEMS:
		// 	return receiveItems( state, payload.action.data );

		// case actionTypes.ACTION_RECEIVE_READER_LIST_ITEMS_ERROR:
		// 	const errors = state.get( 'errors' );
		// 	return state.set( 'errors', errors.push( payload.action.error ) );

		// case actionTypes.ACTION_FETCH_READER_LIST_ITEMS:
		// 	return state.set( 'isFetching', true );

		// case actionTypes.ACTION_FETCH_READER_LIST_ITEMS_COMPLETE:
		// 	return state.set( 'isFetching', false );
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

export default FeedSubscriptionStore;
