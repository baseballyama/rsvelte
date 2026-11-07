import * as $ from 'svelte/internal/server';
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

export default function _IconsKeys($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let actions = [
			{ name: 'Link', icon: mdiLink, count: 0 },
			{ name: 'Image', icon: mdiImage, count: 0 }
		];

		let align = aligns[0];
		let format = [];
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="format-bar svelte-6mmqfv">`);

			{
				function segment($$renderer, segment) {
					Segment($$renderer, {
						segment,
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

			$$renderer.push(`<!----> `);

			{
				function segment($$renderer, segment) {
					Segment($$renderer, {
						segment,
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
				}

				SegmentedButton($$renderer, {
					segments: formats,
					key: (segment) => segment.name,
					get selected() {
						return format;
					},

					set selected($$value) {
						format = $$value;
						$$settled = false;
					},
					segment,
					$$slots: { segment: true }
				});
			}

			$$renderer.push(`<!----> `);

			{
				function segment($$renderer, segment) {
					Segment($$renderer, {
						segment,
						onclick: preventDefault(() => {
							segment.count += 1;
						}),

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

							$$renderer.push(`<!----> `);

							Label($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(segment.name)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}

				SegmentedButton($$renderer, {
					segments: actions,
					key: (segment) => segment.name,
					segment,
					$$slots: { segment: true }
				});
			}

			$$renderer.push(`<!----></div> <pre class="status">Aligned: ${$.escape(align.name)}, Format: ${$.escape(format.length ? format.map((f) => f.name).join(' & ') : 'None')}, ${$.escape(actions.map(({ name, count }) => `${name}s: ${count}`).join(', '))}</pre>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}