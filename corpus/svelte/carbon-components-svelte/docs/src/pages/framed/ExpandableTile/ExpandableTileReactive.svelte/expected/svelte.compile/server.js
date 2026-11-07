import * as $ from 'svelte/internal/server';
import { Button, ButtonSet, ExpandableTile, Stack } from "carbon-components-svelte";

export default function ExpandableTileReactive($$renderer) {
	let expanded = false;
	let grow = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 5,
			children: ($$renderer) => {
				ButtonSet($$renderer, {
					children: ($$renderer) => {
						Button($$renderer, {
							size: 'small',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(expanded ? "Collapse" : "Expand")}
      tile`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							size: 'small',
							kind: 'secondary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(grow ? "Shrink" : "Grow")}
      content`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div>Expanded: <strong>${$.escape(expanded)}</strong></div> `);

				ExpandableTile($$renderer, {
					get expanded() {
						return expanded;
					},

					set expanded($$value) {
						expanded = $$value;
						$$settled = false;
					},

					$$slots: {
						above: ($$renderer) => {
							$$renderer.push(`<div slot="above"><div>Above the fold content here</div> `);

							if (grow) {
								$$renderer.push(`<!--[0--><div>Extra line added dynamically.</div> <div>The resize observer remeasures the collapsed height.</div>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						},

						below: ($$renderer) => {
							$$renderer.push(`<div slot="below">Below the fold content here</div>`);
						}
					}
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