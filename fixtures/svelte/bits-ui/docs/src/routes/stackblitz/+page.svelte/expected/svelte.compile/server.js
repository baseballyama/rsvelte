import * as $ from 'svelte/internal/server';
import ContextMenuDemo from "$lib/components/demos/context-menu-demo.svelte";
import StackblitzDemoContainer from "$lib/components/stackblitz-demo-layout.svelte";

export default function _page($$renderer) {
	StackblitzDemoContainer($$renderer, {
		children: ($$renderer) => {
			ContextMenuDemo($$renderer, {});
		},
		$$slots: { default: true }
	});
}