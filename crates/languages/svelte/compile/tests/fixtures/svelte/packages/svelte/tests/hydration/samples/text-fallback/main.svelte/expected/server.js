import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->default`);
		},

		$$slots: {
			default: true,
			foo: ($$renderer) => {
				$$renderer.push(`<div slot="foo">foo override</div>`);
			}
		}
	});
}