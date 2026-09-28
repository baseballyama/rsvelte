import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Main($$anchor) {
	var button = root();

	$.event('mouseenter', button, undefined);
	$.append($$anchor, button);
}