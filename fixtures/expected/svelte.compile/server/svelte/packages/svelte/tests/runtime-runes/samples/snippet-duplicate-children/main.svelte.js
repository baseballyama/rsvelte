import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	{
		function children($$renderer) {
			$$renderer.push(`<!---->Hello`);
		}

		Child($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!----> `);

	{
		function children($$renderer) {
			$$renderer.push(`<!---->World`);
		}

		Child($$renderer, { children, $$slots: { default: true } });
	}

	$$renderer.push(`<!---->`);
}