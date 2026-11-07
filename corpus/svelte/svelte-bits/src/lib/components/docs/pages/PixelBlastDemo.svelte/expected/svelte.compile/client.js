import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { untrack } from 'svelte';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import PixelBlast from '$lib/components/library/Backgrounds/PixelBlast/PixelBlast.svelte';
import source from '$lib/components/library/Backgrounds/PixelBlast/PixelBlast.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Pixel Blast</h1> <!>`, 1);

export default function PixelBlastDemo($$anchor, $$props) {
	$.push($$props, true);

	const D = {
		variant: 'square',
		pixelSize: 3,
		color: '#ff8a3d',
		patternScale: 2,
		patternDensity: 1,
		liquid: false,
		liquidStrength: 0.1,
		liquidRadius: 1,
		pixelSizeJitter: 0,
		enableRipples: true,
		rippleIntensityScale: 1,
		rippleThickness: 0.1,
		rippleSpeed: 0.3,
		liquidWobbleSpeed: 4.5,
		speed: 0.5,
		transparent: true,
		edgeFade: 0.5,
		noiseAmount: 0
	};

	let variant = $.state($.proxy(D.variant));
	let pixelSize = $.state($.proxy(D.pixelSize));
	let color = $.state($.proxy(D.color));
	let patternScale = $.state($.proxy(D.patternScale));
	let patternDensity = $.state($.proxy(D.patternDensity));
	let liquid = $.state($.proxy(D.liquid));
	let liquidStrength = $.state($.proxy(D.liquidStrength));
	let liquidRadius = $.state($.proxy(D.liquidRadius));
	let pixelSizeJitter = $.state($.proxy(D.pixelSizeJitter));
	let enableRipples = $.state($.proxy(D.enableRipples));
	let rippleIntensityScale = $.state($.proxy(D.rippleIntensityScale));
	let rippleThickness = $.state($.proxy(D.rippleThickness));
	let rippleSpeed = $.state($.proxy(D.rippleSpeed));
	let liquidWobbleSpeed = $.state($.proxy(D.liquidWobbleSpeed));
	let speed = $.state($.proxy(D.speed));
	let transparent = $.state($.proxy(D.transparent));
	let edgeFade = $.state($.proxy(D.edgeFade));
	let noiseAmount = $.state($.proxy(D.noiseAmount));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(variant) !== D.variant || $.get(pixelSize) !== D.pixelSize || $.get(color) !== D.color || $.get(patternScale) !== D.patternScale || $.get(patternDensity) !== D.patternDensity || $.get(liquid) !== D.liquid || $.get(liquidStrength) !== D.liquidStrength || $.get(liquidRadius) !== D.liquidRadius || $.get(pixelSizeJitter) !== D.pixelSizeJitter || $.get(enableRipples) !== D.enableRipples || $.get(rippleIntensityScale) !== D.rippleIntensityScale || $.get(rippleThickness) !== D.rippleThickness || $.get(rippleSpeed) !== D.rippleSpeed || $.get(liquidWobbleSpeed) !== D.liquidWobbleSpeed || $.get(speed) !== D.speed || $.get(transparent) !== D.transparent || $.get(edgeFade) !== D.edgeFade || $.get(noiseAmount) !== D.noiseAmount);

	function reset() {
		$.set(variant, D.variant, true);
		$.set(pixelSize, D.pixelSize, true);
		$.set(color, D.color, true);
		$.set(patternScale, D.patternScale, true);
		$.set(patternDensity, D.patternDensity, true);
		$.set(liquid, D.liquid, true);
		$.set(liquidStrength, D.liquidStrength, true);
		$.set(liquidRadius, D.liquidRadius, true);
		$.set(pixelSizeJitter, D.pixelSizeJitter, true);
		$.set(enableRipples, D.enableRipples, true);
		$.set(rippleIntensityScale, D.rippleIntensityScale, true);
		$.set(rippleThickness, D.rippleThickness, true);
		$.set(rippleSpeed, D.rippleSpeed, true);
		$.set(liquidWobbleSpeed, D.liquidWobbleSpeed, true);
		$.set(speed, D.speed, true);
		$.set(transparent, D.transparent, true);
		$.set(edgeFade, D.edgeFade, true);
		$.set(noiseAmount, D.noiseAmount, true);
	}

	const usage = $.derived(() => `${sO}
  import PixelBlast from '$lib/components/PixelBlast.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <PixelBlast variant="${$.get(variant)}" color="${$.get(color)}" pixelSize={${$.get(pixelSize)}} />
</div>`);

	const props = [
		{
			name: 'variant',
			type: "'square'|'circle'|'triangle'|'diamond'",
			default: "'square'",
			description: 'Pixel shape.'
		},

		{
			name: 'pixelSize',
			type: 'number',
			default: '3',
			description: 'Pixel cell size.'
		},

		{
			name: 'color',
			type: 'string',
			default: "'#B497CF'",
			description: 'Color.'
		},

		{
			name: 'antialias',
			type: 'boolean',
			default: 'true',
			description: 'WebGL antialiasing.'
		},

		{
			name: 'patternScale',
			type: 'number',
			default: '2',
			description: 'fbm scale.'
		},

		{
			name: 'patternDensity',
			type: 'number',
			default: '1',
			description: 'Density bias.'
		},

		{
			name: 'liquid',
			type: 'boolean',
			default: 'false',
			description: 'Enable liquid distortion.'
		},

		{
			name: 'liquidStrength',
			type: 'number',
			default: '0.1',
			description: 'Liquid distortion strength.'
		},

		{
			name: 'liquidRadius',
			type: 'number',
			default: '1',
			description: 'Liquid touch radius.'
		},

		{
			name: 'liquidWobbleSpeed',
			type: 'number',
			default: '4.5',
			description: 'Liquid wobble freq.'
		},

		{
			name: 'pixelSizeJitter',
			type: 'number',
			default: '0',
			description: 'Per-cell size jitter.'
		},

		{
			name: 'enableRipples',
			type: 'boolean',
			default: 'true',
			description: 'Click ripple bursts.'
		},

		{
			name: 'rippleIntensityScale',
			type: 'number',
			default: '1',
			description: 'Ripple intensity.'
		},

		{
			name: 'rippleThickness',
			type: 'number',
			default: '0.1',
			description: 'Ripple ring thickness.'
		},

		{
			name: 'rippleSpeed',
			type: 'number',
			default: '0.3',
			description: 'Ripple expansion speed.'
		},

		{
			name: 'autoPauseOffscreen',
			type: 'boolean',
			default: 'true',
			description: 'Pause when offscreen.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.5',
			description: 'Animation speed.'
		},

		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Transparent background.'
		},

		{
			name: 'edgeFade',
			type: 'number',
			default: '0.5',
			description: 'Edge fade amount.'
		},

		{
			name: 'noiseAmount',
			type: 'number',
			default: '0',
			description: 'Postprocess grain.'
		}
	];

	let key = $.state(0);

	$.user_effect(() => {
		void $.get(liquid);
		untrack(() => $.update(key));
	});

	var fragment = root_2();

	// noiseAmount and antialias also require reinit
	$.head('1h9yk0c', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Pixel Blast - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				PixelBlast($$anchor, {
					get variant() {
						return $.get(variant);
					},

					get pixelSize() {
						return $.get(pixelSize);
					},

					get color() {
						return $.get(color);
					},

					get patternScale() {
						return $.get(patternScale);
					},

					get patternDensity() {
						return $.get(patternDensity);
					},

					get liquid() {
						return $.get(liquid);
					},

					get liquidStrength() {
						return $.get(liquidStrength);
					},

					get liquidRadius() {
						return $.get(liquidRadius);
					},

					get pixelSizeJitter() {
						return $.get(pixelSizeJitter);
					},

					get enableRipples() {
						return $.get(enableRipples);
					},

					get rippleIntensityScale() {
						return $.get(rippleIntensityScale);
					},

					get rippleThickness() {
						return $.get(rippleThickness);
					},

					get rippleSpeed() {
						return $.get(rippleSpeed);
					},

					get liquidWobbleSpeed() {
						return $.get(liquidWobbleSpeed);
					},

					get speed() {
						return $.get(speed);
					},

					get transparent() {
						return $.get(transparent);
					},

					get edgeFade() {
						return $.get(edgeFade);
					},

					get noiseAmount() {
						return $.get(noiseAmount);
					}
				});
			});

			var node_2 = $.sibling(node_1, 2);

			BackgroundContentToggle(node_2, {
				get showContent() {
					return $.get(showContent);
				},
				onToggle: (v) => $.set(showContent, v, true)
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'pixel-blast',
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
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					PreviewSelect(node_3, {
						title: 'Variant',
						get value() {
							return $.get(variant);
						},

						options: [
							{ label: 'Square', value: 'square' },
							{ label: 'Circle', value: 'circle' },
							{ label: 'Triangle', value: 'triangle' },
							{ label: 'Diamond', value: 'diamond' }
						],
						onChange: (v) => $.set(variant, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Pixel Size',
						min: 1,
						max: 20,
						step: 1,
						get value() {
							return $.get(pixelSize);
						},
						onChange: (v) => $.set(pixelSize, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Pattern Scale',
						min: 0.5,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(patternScale);
						},
						onChange: (v) => $.set(patternScale, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Pattern Density',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(patternDensity);
						},
						onChange: (v) => $.set(patternDensity, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Pixel Size Jitter',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(pixelSizeJitter);
						},
						onChange: (v) => $.set(pixelSizeJitter, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Edge Fade',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(edgeFade);
						},
						onChange: (v) => $.set(edgeFade, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSwitch(node_11, {
						title: 'Liquid',
						get checked() {
							return $.get(liquid);
						},
						onChange: (v) => $.set(liquid, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Liquid Strength',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(liquidStrength);
						},
						onChange: (v) => $.set(liquidStrength, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Liquid Radius',
						min: 0.1,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(liquidRadius);
						},
						onChange: (v) => $.set(liquidRadius, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSlider(node_14, {
						title: 'Wobble Speed',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(liquidWobbleSpeed);
						},
						onChange: (v) => $.set(liquidWobbleSpeed, v, true)
					});

					var node_15 = $.sibling(node_14, 2);

					PreviewSwitch(node_15, {
						title: 'Enable Ripples',
						get checked() {
							return $.get(enableRipples);
						},
						onChange: (v) => $.set(enableRipples, v, true)
					});

					var node_16 = $.sibling(node_15, 2);

					PreviewSlider(node_16, {
						title: 'Ripple Intensity',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(rippleIntensityScale);
						},
						onChange: (v) => $.set(rippleIntensityScale, v, true)
					});

					var node_17 = $.sibling(node_16, 2);

					PreviewSlider(node_17, {
						title: 'Ripple Thickness',
						min: 0.01,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(rippleThickness);
						},
						onChange: (v) => $.set(rippleThickness, v, true)
					});

					var node_18 = $.sibling(node_17, 2);

					PreviewSlider(node_18, {
						title: 'Ripple Speed',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(rippleSpeed);
						},
						onChange: (v) => $.set(rippleSpeed, v, true)
					});

					var node_19 = $.sibling(node_18, 2);

					PreviewSwitch(node_19, {
						title: 'Transparent',
						get checked() {
							return $.get(transparent);
						},
						onChange: (v) => $.set(transparent, v, true)
					});

					$.append($$anchor, fragment_4);
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
			onreset: () => {
				reset();
				$.update(key);
			},

			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'PixelBlast',
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
	$.pop();
}