import * as $ from 'svelte/internal/server';
import SegmentedButton, { Segment, Label } from '@smui/segmented-button';

export default function _ManualSelection($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let choices = [
			{ name: 'Shoes', selected: true },
			{ name: 'Pants', selected: false },
			{ name: 'Shirts', selected: true },
			{ name: 'Hats', selected: false },
			{ name: 'Coats', selected: true }
		];

		{
			function segment($$renderer, segment) {
				Segment($$renderer, {
					segment,
					selected: segment.selected,
					onclick: () => {
						segment.selected = !segment.selected;
					},

					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(segment.name)}`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			SegmentedButton($$renderer, {
				segments: choices,
				key: (segment) => segment.name,
				segment,
				$$slots: { segment: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Selected: ${$.escape(choices.filter((choice) => choice.selected).map((choice) => choice.name).join(', '))}</pre>`);
	});
}