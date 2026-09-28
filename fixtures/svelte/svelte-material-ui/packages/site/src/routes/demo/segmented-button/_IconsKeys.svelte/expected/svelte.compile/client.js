import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { preventDefault } from '@smui/common/events';
import SegmentedButton, { Segment, Icon, Label } from '@smui/segmented-button';

import {
	mdiFormatAlignLeft,
	mdiFormatAlignCenter,
	mdiFormatAlignRight,
	mdiFormatAlignJustify,
	mdiFormatBold,
	mdiFormatItalic,
	mdiFormatUnderline,
	mdiLink,
	mdiImage
} from '@mdi/js';

var root = $.from_svg(`<path fill="currentColor"></path>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="format-bar svelte-6mmqfv"><!> <!> <!></div> <pre class="status"> </pre>`, 1);

export default function _IconsKeys($$anchor, $$props) {
	$.push($$props, true);

	const aligns = [
		{ name: 'Left', icon: mdiFormatAlignLeft },
		{ name: 'Center', icon: mdiFormatAlignCenter },
		{ name: 'Right', icon: mdiFormatAlignRight },
		{ name: 'Justify', icon: mdiFormatAlignJustify }
	];

	const formats = [
		{ name: 'Bold', icon: mdiFormatBold },
		{ name: 'Italic', icon: mdiFormatItalic },
		{ name: 'Underline', icon: mdiFormatUnderline }
	];

	let actions = $.proxy([
		{ name: 'Link', icon: mdiLink, count: 0 },
		{ name: 'Image', icon: mdiImage, count: 0 }
	]);

	let align = $.state($.proxy(aligns[0]));
	let format = $.state($.proxy([]));
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const segment = ($$anchor, segment = $.noop) => {
			Segment($$anchor, {
				get segment() {
					return segment();
				},

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

	var node_1 = $.sibling(node, 2);

	{
		const segment = ($$anchor, segment = $.noop) => {
			Segment($$anchor, {
				get segment() {
					return segment();
				},

				get title() {
					return segment().name;
				},

				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, {
						tag: 'svg',
						style: 'width: 1em; height: auto;',
						viewBox: '0 0 24 24',
						children: ($$anchor, $$slotProps) => {
							var path_1 = root();

							$.template_effect(() => $.set_attribute(path_1, 'd', segment().icon));
							$.append($$anchor, path_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		};

		SegmentedButton(node_1, {
			get segments() {
				return formats;
			},
			key: (segment) => segment.name,
			get selected() {
				return $.get(format);
			},

			set selected($$value) {
				$.set(format, $$value, true);
			},
			segment,
			$$slots: { segment: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const segment = ($$anchor, segment = $.noop) => {
			{
				let $0 = $.derived(() => preventDefault(() => {
					segment().count += 1;
				}));

				Segment($$anchor, {
					get segment() {
						return segment();
					},

					get onclick() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_6 = root_1();
						var node_3 = $.first_child(fragment_6);

						Icon(node_3, {
							tag: 'svg',
							style: 'width: 1em; height: auto;',
							viewBox: '0 0 24 24',
							children: ($$anchor, $$slotProps) => {
								var path_2 = root();

								$.template_effect(() => $.set_attribute(path_2, 'd', segment().icon));
								$.append($$anchor, path_2);
							},
							$$slots: { default: true }
						});

						var node_4 = $.sibling(node_3, 2);

						Label(node_4, {
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text();

								$.template_effect(() => $.set_text(text, segment().name));
								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_6);
					},
					$$slots: { default: true }
				});
			}
		};

		SegmentedButton(node_2, {
			get segments() {
				return actions;
			},
			key: (segment) => segment.name,
			segment,
			$$slots: { segment: true }
		});
	}

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_1 = $.only_child(pre);

	$.template_effect(($0, $1) => $.set_text(text_1, `Aligned: ${$.get(align).name ?? ''}, Format: ${$0 ?? ''}, ${$1 ?? ''}`), [
		() => $.get(format).length ? $.get(format).map((f) => f.name).join(' & ') : 'None',
		() => actions.map(({ name, count }) => `${name}s: ${count}`).join(', ')
	]);

	$.append($$anchor, fragment);
	$.pop();
}