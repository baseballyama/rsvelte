import * as $ from 'svelte/internal/server';
import { Button, Stack, Toggletip } from "carbon-components-svelte";

export default function ToggletipReactive($$renderer) {
	let open = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 12,
			align: 'start',
			children: ($$renderer) => {
				Toggletip($$renderer, {
					labelText: 'Resource list',
					align: 'start',
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->Resources are provisioned based on your account's organization.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					kind: 'tertiary',
					size: 'small',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(open ? "Close toggletip" : "Open toggletip")}`);
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