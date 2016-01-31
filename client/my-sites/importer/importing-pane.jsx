/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classNames from 'classnames';
import omit from 'lodash/object/omit';

/**
 * Internal dependencies
 */
import { mapAuthor, startImporting } from 'lib/importer/actions';
import { appStates } from 'lib/importer/constants';
import ProgressBar from 'components/progress-bar';
import MappingPane from './author-mapping-pane';
import Spinner from 'components/spinner';

export default React.createClass( {
	displayName: 'SiteSettingsImportingPane',

	mixins: [ PureRenderMixin ],

	propTypes: {
		importerStatus: PropTypes.shape( {
			counts: PropTypes.shape( {
				comments: PropTypes.number,
				pages: PropTypes.number,
				posts: PropTypes.number
			} ),
			errorData: PropTypes.shape( {
				description: PropTypes.string.isRequired,
				type: PropTypes.string.isRequired
			} ),
			importerState: PropTypes.string.isRequired,
			percentComplete: PropTypes.number,
			site: PropTypes.shape( {
				slug: PropTypes.string.isRequired
			} ),
			statusMessage: PropTypes.string
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			single_user_site: PropTypes.bool.isRequired
		} ).isRequired
	},

	getHeadingText: function() {
		return this.translate(
			'Importing may take a while, but you can ' +
			'safely navigate away from this page if you need ' +
			'to. If you {{b}}stop the import{{/b}}, your site ' +
			'will be {{b2}}partially imported{{/b2}}.', {
				components: {
					b: <strong />,
					b2: <strong />
				}
			}
		);
	},

	getSuccessText: function() {
		const { site: { slug }, progress: { page, post } } = this.props.importerStatus,
			pageLink = <a href={ '/pages/' + slug } />,
			pageText = this.translate( 'Pages', { context: 'noun' } ),
			postLink = <a href={ '/posts/' + slug } />,
			postText = this.translate( 'Posts', { context: 'noun' } );

		if ( page && post ) {
			return this.translate(
				'All done! Check out {{a}}Posts{{/a}} or ' +
				'{{b}}Pages{{/b}} to see your imported content.', {
					components: {
						a: postLink,
						b: pageLink
					}
				}
			);
		}

		if ( page || post ) {
			return this.translate(
				'All done! Check out {{a}}%(articles)s{{/a}} ' +
				'to see your imported content.', {
					components: { a: page ? pageLink : postLink },
					args: { articles: page ? pageText : postText }
				}
			);
		}

		return this.translate( 'Import complete!' );
	},

	isError: function() {
		return this.isInState( appStates.IMPORT_FAILURE );
	},

	isFinished: function() {
		return this.isInState( appStates.IMPORT_SUCCESS );
	},

	isImporting: function() {
		return this.isInState( appStates.IMPORTING );
	},

	isInState: function( state ) {
		return state === this.props.importerStatus.importerState;
	},

	isMapping: function() {
		return this.isInState( appStates.MAP_AUTHORS );
	},

	/*
	 * The progress object comes from the API and can
	 * contain different object counts.
	 *
	 * The attachments will lead the progress because
	 * they take the longest in almost all circumstances.
	 *
	 * progressObect ~= {
	 *     post: { completed: 3, total: 12 },
	 *     comment: { completed: 0, total: 3 },
	 *     …
	 * }
	 */
	calculateProgress( progressObject ) {
		const { attachment = {} } = progressObject;
		const sum = ( a, b ) => a + b;

		if ( attachment.total > 0 && attachment.completed >= 0 ) {
			// return a weight of 80% attachment, 20% other objects
			return 80 * attachment.completed / attachment.total +
			       0.2 * this.calculateProgress( omit( progressObject, [ 'attachment' ] ) );
		}

		const percentages = Object.keys( progressObject )
			.map( k => progressObject[ k ] ) // get the inner objects themselves
			.filter( ( { total } ) => total > 0 ) // skip ones with no objects to import
			.map( ( { completed, total } ) => completed / total ); // compute the individual percentages

		return 100 * percentages.reduce( sum, 0 ) / percentages.length;
	},

	yetToImport( progressObject ) {
		const sum = ( a, b ) => a + b;

		return Object.keys( progressObject )
			.map( k => progressObject[ k ] )
			.map( ( { completed, total } ) => total - completed )
			.reduce( sum, 0 );
	},

	render: function() {
		const { site: { ID: siteId, name: siteName, single_user_site: hasSingleAuthor } } = this.props;
		const { importerId, errorData, customData } = this.props.importerStatus;
		const progressClasses = classNames( 'importer__import-progress', { 'is-complete': this.isFinished() } );
		let { percentComplete, progress, statusMessage } = this.props.importerStatus;
		let blockingMessage;

		if ( this.isError() ) {
			statusMessage = errorData.description;
		}

		if ( this.isFinished() ) {
			percentComplete = 100;
			statusMessage = this.getSuccessText();
		}

		if ( this.isImporting() && progress ) {
			const yetToImport = this.yetToImport( progress );
			percentComplete = this.calculateProgress( progress );

			blockingMessage = this.translate(
				'Waiting on %(numResources)d resource to import.',
				'Waiting on %(numResources)d resources to import.',
				{
					count: yetToImport,
					args: { numResources: yetToImport }
				}
			);
		}

		return (
			<div className="importer__importing-pane">
				{ ( this.isError() || this.isImporting() ) &&
					<p>{ this.getHeadingText() }</p>
				}
				{ this.isMapping() &&
					<MappingPane
						hasSingleAuthor={ hasSingleAuthor }
						onMap={ ( source, target ) => mapAuthor( importerId, source, target ) }
						onStartImport={ () => startImporting( this.props.importerStatus ) }
						{ ...{ siteId } }
						sourceAuthors={ customData.sourceAuthors }
						sourceTitle={ customData.siteTitle || this.translate( 'Original Site' ) }
						targetTitle={ siteName }
					/>
				}
				{ this.isImporting() && (
					percentComplete >= 0
						? <ProgressBar className={ progressClasses } value={ percentComplete } />
						: <div><Spinner className="importer__import-spinner" /><br /></div>
				) }
				{ blockingMessage && <div>{ blockingMessage }</div> }
				<div><p className="importer__status-message">{ statusMessage }</p></div>
			</div>
		);
	}
} );
