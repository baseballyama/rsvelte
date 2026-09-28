import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 7H6a1 1 0 0 0-.8 1.6l4 5.333a1 1 0 0 0 1.6 0l4-5.333A1 1 0 0 0 14 7Z" fill="currentColor"></path></svg>`);

export default function SmallArrowIcon($$anchor) {
	var svg = root();

	$.append($$anchor, svg);
}