/**
 * Internal dependencies
 */
import { READER_SIDEBAR_LISTS_TOGGLE, READER_SIDEBAR_TAGS_TOGGLE } from 'state/action-types';

export function toggleReaderSidebarLists() {
	return {
		type: READER_SIDEBAR_LISTS_TOGGLE
	};
}

export function toggleReaderSidebarTags() {
	return {
		type: READER_SIDEBAR_TAGS_TOGGLE
	};
}
