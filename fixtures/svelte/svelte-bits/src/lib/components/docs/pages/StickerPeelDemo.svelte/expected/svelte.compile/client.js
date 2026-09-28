import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import StickerPeel from '$lib/components/library/Animations/StickerPeel/StickerPeel.svelte';
import source from '$lib/components/library/Animations/StickerPeel/StickerPeel.svelte?raw';
import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Sticker Peel</h1> <!>`, 1);

export default function StickerPeelDemo($$anchor) {
	const DEFAULTS = {
		rotate: 0,
		width: 200,
		peelBackHoverPct: 30,
		peelBackActivePct: 40,
		lightingIntensity: 0.1,
		shadowIntensity: 0.5,
		peelDirection: 0
	};

	let rotate = $.state($.proxy(DEFAULTS.rotate));
	let width = $.state($.proxy(DEFAULTS.width));
	let peelBackHoverPct = $.state($.proxy(DEFAULTS.peelBackHoverPct));
	let peelBackActivePct = $.state($.proxy(DEFAULTS.peelBackActivePct));
	let lightingIntensity = $.state($.proxy(DEFAULTS.lightingIntensity));
	let shadowIntensity = $.state($.proxy(DEFAULTS.shadowIntensity));
	let peelDirection = $.state($.proxy(DEFAULTS.peelDirection));
	const hasChanges = $.derived(() => $.get(rotate) !== DEFAULTS.rotate || $.get(width) !== DEFAULTS.width || $.get(peelBackHoverPct) !== DEFAULTS.peelBackHoverPct || $.get(peelBackActivePct) !== DEFAULTS.peelBackActivePct || $.get(lightingIntensity) !== DEFAULTS.lightingIntensity || $.get(shadowIntensity) !== DEFAULTS.shadowIntensity || $.get(peelDirection) !== DEFAULTS.peelDirection);

	function reset() {
		$.set(rotate, DEFAULTS.rotate, true);
		$.set(width, DEFAULTS.width, true);
		$.set(peelBackHoverPct, DEFAULTS.peelBackHoverPct, true);
		$.set(peelBackActivePct, DEFAULTS.peelBackActivePct, true);
		$.set(lightingIntensity, DEFAULTS.lightingIntensity, true);
		$.set(shadowIntensity, DEFAULTS.shadowIntensity, true);
		$.set(peelDirection, DEFAULTS.peelDirection, true);
	}

	const usage = $.derived(() => `<StickerPeel imageSrc="/sticker.png" rotate={${$.get(rotate)}} width={${$.get(width)}} peelBackHoverPct={${$.get(peelBackHoverPct)}} peelBackActivePct={${$.get(peelBackActivePct)}} lightingIntensity={${$.get(lightingIntensity)}} shadowIntensity={${$.get(shadowIntensity)}} peelDirection={${$.get(peelDirection)}} />`);

	const props = [
		{
			name: 'imageSrc',
			type: 'string',
			default: 'required',
			description: 'URL of the sticker image.'
		},

		{
			name: 'rotate',
			type: 'number',
			default: '30',
			description: 'Initial rotation (deg).'
		},

		{
			name: 'peelBackHoverPct',
			type: 'number',
			default: '30',
			description: 'Hover peel-back percentage.'
		},

		{
			name: 'peelBackActivePct',
			type: 'number',
			default: '40',
			description: 'Drag/active peel-back percentage.'
		},

		{
			name: 'peelEasing',
			type: 'string',
			default: '"power3.out"',
			description: 'GSAP easing for peel.'
		},

		{
			name: 'peelHoverEasing',
			type: 'string',
			default: '"power2.out"',
			description: 'GSAP easing for hover.'
		},

		{
			name: 'width',
			type: 'number',
			default: '200',
			description: 'Sticker width (px).'
		},

		{
			name: 'shadowIntensity',
			type: 'number',
			default: '0.6',
			description: 'Drop shadow intensity (0-1).'
		},

		{
			name: 'lightingIntensity',
			type: 'number',
			default: '0.1',
			description: 'Specular lighting intensity (0-1).'
		},

		{
			name: 'initialPosition',
			type: '"center" | { x, y }',
			default: '"center"',
			description: 'Initial draggable position.'
		},

		{
			name: 'peelDirection',
			type: 'number',
			default: '0',
			description: 'Peel direction in degrees.'
		}
	];

	var fragment = root_2();

	$.head('3s0qzb', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Sticker Peel - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			StickerPeel(node_1, {
				get imageSrc() {
					return logo;
				},

				get rotate() {
					return $.get(rotate);
				},

				get width() {
					return $.get(width);
				},

				get peelBackHoverPct() {
					return $.get(peelBackHoverPct);
				},

				get peelBackActivePct() {
					return $.get(peelBackActivePct);
				},

				get lightingIntensity() {
					return $.get(lightingIntensity);
				},

				get shadowIntensity() {
					return $.get(shadowIntensity);
				},

				get peelDirection() {
					return $.get(peelDirection);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'sticker-peel',
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

					PreviewSlider(node_2, {
						title: 'Rotate',
						min: -180,
						max: 180,
						step: 1,
						get value() {
							return $.get(rotate);
						},
						valueUnit: '°',
						onChange: (v) => $.set(rotate, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Width',
						min: 80,
						max: 400,
						step: 5,
						get value() {
							return $.get(width);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(width, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Peel Back Hover %',
						min: 0,
						max: 100,
						step: 1,
						get value() {
							return $.get(peelBackHoverPct);
						},
						valueUnit: '%',
						onChange: (v) => $.set(peelBackHoverPct, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Peel Back Active %',
						min: 0,
						max: 100,
						step: 1,
						get value() {
							return $.get(peelBackActivePct);
						},
						valueUnit: '%',
						onChange: (v) => $.set(peelBackActivePct, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Lighting Intensity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(lightingIntensity);
						},
						onChange: (v) => $.set(lightingIntensity, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Shadow Intensity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(shadowIntensity);
						},
						onChange: (v) => $.set(shadowIntensity, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Peel Direction',
						min: -180,
						max: 180,
						step: 1,
						get value() {
							return $.get(peelDirection);
						},
						valueUnit: '°',
						onChange: (v) => $.set(peelDirection, v, true)
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
			componentName: 'StickerPeel',
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