import * as $ from 'svelte/internal/server';
import DemoContainer from "../demo-container.svelte";
import SelectDemoCustom from "./select-demo-custom.svelte";

export default function Select_demo_custom_anchor($$renderer) {
	let customAnchor = null;

	DemoContainer($$renderer, {
		size: 'xs',
		wrapperClass: 'rounded-bl-card rounded-br-card',
		children: ($$renderer) => {
			$$renderer.push(`<div class="flex items-center gap-6"><div class="rounded-md border p-3">Custom Anchor</div> `);
			SelectDemoCustom($$renderer, { contentProps: { customAnchor } });
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}