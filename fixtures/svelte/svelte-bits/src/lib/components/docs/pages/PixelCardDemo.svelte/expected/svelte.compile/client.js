import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import PixelCard from '$lib/components/library/Components/PixelCard/PixelCard.svelte';
import source from '$lib/components/library/Components/PixelCard/PixelCard.svelte?raw';

var root = $.from_html(`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;"><span style="font-size:3rem;font-weight:900;mix-blend-mode:screen;color:#222222;user-select:none;">Hover Me.</span></div>`);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;overflow:hidden;"><!></div>`);
var root_2 = $.from_html(`<h1 class="sub-category">Pixel Card</h1> <!>`, 1);

export default function PixelCardDemo($$anchor) {
	const DEFAULT = 'default';
	let variant = $.state(DEFAULT);
	const hasChanges = $.derived(() => $.get(variant) !== DEFAULT);

	function reset() {
		$.set(variant, DEFAULT);
	}

	const usage = `<PixelCard variant="default">\n  <!-- content -->\n</PixelCard>`;

	const props = [
		{
			name: 'variant',
			type: '"default"|"blue"|"yellow"|"pink"',
			default: '"default"',
			description: 'Color scheme & animation style.'
		},

		{
			name: 'gap',
			type: 'number',
			default: 'varies',
			description: 'Pixel grid gap (px).'
		},

		{
			name: 'speed',
			type: 'number',
			default: 'varies',
			description: 'Animation speed modifier.'
		},

		{
			name: 'colors',
			type: 'string',
			default: '"#f8fafc,#f1f5f9,#cbd5e1"',
			description: 'Comma-separated palette.'
		},

		{
			name: 'noFocus',
			type: 'boolean',
			default: 'false',
			description: 'Disable focus trigger.'
		},

		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Additional class for wrapper.'
		}
	];

	var fragment = root_2();

	$.head('1ue4ftu', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Pixel Card - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			PixelCard(node_1, {
				get variant() {
					return $.get(variant);
				},

				children: ($$anchor, $$slotProps) => {
					var div_1 = root();

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'pixel-card',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					PreviewSelect($$anchor, {
						title: 'Variant',
						options: ['default', 'yellow', 'blue', 'pink'],
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
			componentName: 'PixelCard',
			usage,
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