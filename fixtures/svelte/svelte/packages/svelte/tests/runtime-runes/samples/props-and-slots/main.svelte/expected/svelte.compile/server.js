import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	Child($$renderer, {
		a: 'b',
		$$slots: {
			foo: ($$renderer) => {
				$$renderer.push(`<div slot="foo">foo</div>`);
			}
		}
	});
}