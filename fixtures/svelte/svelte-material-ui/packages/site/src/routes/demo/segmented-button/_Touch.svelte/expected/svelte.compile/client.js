import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SegmentedButton, { Segment, Icon } from '@smui/segmented-button';
import Wrapper from '@smui/touch-target';

import {
	mdiFormatAlignLeft,
	mdiFormatAlignCenter,
	mdiFormatAlignRight,
	mdiFormatAlignJustify
} from '@mdi/js';

var root = $.from_svg(`<path fill="currentColor"></path>`);
var root_1 = $.from_html(`<!> <pre class="status"> </pre>`, 1);

export default function _Touch($$anchor) {
	const aligns = [
		{ name: 'Left', icon: mdiFormatAlignLeft },
		{ name: 'Center', icon: mdiFormatAlignCenter },
		{ name: 'Right', icon: mdiFormatAlignRight },
		{ name: 'Justify', icon: mdiFormatAlignJustify }
	];

	let align = $.state($.proxy(aligns[0]));
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		const segment = ($$anchor, segment = $.noop) => {
			Wrapper($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Segment($$anchor, {
						get segment() {
							return segment();
						},
						touch: true,
						get title() {
							return segment().name;
						},

						children: ($$anchor, $$slotProps) => {
							Icon($$anchor, {
								tag: 'svg',
								style: 'width: 1em; height: auto;',
								viewBox: '0 0 24 24',
								children: ($$anchor, $$slotProps) => {
									var path = root();

									$.template_effect(() => $.set_attribute(path, 'd', segment().icon));
									$.append($$anchor, path);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		SegmentedButton(node, {
			get segments() {
				return aligns;
			},
			singleSelect: true,
			key: (segment) => segment.name,
			get selected() {
				return $.get(align);
			},

			set selected($$value) {
				$.set(align, $$value, true);
			},
			segment,
			$$slots: { segment: true }
		});
	}

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `Aligned: ${$.get(align).name ?? ''}`));
	$.append($$anchor, fragment);
}