import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Layout from './Layout.svelte';
import Component from './Component.svelte';

export default function Main($$anchor) {
	Layout($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Component($$anchor, {});
		},
		$$slots: { default: true }
	});
}