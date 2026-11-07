import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><button>main</button></div>`);

export default function Main($$anchor) {
	var div = root();
	var button = $.only_child(div);

	$.event('click', div, () => console.log('div onclickcapture'), true);
	$.delegated('click', button, () => console.log('button onclick'));
	$.append($$anchor, div);
}

$.delegate(['click']);