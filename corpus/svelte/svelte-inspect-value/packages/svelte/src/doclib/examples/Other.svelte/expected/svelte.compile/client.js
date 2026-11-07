import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';
import { getContext, onMount } from 'svelte';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';
import { intervalEffect } from '../interval-effect.svelte.js';

var root = $.from_html(`<div class="flex col"><h3>Other</h3> <p>Other types handled includes Error, Date, regexp, and just about any object with enumerable
    properties.<br/>This example also demonstrates the entry indicators flashing when their values
    are updated (enabled / disabled with the <code>flashOnUpdate</code>-prop)</p> <!></div>`);

export default function Other($$anchor, $$props) {
	$.push($$props, true);

	let error = $.state(void 0);
	let date = new SvelteDate('1988-12-15 04:16');
	let number = $.state(0);
	let currentString = $.state(0);

	let frames = [
		'-         ',
		' =        ',
		'  -       ',
		'   =      ',
		'    -     ',
		'     =    ',
		'      -   ',
		'       =  ',
		'        - ',
		'         ='
	];

	let dash = $.derived(() => frames[$.get(currentString)]);

	onMount(() => {
		try {
			let lol;

			// eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-explicit-any
			lol.doesNotHaveProperty;
		} catch(e) {
			$.set(error, e, true);
		}
	});

	intervalEffect(
		() => {
			date = new SvelteDate();
		},
		1000
	);

	intervalEffect(
		() => {
			$.set(number, Math.ceil(Math.random() * 1000000000000), true);
		},
		100
	);

	intervalEffect(
		() => {
			$.update(currentString);

			if ($.get(currentString) === 10) $.set(currentString, 0);
		},
		500
	);

	let value = $.derived(() => ({
		error: $.get(error),
		date,
		reg: /^[re(g)ex]$/,
		dash: $.get(dash),
		number: $.get(number)
	}));

	getContext('toc')?.set('Other', 'other');

	var div = root();
	var node = $.sibling($.child(div), 4);

	$.component(node, () => Inspect.Values.Expand0, ($$anchor, Inspect_Values_Expand0) => {
		Inspect_Values_Expand0($$anchor, $.spread_props(() => $.get(value)));
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}