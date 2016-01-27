/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const PurchaseDetail = ( { additionalClass, buttonText, description, href, target, title } ) => (
	<li className={ 'checkout__purchase-detail ' + additionalClass }>
		<div className="checkout__purchase-detail-text">
			<h3 className="checkout__purchase-detail-title">{ title }</h3>
			<p className="checkout__purchase-detail-description">{ description }</p>
		</div>
		<Button href={ href } target={ target } primary>
			{ buttonText }
		</Button>
	</li>
);

PurchaseDetail.propTypes = {
	additionalClass: React.PropTypes.string,
	buttonText: React.PropTypes.string.isRequired,
	description: React.PropTypes.string.isRequired,
	href: React.PropTypes.string,
	target: React.PropTypes.string,
	title: React.PropTypes.string.isRequired
};

export default PurchaseDetail;
