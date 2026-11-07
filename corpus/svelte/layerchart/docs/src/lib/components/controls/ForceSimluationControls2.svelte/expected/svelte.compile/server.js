import * as $ from 'svelte/internal/server';
import { Field, Switch } from 'svelte-ux';

export default function ForceSimluationControls2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { sticky = true } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full justify-end screenshot-hidden">`);

			Field($$renderer, {
				dense: true,
				class: 'inline-block mb-2',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { id }) => {
						$$renderer.push(`<label class="flex gap-2 items-center text-sm"${$.attr('for', id)}>Sticky `);

						Switch($$renderer, {
							id,
							get checked() {
								return sticky;
							},

							set checked($$value) {
								sticky = $$value;
								$$settled = false;
							}
						});

						$$renderer.push(`<!----></label>`);
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
		$.bind_props($$props, { sticky });
	});
}