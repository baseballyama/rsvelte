import * as $ from 'svelte/internal/server';
import { setContext, mount } from 'svelte';
import ChildComponent from './ChildComponent.svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		setContext('foo', true);

		function render(node) {
			mount(ChildComponent, { target: node, context: new Map() });
		}

		$$renderer.push(`<div></div>`);
	});
}