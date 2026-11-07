import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Click</button>`);

export default function Main($$anchor) {
	let makeHandler = null;

	makeHandler = () => {
		console.log('create');

		return () => console.log('trigger');
	};

	var button = root();
	var event_handler = $.derived(makeHandler);

	$.event('click', button, function (...$$args) {
		$.get(event_handler)?.apply(this, $$args);
	});

	$.append($$anchor, button);
}