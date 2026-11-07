import * as $ from 'svelte/internal/server';
import SegmentedButton, { Segment, Icon } from '@smui/segmented-button';
import Wrapper from '@smui/touch-target';

import {
	mdiFormatAlignLeft,
	mdiFormatAlignCenter,
	mdiFormatAlignRight,
	mdiFormatAlignJustify
} from '@mdi/js';

export default function _Touch($$renderer) {
	const aligns = [
		{ name: 'Left', icon: mdiFormatAlignLeft },
		{ name: 'Center', icon: mdiFormatAlignCenter },
		{ name: 'Right', icon: mdiFormatAlignRight },
		{ name: 'Justify', icon: mdiFormatAlignJustify }
	];

	let align = aligns[0];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		{
			function segment($$renderer, segment) {
				Wrapper($$renderer, {
					children: ($$renderer) => {
						Segment($$renderer, {
							segment,
							touch: true,
							title: segment.name,
							children: ($$renderer) => {
								Icon($$renderer, {
									tag: 'svg',
									style: 'width: 1em; height: auto;',
									viewBox: '0 0 24 24',
									children: ($$renderer) => {
										$$renderer.push(`<path fill="currentColor"${$.attr('d', segment.icon)}></path>`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			SegmentedButton($$renderer, {
				segments: aligns,
				singleSelect: true,
				key: (segment) => segment.name,
				get selected() {
					return align;
				},

				set selected($$value) {
					align = $$value;
					$$settled = false;
				},
				segment,
				$$slots: { segment: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Aligned: ${$.escape(align.name)}</pre>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}