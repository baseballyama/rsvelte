import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function At_const01_within_component_input($$renderer) {
	const b = 42;

	Component($$renderer, {
		children: ($$renderer) => {
			const a = b * 2;

			$$renderer.push(`<!---->84`);
		},
		$$slots: { default: true }
	});
}