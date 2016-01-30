
function preventScrollBounceOSX( body, e ) {
	if (
		( e.deltaY < 0 && body.scrollTop === 0 ) ||
		( e.deltaY > 0 && body.scrollTop === body.scrollHeight - this.innerHeight )
	) {
		e.preventDefault()
	}
}

export default function( body ) {
	if ( window.navigator.userAgent.indexOf( 'Macintosh' ) !== -1 ) {
		body.addEventListener( 'mousewheel', preventScrollBounceOSX.bind( window, body ) );
	}
}

