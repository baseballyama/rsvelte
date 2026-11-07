import * as $ from 'svelte/internal/server';
import Layout from './Layout.svelte';
import Component from './Component.svelte';

export default function Main($$renderer) {
	Layout($$renderer, {
		children: ($$renderer) => {
			Component($$renderer, {});
		},
		$$slots: { default: true }
	});
}