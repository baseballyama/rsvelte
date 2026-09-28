import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContextMenuDemo from "$lib/components/demos/context-menu-demo.svelte";
import StackblitzDemoContainer from "$lib/components/stackblitz-demo-layout.svelte";

export default function _page($$anchor) {
	StackblitzDemoContainer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			ContextMenuDemo($$anchor, {});
		},
		$$slots: { default: true }
	});
}