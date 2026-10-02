import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function Reactive_component_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let MyComponent;

		onMount(() => {
			import('./MyComponent.svelte').then((component) => {
				MyComponent = component.default;
			});
		});

		if (MyComponent) {
			$$renderer.push('<!--[0-->');
			MyComponent($$renderer, {});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}