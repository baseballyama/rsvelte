import * as $ from 'svelte/internal/server';
import SegmentedButton, { Segment } from '@smui/segmented-button';
import Button from '@smui/button';
import { Label } from '@smui/common';

export default function _SingleSelection($$renderer) {
	let choices = ['Morning', 'Afternoon', 'Evening', 'Night'];
	let selected = 'Morning';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function segment($$renderer, segment) {
				Segment($$renderer, {
					segment,
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(segment)}`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			SegmentedButton($$renderer, {
				segments: choices,
				singleSelect: true,
				get selected() {
					return selected;
				},

				set selected($$value) {
					selected = $$value;
					$$settled = false;
				},
				segment,
				$$slots: { segment: true }
			});
		}

		$$renderer.push(`<!----> <div style="margin-top: 1em;">Programmatically select:</div> `);

		Button($$renderer, {
			onclick: () => selected = 'Morning',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Morning`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => selected = 'Afternoon',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Afternoon`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => selected = 'Evening',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Evening`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => selected = 'Night',
			children: ($$renderer) => {
				Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Night`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(selected)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}