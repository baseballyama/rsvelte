import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <p> </p>`, 1);

export default function Ts_$effect01_type_output($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0 // count: number, $state(0): 0
	);
	let doubled = $.derived(() => $.get(count // doubled: number, $derived(count * 2): number
	) * 2);

	$.user_effect(() => {
		// $effect(() => { // runs when the component is mounted, and again // whenever `count` or `doubled` change, // after the DOM has been updated console.log({ count, doubled }); return () => { // if a callback is provided, it will run // a) immediately before the effect re-runs // b) when the component is destroyed console.log("cleanup"); }; }): void
		// runs when the component is mounted, and again
		// whenever `count` or `doubled` change,
		// after the DOM has been updated
		console.log({ count: $.get(count), doubled: $.get(doubled) });

		return () => {
			// if a callback is provided, it will run
			// a) immediately before the effect re-runs
			// b) when the component is destroyed
			console.log("cleanup");
		};
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var p = $.sibling(button, 2);
	var text_1 = $.only_child(p);

	$.template_effect(() => {
		$.set_text(text, $.get(doubled));
		$.set_text(text_1, `${$.get(count) ?? ''} doubled is ${$.get(doubled) ?? ''}`);
	});

	$.event('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}