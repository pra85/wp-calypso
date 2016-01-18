/**
 * External Dependencies
 */
import React from 'react';
import map from 'lodash/collection/map';

/**
 * Internal Dependencies
 */
import ReaderSidebarListsListItem from './list-item';

const ReaderSidebarListsList = React.createClass( {

	propTypes: {
		lists: React.PropTypes.array,
		path: React.PropTypes.string.isRequired
	},

	renderItems() {
		return map( this.props.lists, function( list ) {
			return (
				<ReaderSidebarListsListItem key={ list.ID } list={ list } path={ this.props.path } />
			);
		}, this );
	},

	render: function() {
		if ( ! this.props.lists || this.props.lists.length === 0 ) {
			return (
				<li key="empty" className="sidebar__menu-empty">{ this.translate( 'Collect sites together by adding a\xa0list.' ) }</li>
			);
		}

		return(
			<div>{ this.renderItems() }</div>
		);
	}
} );

export default ReaderSidebarListsList;
