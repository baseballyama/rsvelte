import * as $ from 'svelte/internal/server';
import MyComponent from './_ExcludeAndPrefixFilterComponent.svelte';

export default function _ExcludeAndPrefixFilter($$renderer) {
	let disabled = false;

	MyComponent($$renderer, {
		class: 'my-class',
		button$disabled: disabled,
		button$onclick: () => disabled = true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Click Me Only Once`);
		},
		$$slots: { default: true }
	});
}