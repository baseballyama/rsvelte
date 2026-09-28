import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>sub</button>`);

export default function Sub($$anchor) {
	var button = root();

	$.event('click', $.window, () => console.log('window sub'));
	$.event('click', $.document, () => console.log('document sub'));
	$.delegated('click', button, () => console.log('button sub'));
	$.append($$anchor, button);
}

$.delegate(['click']);