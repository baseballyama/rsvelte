import * as $ from 'svelte/internal/server';
import { Button, Stack, Tooltip } from "carbon-components-svelte";

export default function TooltipReactive($$renderer) {
	let open = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 12,
			children: ($$renderer) => {
				Tooltip($$renderer, {
					triggerText: 'Resource list',
					align: 'start',
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<p>Resources are provisioned based on your account's organization.</p>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div>`);

				Button($$renderer, {
					kind: 'tertiary',
					size: 'small',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(open ? "Close tooltip" : "Open tooltip")}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
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