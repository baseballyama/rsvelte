import * as $ from 'svelte/internal/server';
import SelectableTag from "carbon-components-svelte/Tag/SelectableTag.svelte";

export default function SelectableTag_test($$renderer) {
	SelectableTag($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SelectableTag($$renderer, {
		selected: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Preselected`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	SelectableTag($$renderer, {
		disabled: true,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Disabled`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}