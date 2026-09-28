import * as $ from 'svelte/internal/server';
import ContextMenu from "carbon-components-svelte/ContextMenu/ContextMenu.svelte";
import ContextMenuOption from "carbon-components-svelte/ContextMenu/ContextMenuOption.svelte";
import { onMount } from "svelte";

export default function ContextMenu_target_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let targetA = null;
		let targetB = null;
		let target = null;

		onMount(() => {
			target = [targetA];
		});

		function swap() {
			target = [targetB];
		}

		$$renderer.push(`<div data-testid="target-a">A</div> <div data-testid="target-b">B</div> <button type="button" data-testid="swap">swap</button> `);

		ContextMenu($$renderer, {
			target,
			children: ($$renderer) => {
				ContextMenuOption($$renderer, { labelText: 'Option 1' });
				$$renderer.push(`<!----> `);
				ContextMenuOption($$renderer, { labelText: 'Option 2' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}