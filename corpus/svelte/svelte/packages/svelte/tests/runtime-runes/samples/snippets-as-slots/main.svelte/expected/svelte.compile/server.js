import * as $ from 'svelte/internal/server';
import Child from './child.svelte';

export default function Main($$renderer) {
	{
		function children($$renderer, { foo }) {
			$$renderer.push(`<!---->Default ${$.escape(foo)}`);
		}

		function named($$renderer, { bar }) {
			$$renderer.push(`<!---->Named ${$.escape(bar)}`);
		}

		Child($$renderer, { children, named, $$slots: { default: true, named: true } });
	}
}