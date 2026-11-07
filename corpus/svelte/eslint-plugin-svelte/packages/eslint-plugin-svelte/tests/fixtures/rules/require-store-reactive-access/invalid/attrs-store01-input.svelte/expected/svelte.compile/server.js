import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function Attrs_store01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable('hello');
		let value = writable('hello');

		$$renderer.push(`<div${$.attr('prop', `Hello ${$.stringify(store)}`)}></div> <div${$.attr('prop', store)}></div> <div${$.attr('store', store)}></div> <div${$.attributes({ ...store })}></div> <div></div> <input${$.attr('value', value)}/>`);
	});
}