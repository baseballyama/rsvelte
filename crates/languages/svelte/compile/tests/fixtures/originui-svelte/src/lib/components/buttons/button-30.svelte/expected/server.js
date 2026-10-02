import * as $ from 'svelte/internal/server';
import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group/index.js';
import AlignCenter from '@lucide/svelte/icons/align-center';
import AlignJustify from '@lucide/svelte/icons/align-justify';
import AlignLeft from '@lucide/svelte/icons/align-left';
import AlignRight from '@lucide/svelte/icons/align-right';

export default function Button_30($$renderer) {
	let value = 'center';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ToggleGroup($$renderer, {
			class: 'divide-background inline-flex divide-x',
			type: 'single',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ToggleGroupItem($$renderer, {
					class: 'bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
					'aria-label': 'Align Left',
					value: 'left',
					children: ($$renderer) => {
						AlignLeft($$renderer, { size: 16, 'aria-hidden': 'true' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ToggleGroupItem($$renderer, {
					class: 'bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
					'aria-label': 'Align Center',
					value: 'center',
					children: ($$renderer) => {
						AlignCenter($$renderer, { size: 16, 'aria-hidden': 'true' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ToggleGroupItem($$renderer, {
					class: 'bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
					'aria-label': 'Align Right',
					value: 'right',
					children: ($$renderer) => {
						AlignRight($$renderer, { size: 16, 'aria-hidden': 'true' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				ToggleGroupItem($$renderer, {
					class: 'bg-primary/80 text-primary-foreground hover:bg-primary hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
					'aria-label': 'Align Justify',
					value: 'justify',
					children: ($$renderer) => {
						AlignJustify($$renderer, { size: 16, 'aria-hidden': 'true' });
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