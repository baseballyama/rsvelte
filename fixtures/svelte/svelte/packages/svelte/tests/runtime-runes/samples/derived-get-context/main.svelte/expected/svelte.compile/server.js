import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setContext("key", 10);
		Child($$renderer, {});
	});
}