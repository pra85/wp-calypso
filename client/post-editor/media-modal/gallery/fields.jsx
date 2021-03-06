/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import assign from 'lodash/object/assign';
import noop from 'lodash/utility/noop';
import includes from 'lodash/collection/includes';
import times from 'lodash/utility/times';
import zipObject from 'lodash/array/zipObject';

/**
 * Internal dependencies
 */
import EditorMediaModalFieldset from '../fieldset';
import SelectDropdown from 'components/select-dropdown';
import SelectDropdownItem from 'components/select-dropdown/item';
import FormCheckbox from 'components/forms/form-checkbox';
import { GalleryColumnedTypes, GallerySizeableTypes } from 'lib/media/constants';

export default React.createClass( {
	displayName: 'EditorMediaModalGalleryFields',

	propTypes: {
		site: PropTypes.object,
		settings: PropTypes.object,
		onUpdateSetting: PropTypes.func,
		numberOfItems: PropTypes.number
	},

	getDefaultProps() {
		return {
			settings: Object.freeze( {} ),
			onUpdateSetting: noop,
			numberOfItems: 0
		};
	},

	getTypeOptions() {
		const { site } = this.props;

		let options = {
			individual: this.translate( 'Individual Images' ),
			default: this.translate( 'Thumbnail Grid' )
		};

		if ( site && ( ! site.jetpack || site.isModuleActive( 'tiled-gallery' ) ) ) {
			assign( options, {
				rectangular: this.translate( 'Tiled Mosaic' ),
				square: this.translate( 'Square Tiles' ),
				circle: this.translate( 'Circles' ),
				columns: this.translate( 'Tiled Columns' )
			} );
		}

		if ( site && ( ! site.jetpack || site.isModuleActive( 'shortcodes' ) ) ) {
			assign( options, {
				slideshow: this.translate( 'Slideshow' )
			} );
		}

		return options;
	},

	getLinkOptions() {
		if ( 'individual' === this.props.settings.type ) {
			return {};
		}

		return {
			'': this.translate( 'Attachment Page' ),
			file: this.translate( 'Media File' ),
			none: this.translate( 'None' ),
		};
	},

	getSizeOptions() {
		if ( ! includes( GallerySizeableTypes, this.props.settings.type ) ) {
			return {};
		}

		return {
			thumbnail: this.translate( 'Thumbnail' ),
			medium: this.translate( 'Medium' ),
			large: this.translate( 'Large' ),
			full: this.translate( 'Full Size' ),
		};
	},

	getColumnOptions() {
		const max = Math.min( this.props.numberOfItems, 9 );
		return zipObject( times( max, ( n ) => [ n + 1, ( n + 1 ).toString() ] ) );
	},

	updateRandomOrder( event ) {
		this.props.onUpdateSetting( 'orderBy', event.target.checked ? 'rand' : null );
	},

	renderDropdown( legend, options, settingName ) {
		const { settings, onUpdateSetting } = this.props;

		if ( ! Object.keys( options ).length ) {
			return;
		}

		return (
			<EditorMediaModalFieldset legend={ legend } className={ 'for-setting-' + settingName }>
				<SelectDropdown selectedText={ options[ settings[settingName] ] }>
					{ Object.keys( options ).map( ( value ) => {
						const label = options[ value ];

						return (
							<SelectDropdownItem
								key={ 'value-' + value }
								selected={ value === settings[settingName] }
								onClick={ () => onUpdateSetting( settingName, isFinite( parseInt( value ) ) ? +value : value ) }>
								{ label }
							</SelectDropdownItem>
						);
					} ) }
				</SelectDropdown>
			</EditorMediaModalFieldset>
		);
	},

	renderColumnsOption() {
		if ( ! includes( GalleryColumnedTypes, this.props.settings.type ) ) {
			return;
		}

		return this.renderDropdown( this.translate( 'Columns' ), this.getColumnOptions(), 'columns' );
	},

	renderRandomOption() {
		const { settings } = this.props;

		if ( 'individual' === settings.type ) {
			return;
		}

		return (
			<EditorMediaModalFieldset legend={ this.translate( 'Random Order' ) }>
				<FormCheckbox onChange={ this.updateRandomOrder } checked={ settings.orderBy === 'rand' } />
			</EditorMediaModalFieldset>
		);
	},

	render() {
		const types = this.getTypeOptions();
		const links = this.getLinkOptions();
		const sizes = this.getSizeOptions();

		return (
			<div className="editor-media-modal-gallery__fields">
				{ this.renderDropdown( this.translate( 'Layout' ), types, 'type' ) }
				{ this.renderColumnsOption() }
				{ this.renderRandomOption() }
				{ this.renderDropdown( this.translate( 'Link To' ), links, 'link' ) }
				{ this.renderDropdown( this.translate( 'Size' ), sizes, 'size' ) }
			</div>
		);
	}
} );
