import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BlobCursor from '$lib/components/library/Animations/BlobCursor/BlobCursor.svelte';
import source from '$lib/components/library/Animations/BlobCursor/BlobCursor.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Blob Cursor</h1> <!>`, 1);

export default function BlobCursorDemo($$anchor) {
	const DEFAULTS = {
		blobType: 'circle',
		fillColor: '#FF8A4C',
		trailCount: 3,
		leadSize: 60,
		leadInner: 20,
		leadOpacity: 0.6,
		shadowBlur: 5,
		shadowOffsetX: 10,
		shadowOffsetY: 10,
		fastDuration: 0.1,
		slowDuration: 0.5
	};

	let blobType = $.state($.proxy(DEFAULTS.blobType));
	let fillColor = $.state($.proxy(DEFAULTS.fillColor));
	let trailCount = $.state($.proxy(DEFAULTS.trailCount));
	let leadSize = $.state($.proxy(DEFAULTS.leadSize));
	let leadInner = $.state($.proxy(DEFAULTS.leadInner));
	let leadOpacity = $.state($.proxy(DEFAULTS.leadOpacity));
	let shadowBlur = $.state($.proxy(DEFAULTS.shadowBlur));
	let shadowOffsetX = $.state($.proxy(DEFAULTS.shadowOffsetX));
	let shadowOffsetY = $.state($.proxy(DEFAULTS.shadowOffsetY));
	let fastDuration = $.state($.proxy(DEFAULTS.fastDuration));
	let slowDuration = $.state($.proxy(DEFAULTS.slowDuration));

	const sizes = $.derived(() => Array.from({ length: $.get(trailCount) }, (_, i) => i === 0
		? $.get(leadSize)
		: i === 1
			? Math.round($.get(leadSize) * 2.08)
			: Math.round($.get(leadSize) * 1.25)));

	const innerSizes = $.derived(() => Array.from({ length: $.get(trailCount) }, (_, i) => i === 0
		? $.get(leadInner)
		: i === 1
			? Math.round($.get(leadInner) * 1.75)
			: Math.round($.get(leadInner) * 1.25)));

	const opacities = $.derived(() => Array.from({ length: $.get(trailCount) }, () => $.get(leadOpacity)));
	const hasChanges = $.derived(() => $.get(blobType) !== DEFAULTS.blobType || $.get(fillColor) !== DEFAULTS.fillColor || $.get(trailCount) !== DEFAULTS.trailCount || $.get(leadSize) !== DEFAULTS.leadSize || $.get(leadInner) !== DEFAULTS.leadInner || $.get(leadOpacity) !== DEFAULTS.leadOpacity || $.get(shadowBlur) !== DEFAULTS.shadowBlur || $.get(shadowOffsetX) !== DEFAULTS.shadowOffsetX || $.get(shadowOffsetY) !== DEFAULTS.shadowOffsetY || $.get(fastDuration) !== DEFAULTS.fastDuration || $.get(slowDuration) !== DEFAULTS.slowDuration);

	function reset() {
		$.set(blobType, DEFAULTS.blobType, true);
		$.set(fillColor, DEFAULTS.fillColor, true);
		$.set(trailCount, DEFAULTS.trailCount, true);
		$.set(leadSize, DEFAULTS.leadSize, true);
		$.set(leadInner, DEFAULTS.leadInner, true);
		$.set(leadOpacity, DEFAULTS.leadOpacity, true);
		$.set(shadowBlur, DEFAULTS.shadowBlur, true);
		$.set(shadowOffsetX, DEFAULTS.shadowOffsetX, true);
		$.set(shadowOffsetY, DEFAULTS.shadowOffsetY, true);
		$.set(fastDuration, DEFAULTS.fastDuration, true);
		$.set(slowDuration, DEFAULTS.slowDuration, true);
	}

	const usage = $.derived(() => `<BlobCursor blobType="${$.get(blobType)}" fillColor="${$.get(fillColor)}" trailCount={${$.get(trailCount)}} sizes={[${$.get(sizes).join(', ')}]} innerSizes={[${$.get(innerSizes).join(', ')}]} opacities={[${$.get(opacities).join(', ')}]} fastDuration={${$.get(fastDuration)}} slowDuration={${$.get(slowDuration)}} />`);

	const props = [
		{
			name: 'blobType',
			type: '"circle" | "square"',
			default: '"circle"',
			description: 'Shape of the blobs.'
		},

		{
			name: 'fillColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Background color of each blob.'
		},

		{
			name: 'trailCount',
			type: 'number',
			default: '3',
			description: 'How many trailing blobs.'
		},

		{
			name: 'sizes',
			type: 'number[]',
			default: '[60, 125, 75]',
			description: 'Sizes (px). Length must be ≥ trailCount.'
		},

		{
			name: 'innerSizes',
			type: 'number[]',
			default: '[20, 35, 25]',
			description: 'Inner-dot sizes (px).'
		},

		{
			name: 'innerColor',
			type: 'string',
			default: '"rgba(255,255,255,0.8)"',
			description: 'Inner-dot color.'
		},

		{
			name: 'opacities',
			type: 'number[]',
			default: '[0.6, 0.6, 0.6]',
			description: 'Per-blob opacity.'
		},

		{
			name: 'shadowColor',
			type: 'string',
			default: '"rgba(0,0,0,0.75)"',
			description: 'Box-shadow color.'
		},

		{
			name: 'shadowBlur',
			type: 'number',
			default: '5',
			description: 'Box-shadow blur radius (px).'
		},

		{
			name: 'shadowOffsetX',
			type: 'number',
			default: '10',
			description: 'Box-shadow X offset (px).'
		},

		{
			name: 'shadowOffsetY',
			type: 'number',
			default: '10',
			description: 'Box-shadow Y offset (px).'
		},

		{
			name: 'filterId',
			type: 'string',
			default: '"blob"',
			description: 'Custom SVG filter ID.'
		},

		{
			name: 'filterStdDeviation',
			type: 'number',
			default: '30',
			description: 'feGaussianBlur stdDeviation.'
		},

		{
			name: 'useFilter',
			type: 'boolean',
			default: 'true',
			description: 'Enable the SVG goo filter.'
		},

		{
			name: 'fastDuration',
			type: 'number',
			default: '0.1',
			description: 'GSAP duration for the lead blob.'
		},

		{
			name: 'slowDuration',
			type: 'number',
			default: '0.5',
			description: 'GSAP duration for the following blobs.'
		}
	];

	var fragment = root_2();

	$.head('5hhflv', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Blob Cursor - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			BlobCursor(node_1, {
				get blobType() {
					return $.get(blobType);
				},

				get fillColor() {
					return $.get(fillColor);
				},

				get trailCount() {
					return $.get(trailCount);
				},

				get sizes() {
					return $.get(sizes);
				},

				get innerSizes() {
					return $.get(innerSizes);
				},

				get opacities() {
					return $.get(opacities);
				},

				get shadowBlur() {
					return $.get(shadowBlur);
				},

				get shadowOffsetX() {
					return $.get(shadowOffsetX);
				},

				get shadowOffsetY() {
					return $.get(shadowOffsetY);
				},

				get fastDuration() {
					return $.get(fastDuration);
				},

				get slowDuration() {
					return $.get(slowDuration);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'blob-cursor',
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
					var fragment_3 = root_1();
					var node_2 = $.first_child(fragment_3);

					PreviewColorPicker(node_2, {
						title: 'Fill Color',
						get value() {
							return $.get(fillColor);
						},
						onChange: (v) => $.set(fillColor, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSelect(node_3, {
						title: 'Blob Type',
						get value() {
							return $.get(blobType);
						},

						options: [
							{ label: 'Circle', value: 'circle' },
							{ label: 'Square', value: 'square' }
						],
						onChange: (v) => $.set(blobType, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Trail Count',
						min: 1,
						max: 5,
						step: 1,
						get value() {
							return $.get(trailCount);
						},
						onChange: (v) => $.set(trailCount, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Lead Blob Size',
						min: 10,
						max: 200,
						step: 1,
						get value() {
							return $.get(leadSize);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(leadSize, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Lead Inner Dot Size',
						min: 1,
						max: 100,
						step: 1,
						get value() {
							return $.get(leadInner);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(leadInner, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Lead Blob Opacity',
						min: 0.1,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(leadOpacity);
						},
						onChange: (v) => $.set(leadOpacity, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Shadow Blur',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(shadowBlur);
						},
						onChange: (v) => $.set(shadowBlur, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Shadow Offset X',
						min: -50,
						max: 50,
						step: 1,
						get value() {
							return $.get(shadowOffsetX);
						},
						onChange: (v) => $.set(shadowOffsetX, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Shadow Offset Y',
						min: -50,
						max: 50,
						step: 1,
						get value() {
							return $.get(shadowOffsetY);
						},
						onChange: (v) => $.set(shadowOffsetY, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Fast Duration',
						min: 0.01,
						max: 2,
						step: 0.01,
						get value() {
							return $.get(fastDuration);
						},
						valueUnit: 's',
						onChange: (v) => $.set(fastDuration, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Slow Duration',
						min: 0.01,
						max: 3,
						step: 0.01,
						get value() {
							return $.get(slowDuration);
						},
						valueUnit: 's',
						onChange: (v) => $.set(slowDuration, v, true)
					});

					$.append($$anchor, fragment_3);
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
			componentName: 'BlobCursor',
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