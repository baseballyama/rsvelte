import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function _2_input($$anchor) {
	function createCounter() {
		let count = $.state(0);

		function increment() {
			$.set(count, $.get(count) + 1);
		}

		return {
			get count() {
				return $.get(count);
			},
			increment
		};
	}

	const counter = createCounter();
	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${counter.count ?? ''}`));

	$.event('click', button, function (...$$args) {
		counter.increment?.apply(this, $$args);
	});

	$.append($$anchor, button);
}