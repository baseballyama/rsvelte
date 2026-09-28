import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><title>Search</title><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`);

export default function Search_icon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}