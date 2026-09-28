import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAbortSignal } from 'svelte';

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<p>loading...</p>`);
var root_2 = $.from_html(`<button>increment</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	let delayed_count = $.derived(async () => {
		let c = $.get(count);
		const signal = getAbortSignal();

		await new Promise((f) => setTimeout(f));

		if (signal.aborted) {
			console.log('aborted', signal.reason.name, signal.reason.message);
		}

		return c;
	});

	var fragment = root_2();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	$.await(
		node,
		() => $.get(delayed_count),
		($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		},
		($$anchor, count) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $.get(count)));
			$.append($$anchor, p);
		},
		($$anchor, error) => {
			var text_1 = $.text();

			text_1.nodeValue = console.log('this should never be rendered');
			$.append($$anchor, text_1);
		}
	);

	$.delegated('click', button, async () => {
		$.set(count, $.get(count) + 1);
		await Promise.resolve();
		$.set(count, $.get(count) + 1);
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);