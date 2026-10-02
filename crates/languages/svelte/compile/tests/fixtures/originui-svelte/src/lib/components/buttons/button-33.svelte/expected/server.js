import * as $ from 'svelte/internal/server';
import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group/index.js';

export default function Button_33($$renderer) {
	let value = 'left';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ToggleGroup($$renderer, {
			type: 'single',
			variant: 'outline',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ToggleGroupItem($$renderer, {
					class: 'flex-1',
					value: 'left',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Left`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ToggleGroupItem($$renderer, {
					class: 'flex-1',
					value: 'center',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Center`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ToggleGroupItem($$renderer, {
					class: 'flex-1',
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}