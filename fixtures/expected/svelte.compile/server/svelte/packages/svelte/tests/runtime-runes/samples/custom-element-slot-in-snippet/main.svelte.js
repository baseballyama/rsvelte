import * as $ from 'svelte/internal/server';
import Component from './Component.svelte';

export default function Main($$renderer) {
	{
		function children($$renderer) {
			$$renderer.push(`<!---->Default <span slot="slot">Slotted</span>`);
		}

		Component($$renderer, { children, $$slots: { default: true } });
	}
}