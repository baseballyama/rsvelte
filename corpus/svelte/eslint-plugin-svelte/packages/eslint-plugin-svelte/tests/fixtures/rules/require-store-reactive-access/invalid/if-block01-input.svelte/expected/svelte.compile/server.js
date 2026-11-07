import * as $ from 'svelte/internal/server';
import { writable } from 'svelte/store';

export default function If_block01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let store = writable('hello');
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