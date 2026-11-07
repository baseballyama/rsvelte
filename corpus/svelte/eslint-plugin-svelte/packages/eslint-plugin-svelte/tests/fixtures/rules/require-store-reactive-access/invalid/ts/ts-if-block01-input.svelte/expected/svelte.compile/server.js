import * as $ from 'svelte/internal/server';
import { writable, Writable } from 'svelte/store';

export default function Ts_if_block01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = null;
		const constStore = writable('hello');

		if (store) {
			$$renderer.push(`<!--[0--><div${$.attr_class('', void 0, { 'foo': store })}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (constStore) {
			$$renderer.push(`<!--[0--><div${$.attr_class('', void 0, { 'foo': constStore })}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}