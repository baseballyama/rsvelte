import * as $ from 'svelte/internal/server';
import { Field, MenuField, Switch } from 'svelte-ux';

export default function DagrePlaygroundControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { selectedGraphValue = void 0, showSettings = void 0 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex justify-end gap-2 items-end mb-2">`);

			MenuField($$renderer, {
				label: 'Graph',
				options: [
					{ label: 'Simple', value: 'simple' },
					{ label: 'Medium', value: 'medium' },
					{ label: 'Large', value: 'large' },
					{ label: 'Les Misérables', value: 'miserables' },
					{ label: 'Generated (simple)', value: 'simple-generated' },
					{ label: 'Generated (complex)', value: 'complex-generated' }
				],
				menuIcon: '',
				dense: true,
				stepper: true,
				class: 'w-64',
				get value() {
					return selectedGraphValue;
				},

				set value($$value) {
					selectedGraphValue = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			Field($$renderer, {
				label: 'Settings',
				labelPlacement: 'inset',
				dense: true,
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						Switch($$renderer, { checked: showSettings, id, size: 'md' });
					}
				}
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { selectedGraphValue, showSettings });
	});
}