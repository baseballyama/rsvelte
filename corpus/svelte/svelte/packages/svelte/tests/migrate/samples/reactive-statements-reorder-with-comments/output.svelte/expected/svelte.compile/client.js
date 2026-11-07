import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { run } from 'svelte/legacy';

var root = $.from_html(`<button> </button>`);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);

	// triple
	//  update triple
	let triple = $.derived(() => $.get(count) * 3);

	//  trailing comment
	//  in triple;
	function increment() {
		$.set(count, $.get(count) + 1);
	}

	// this comment should remain attached to this declaration after migration
	let double = $.derived(() => $.get(count // this too
	) * 2);

	run(() => {
		console.log({ count: $.get(count), double: $.get(double) });
	});

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `clicks: ${$.get(count) ?? ''}`));
	$.delegated('click', button, increment);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);