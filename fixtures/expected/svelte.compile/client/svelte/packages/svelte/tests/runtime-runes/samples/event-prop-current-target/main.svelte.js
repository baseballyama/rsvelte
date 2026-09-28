import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button><span>Click me</span></button>`);

export default function Main($$anchor) {
	function onclick(e) {
		// should log false when we click the span
		console.log(e.currentTarget === e.target);
	}

	var button = root();

	$.delegated('click', button, onclick);
	$.append($$anchor, button);
}

$.delegate(['click']);