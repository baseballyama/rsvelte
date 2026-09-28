import * as $ from 'svelte/internal/server';
import SegmentedButton, { Segment, Label } from '@smui/segmented-button';

export default function _GroupSelection($$renderer) {
	let choices = ['Shoes', 'Pants', 'Shirts', 'Hats', 'Coats'];
	let selected = ['Shoes', 'Shirts', 'Coats'];
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

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(selected.join(', '))}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}