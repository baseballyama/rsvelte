import * as $ from 'svelte/internal/server';
import { count } from './stores.js';
import Incrementer from './Incrementer.svelte';
import Decrementer from './Decrementer.svelte';
import Resetter from './Resetter.svelte';

export default function Writable_stores01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count_value;

		const unsubscribe = count.subscribe((value) => {
			count_value = value;
		});

		$$renderer.push(`<h1>The count is ${$.escape(count_value)}</h1> `);
		Incrementer($$renderer, {});
		$$renderer.push(`<!----> `);
		Decrementer($$renderer, {});
		$$renderer.push(`<!----> `);
		Resetter($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}