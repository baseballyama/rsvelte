import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";

export default function Main($$renderer) {
	{
		function children($$renderer) {
			$$renderer.push(`<!---->The content`);
		}

		Child($$renderer, { children, $$slots: { default: true } });
	}
}