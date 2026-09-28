import * as $ from 'svelte/internal/server';
import Disclosure from "carbon-components-svelte/Disclosure/Disclosure.svelte";

export default function DisclosureSummaryProp_test($$renderer) {
	Disclosure($$renderer, {
		summary: 'Show details',
		children: ($$renderer) => {
			$$renderer.push(`<p>Hidden content</p>`);
		},
		$$slots: { default: true }
	});
}