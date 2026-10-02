import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><button>Button</button></div>`);

export default function Main($$anchor) {
	var div = root();
	var button = $.only_child(div);

	$.delegated('click', div, (e) => {
		console.log('clicked div');
	});

	$.delegated('click', button, (e) => {
		console.log('clicked button');
		e.stopPropagation();
	});

	$.append($$anchor, div);
}

$.delegate(['click']);