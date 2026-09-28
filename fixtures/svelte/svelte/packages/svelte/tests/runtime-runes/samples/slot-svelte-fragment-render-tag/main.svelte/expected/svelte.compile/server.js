import * as $ from 'svelte/internal/server';
import Child from './child.svelte';

export default function Main($$renderer) {
	Child($$renderer, {
		children: ($$renderer) => {
			{
				$$renderer.push(`<p>bar</p>`);
			}
		},
		$$slots: { default: true }
	});
}