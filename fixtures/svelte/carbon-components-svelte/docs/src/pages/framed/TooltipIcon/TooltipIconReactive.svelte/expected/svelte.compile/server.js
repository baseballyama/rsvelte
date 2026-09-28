import * as $ from 'svelte/internal/server';
import { Button, Stack, TooltipIcon } from "carbon-components-svelte";
import Carbon from "carbon-icons-svelte/lib/Carbon.svelte";

export default function TooltipIconReactive($$renderer) {
	let open = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 12,
			children: ($$renderer) => {
				$$renderer.push(`<div>`);

				TooltipIcon($$renderer, {
					tooltipText: 'Carbon is an open source design system by IBM.',
					icon: Carbon,
					align: 'start',
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> <div>`);

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