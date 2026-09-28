import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from './Button.svelte';

var root = $.from_html(`<button> </button> <button> </button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);
	let d = $.state(1);

	function create_handler() {
		const change = $.get(d);

		console.log(`creating handler (${change})`);

		return function increment() {
			$.set(count, $.get(count) + change);
			console.log($.get(count));
		};
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button);
	var button_1 = $.sibling(button, 2);
	var event_handler = $.derived(create_handler);
	var text_1 = $.only_child(button_1);
	var node = $.sibling(button_1, 2);
	var event_handler_1 = $.derived(create_handler);

	Button(node, {
		$$events: {
			click: function (...$$args) {
				$.get(event_handler_1)?.apply(this, $$args);
			}
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text();

			$.template_effect(() => $.set_text(text_2, `clicks: ${$.get(count) ?? ''}`));
			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.template_effect(() => {
		$.set_text(text, `increase d (${$.get(d) ?? ''})`);
		$.set_text(text_1, `clicks: ${$.get(count) ?? ''}`);
	});

	$.event('click', button, () => $.set(d, $.get(d) + 1));

	$.event('click', button_1, function (...$$args) {
		$.get(event_handler)?.apply(this, $$args);
	});

	$.append($$anchor, fragment);
}