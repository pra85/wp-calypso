/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import ExpandableSidebarMenu from '../expandable';
import ReaderSidebarListsList from './list';
import ReaderListsActions from 'lib/reader-lists/actions';

const stats = require( 'reader/stats' );

const ReaderSidebarLists = React.createClass( {

	propTypes: {
		lists: React.PropTypes.array,
		path: React.PropTypes.string.isRequired
	},

	createList: function( list ) {
		stats.recordAction( 'add_list' );
		stats.recordGaEvent( 'Clicked Create List' );
		ReaderListsActions.create( list );
	},

	render: function() {
		const listCount = this.props.lists ? this.props.lists.length : 0;
		return (
			<ExpandableSidebarMenu
				expanded={ true }
				title={ this.translate( 'Lists' ) }
				count={ listCount }
				addPlaceholder={ this.translate( 'Give your list a name' ) }
				onAddSubmit={ this.createList }>
					<ReaderSidebarListsList { ...this.props } />
			</ExpandableSidebarMenu>
		);
	}
} );

export default ReaderSidebarLists;
