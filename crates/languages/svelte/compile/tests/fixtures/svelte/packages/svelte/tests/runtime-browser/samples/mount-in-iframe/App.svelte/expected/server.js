import * as $ from 'svelte/internal/server';
import { mount } from 'svelte';
import Child from './Child.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { count } = $$props;
		let iframe;

		$$renderer.push(`<iframe title="container"></iframe>`);
	});
}