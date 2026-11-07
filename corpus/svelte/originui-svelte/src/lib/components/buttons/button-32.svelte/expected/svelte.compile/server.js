import * as $ from 'svelte/internal/server';
import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group/index.js';

export default function Button_32($$renderer) {
	ToggleGroup($$renderer, {
		variant: 'outline',
		class: 'inline-flex',
		type: 'single',
		children: ($$renderer) => {
			ToggleGroupItem($$renderer, {
				value: 'left',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Left`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleGroupItem($$renderer, {
				value: 'center',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Center`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			ToggleGroupItem($$renderer, {
				value: 'right',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Right`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}