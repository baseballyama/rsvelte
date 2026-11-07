import * as $ from 'svelte/internal/server';
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipEvents_test($$renderer) {
	let openCount = 0;
	let closeCount = 0;

	function handleOpen() {
		openCount += 1;
	}

	function handleClose() {
		closeCount += 1;
	}

	$$renderer.push(`<div><p>Open events: ${$.escape(openCount)}</p> <p>Close events: ${$.escape(closeCount)}</p> `);

	Tooltip($$renderer, {
		iconDescription: 'Information',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Interact with this tooltip to trigger events`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}