import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { run } from 'svelte/legacy';

var root = $.from_html(`<button>click</button>`);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(0);
	let double = $.derived(() => $.get(count) * 2);
	let quadruple = $.state(void 0);

	run(() => {
		$.set(quadruple, $.get(count) * 4);
		console.log("i have a side effect");
	});

	let eight_times = $.state(void 0);

	run(() => {
		// updated
		$.set(eight_times, $.get(count) * 8);
	});

	let sixteen_times = $.state(void 0);

	run(() => {
		// reassigned outside labeled statement
		$.set(sixteen_times, $.get(count) * 16);
	});

	let alot_times = $.state(void 0);

	run(() => {
		// reassigned in multiple labeled
		$.set(alot_times, $.get(count) * 32);
	});

	run(() => {
		// reassigned in multiple labeled
		$.set(alot_times, $.get(count) * 32);
	});

	let evenmore = $.state(void 0);
	let evenmore_doubled = $.state(void 0);

	run(() => {
		// multiple stuff in label
		$.set(evenmore, $.get(count) * 64);

		$.set(evenmore_doubled, $.get(evenmore) * 2);
	});

	let almost_infinity = $.derived(() => $.get(count) * 128);
	let should_be_state = 42;
	let should_be_state_too = $.state(42);
	var button = root();

	$.delegated('click', button, () => {
		$.update(count);
		$.update(eight_times);
		$.set(sixteen_times, $.get(sixteen_times) + 1);
		$.update(should_be_state_too);
	});

	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);