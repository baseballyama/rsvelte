import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from "svelte";

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	// Test setup:
	// - component initialized while pending work
	// - derived that depends on mulitple sources
	// - indirect updates to subsequent deriveds
	// - two sibling effects where the former influences the latter
	// - first effect reads derived of second inside untrack
	let x = $.state(0);

	const other = $.derived(() => $$props.double + $.get(x));
	const another = $.derived(() => $.get(other) + 1);
	const another2 = $.derived(() => $.get(another) + 1);

	$.user_effect(() => {
		untrack(() => {
			$.get(another2);
			$.update(x);
		});
	});

	$.user_effect(() => {
		console.log($.get(another2));
	});

	$.pop();
}