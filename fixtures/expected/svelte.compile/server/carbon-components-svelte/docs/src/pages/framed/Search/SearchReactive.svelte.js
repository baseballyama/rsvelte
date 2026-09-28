import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, Search, Stack } from "carbon-components-svelte";

export default function SearchReactive($$renderer) {
	let value = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				Search($$renderer, {
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <div>`);

				ButtonSet($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							size: 'small',
							disabled: value === "Cloud functions",
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set value`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							kind: 'ghost',
							size: 'small',
							disabled: value.length === 0,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Clear value`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>Value: ${$.escape(value)}</div>`);
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