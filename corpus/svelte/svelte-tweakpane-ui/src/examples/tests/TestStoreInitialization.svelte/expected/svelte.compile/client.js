import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, tick } from 'svelte';
import { writable } from 'svelte/store';
import { Slider } from '$lib';

var root = $.from_html(`<h1>With tick, works in Svelte 4</h1> <p>Native input</p> <input type="range"/> <p>Svelte Tweakpane UI</p> <!> <h1>Without tick, works in Svelte 5</h1> <p>Native input</p> <input type="range"/> <p>Svelte Tweakpane UI</p> <!>`, 1);

export default function TestStoreInitialization($$anchor, $$props) {
	$.push($$props, true);

	const $bear2 = () => $.store_get(bear2, '$bear2', $$stores);
	const $bear = () => $.store_get(bear, '$bear', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Via https://github.com/kitschpatrol/svelte-tweakpane-ui/issues/15
	const bear = writable({ apples: 100, name: 'Someone' });

	const bear2 = writable({ apples: 100, name: 'Someone' });

	onMount(async () => {
		// No tick
		$.store_mutate(bear2, $.untrack($bear2).apples = 60, $.untrack($bear2));

		// With Tick
		await tick();

		$.store_mutate(bear, $.untrack($bear).apples = 60, $.untrack($bear));
	});

	var fragment = root();
	var input = $.sibling($.first_child(fragment), 4);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'max', 100);
	$.set_attribute(input, 'min', 0);
	$.set_attribute(input, 'step', 1);

	var node = $.sibling(input, 4);

	Slider(node, {
		max: 100,
		min: 0,
		step: 1,
		get value() {
			return $bear().apples;
		},

		set value($$value) {
			$.store_mutate(bear, $.untrack($bear).apples = $$value, $.untrack($bear));
		}
	});

	var input_1 = $.sibling(node, 6);

	$.remove_input_defaults(input_1);
	$.set_attribute(input_1, 'max', 100);
	$.set_attribute(input_1, 'min', 0);
	$.set_attribute(input_1, 'step', 1);

	var node_1 = $.sibling(input_1, 4);

	Slider(node_1, {
		max: 100,
		min: 0,
		step: 1,
		get value() {
			return $bear2().apples;
		},

		set value($$value) {
			$.store_mutate(bear2, $.untrack($bear2).apples = $$value, $.untrack($bear2));
		}
	});

	$.bind_value(input, () => $bear().apples, ($$value) => $.store_mutate(bear, $.untrack($bear).apples = $$value, $.untrack($bear)));
	$.bind_value(input_1, () => $bear2().apples, ($$value) => $.store_mutate(bear2, $.untrack($bear2).apples = $$value, $.untrack($bear2)));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}