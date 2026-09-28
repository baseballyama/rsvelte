import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ImageTrail from '$lib/components/library/Animations/ImageTrail/ImageTrail.svelte';
import source from '$lib/components/library/Animations/ImageTrail/ImageTrail.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<h1 class="sub-category">Image Trail</h1> <!>`, 1);

export default function ImageTrailDemo($$anchor) {
	const items = Array.from({ length: 8 }, (_, i) => `https://picsum.photos/300/300?random=${i + 10}`);
	const DEFAULTS = { variant: 1 };
	let variant = $.state($.proxy(DEFAULTS.variant));
	const hasChanges = $.derived(() => $.get(variant) !== DEFAULTS.variant);

	function reset() {
		$.set(variant, DEFAULTS.variant, true);
	}

	const usage = $.derived(() => `<ImageTrail items={images} variant={${$.get(variant)}} />`);

	const props = [
		{
			name: 'items',
			type: 'string[]',
			default: '[]',
			description: 'Image URLs to cycle through the trail.'
		},

		{
			name: 'variant',
			type: 'number',
			default: '1',
			description: 'Trail behavior variant (1-8).'
		}
	];

	var fragment = root_1();

	$.head('1rvbtb9', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Image Trail - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(variant), ($$anchor) => {
				ImageTrail($$anchor, {
					get items() {
						return items;
					},

					get variant() {
						return $.get(variant);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'image-trail',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					PreviewSlider($$anchor, {
						title: 'Variant',
						min: 1,
						max: 8,
						step: 1,
						get value() {
							return $.get(variant);
						},
						onChange: (v) => $.set(variant, v, true)
					});
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'ImageTrail',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment);
}