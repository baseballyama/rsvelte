import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';
import Test from './Test.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable(0);
		let checked = true;

		$$renderer.push(`<input type="checkbox"${$.attr('checked', checked, true)}/> `);

		if (checked) {
			$$renderer.push('<!--[0-->');
			Test($$renderer, { store });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}