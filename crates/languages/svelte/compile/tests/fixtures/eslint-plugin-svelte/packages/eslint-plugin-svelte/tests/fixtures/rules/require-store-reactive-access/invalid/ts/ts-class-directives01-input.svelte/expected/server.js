import * as $ from 'svelte/internal/server';
import { writable, Writable } from 'svelte/store';

export default function Ts_class_directives01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = null;
		const constStore = writable('hello');

		$$renderer.push(`<div${$.attr_style('', { color: store })}></div> <div${$.attr_class('', void 0, { 'name': constStore })}></div> <div${$.attr_class('', void 0, { 'constStore': constStore })}></div> <div${$.attr_class('', void 0, { 'name': store })}></div> <div${$.attr_class('', void 0, { 'store': store })}></div>`);
	});
}