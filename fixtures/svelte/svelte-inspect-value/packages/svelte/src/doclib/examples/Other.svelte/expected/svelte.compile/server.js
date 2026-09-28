import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';
import { getContext, onMount } from 'svelte';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';
import { intervalEffect } from '../interval-effect.svelte.js';

export default function Other($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let error = void 0;
		let date = new SvelteDate('1988-12-15 04:16');
		let number = 0;
		let currentString = 0;

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

		let dash = $.derived(() => frames[currentString]);

		onMount(() => {
			try {
				let lol;

				// eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-explicit-any
				lol.doesNotHaveProperty;
			} catch(e) {
				error = e;
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
				number = Math.ceil(Math.random() * 1000000000000);
			},
			100
		);

		intervalEffect(
			() => {
				currentString++;

				if (currentString === 10) currentString = 0;
			},
			500
		);

		let value = $.derived(() => ({ error, date, reg: /^[re(g)ex]$/, dash: dash(), number }));

		getContext('toc')?.set('Other', 'other');

		$$renderer.push(`<div class="flex col"><h3>Other</h3> <p>Other types handled includes Error, Date, regexp, and just about any object with enumerable
    properties.<br/>This example also demonstrates the entry indicators flashing when their values
    are updated (enabled / disabled with the <code>flashOnUpdate</code>-prop)</p> `);

		if (Inspect.Values.Expand0) {
			$$renderer.push('<!--[-->');
			Inspect.Values.Expand0($$renderer, $.spread_props([value()]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}