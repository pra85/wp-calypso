/**
 * External Dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/button';
import Count from 'components/count';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarHeading from 'layout/sidebar/heading';

const ExpandableSidebarMenu = React.createClass( {

	propTypes: {
		title: React.PropTypes.oneOfType( [ React.PropTypes.string, React.PropTypes.element ] ).isRequired,
		count: React.PropTypes.number,
		addPlaceholder: React.PropTypes.string,
		onAddSubmit: React.PropTypes.func
	},

	getInitialState() {
		return {
			isAdding: false
		};
	},

	getDefaultProps() {
		return {
			expanded: false
		};
	},

	onClick() {
		if ( this.props.disabled ) {
			return;
		}

		if ( this.props.onClick ) {
			this.props.onClick();
		}
	},

	renderContent() {
		return (
			<ul className="sidebar__menu-list">
				{ this.props.children }
			</ul>
		);
	},

	renderHeader() {
		const headerClasses = classNames( 'sidebar__menu-header' );
		return (
			<div className={ headerClasses } onClick={ this.onClick }>
				<SidebarHeading>
					<Gridicon icon="chevron-down" />
					<span>{ this.props.title }</span>
					<Count count={ this.props.count } />
				</SidebarHeading>

				<div></div>
			</div>
		);
	},

	toggleAdd() {
		this.refs.menuAddInput.focus();
		this.setState( { isAdding: ! this.state.isAdding } );
	},

	handleAddKeyDown( event ) {
		const inputValue = this.refs.menuAddInput.value;
		if ( event.keyCode === 13 && inputValue.length > 0 ) {
			event.preventDefault();
			this.props.onAddSubmit( inputValue );
			this.refs.menuAddInput.value = '';
			this.toggleAdd();
		}
	},

	renderAdd() {
		return(
			<div className="sidebar__menu-add-item">
				<Button compact className="sidebar__menu-add-button" onClick={ this.toggleAdd }>{ this.translate( 'Add' ) }</Button>

				<div className="sidebar__menu-add">
					<input
						className="sidebar__menu-add-input"
						type="text"
						placeholder={ this.props.addPlaceholder }
						ref="menuAddInput"
						onKeyDown={ this.handleAddKeyDown }
					/>
					<Gridicon icon="cross-small" onClick={ this.toggleAdd } />
				</div>
			</div>
		);
	},

	render() {
		const classes = classNames(
			this.props.className,
			{
				'is-add-open': this.state.isAdding,
				'is-toggle-open': !! this.props.expanded,
				'is-togglable': true,
				'is-dynamic': true
			}
		);

		return (
			<SidebarMenu className={ classes }>
				{ this.renderHeader() }
				{ this.renderAdd() }
				{ this.renderContent() }
			</SidebarMenu>
		);
	}
} );

export default ExpandableSidebarMenu;
