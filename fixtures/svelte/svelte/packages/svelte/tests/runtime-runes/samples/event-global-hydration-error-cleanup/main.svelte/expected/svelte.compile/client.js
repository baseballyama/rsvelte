import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function Main($$anchor) {
	var p = root();

	$.event('click', $.window, () => console.log('window'));
	$.event('click', $.document, () => console.log('document'));
	$.event('click', $.document.body, () => console.log('body'));
	$.html(p, () => '<p>invalid</p>', true);
	$.reset(p);
	$.append($$anchor, p);
}