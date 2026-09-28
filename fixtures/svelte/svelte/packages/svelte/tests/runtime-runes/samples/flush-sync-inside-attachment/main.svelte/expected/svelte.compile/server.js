import * as $ from 'svelte/internal/server';
import { flushSync, mount } from 'svelte';
import Child from './Child.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let show = false;

		$$renderer.push(`<button>show</button> <div></div>`);
	});
}