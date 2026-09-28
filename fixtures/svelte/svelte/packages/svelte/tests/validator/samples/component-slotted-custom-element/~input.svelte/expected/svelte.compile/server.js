import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Input($$renderer) {
	let thing = false;

	Nested($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<custom-element><div><div slot="foo"></div></div> `);

			if (thing) {
				$$renderer.push(`<!--[0--><div slot="bar"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></custom-element>`);
		},
		$$slots: { default: true }
	});
}