import * as $ from 'svelte/internal/server';
import { Portal } from "carbon-components-svelte";

export default function CustomTagPortal($$renderer) {
	Portal($$renderer, {
		tag: 'section',
		children: ($$renderer) => {
			$$renderer.push(`<!---->This portal uses a section tag.`);
		},
		$$slots: { default: true }
	});
}