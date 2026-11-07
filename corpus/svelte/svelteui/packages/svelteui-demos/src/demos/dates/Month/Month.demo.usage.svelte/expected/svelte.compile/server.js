import * as $ from 'svelte/internal/server';
import { Center, Text, Stack, Paper } from '@svelteuidev/core';
import { Month } from '@svelteuidev/dates';

const code = `
<script>
    import { Month } from '@svelteuidev/dates';

    let value = new Date();
<\/script>

<Month bind:value month={value} onChange={(val) => (value = val)} />
`;

export const type = 'demo';
export const configuration = { code };

export default function Month_demo_usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = new Date();
		const mx = 'margin-left:auto;margin-right:auto;';
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Center($$renderer, {
				children: ($$renderer) => {
					Stack($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<div style="width:max-content;margin-left:auto;margin-right:auto;">`);

							Month($$renderer, {
								month: value,
								onChange: (val) => value = val,
								get value() {
									return value;
								},

								set value($$value) {
									value = $$value;
									$$settled = false;
								}
							});

							$$renderer.push(`<!----></div> `);

							Text($$renderer, {
								align: 'center',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(value)}`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}