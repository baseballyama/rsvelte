import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import Sub from './sub.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let list = [];

		setContext('list', list);
		Sub($$renderer, {});
	});
}