import * as $ from 'svelte/internal/server';
import { Field, ToggleGroup, ToggleOption } from 'svelte-ux';

export default function BarsControls($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { chartMode = 'group' } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="screenshot-hidden">`);

			Field($$renderer, {
				label: 'Mode',
				class: 'mb-4',
				children: ($$renderer) => {
					ToggleGroup($$renderer, {
						variant: 'outline',
						size: 'sm',
						inset: true,
						class: 'w-full',
						get value() {
							return chartMode;
						},

						set value($$value) {
							chartMode = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							ToggleOption($$renderer, {
								value: 'group',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Grouped`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'stack',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Stacked`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							ToggleOption($$renderer, {
								value: 'groupStack',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Grouped &amp; Stacked`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { chartMode });
	});
}