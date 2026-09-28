import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import MagicRings from '$lib/components/library/Animations/MagicRings/MagicRings.svelte';
import source from '$lib/components/library/Animations/MagicRings/MagicRings.svelte?raw';

var root = $.from_html(`<div style="position:relative;width:100%;height:400px;border-radius:14px;overflow:hidden;background:var(--bg-body);"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Magic Rings</h1> <!>`, 1);

export default function MagicRingsDemo($$anchor) {
	const DEFAULTS = {
		color: '#FF3E00',
		colorTwo: '#FF8A4C',
		speed: 1,
		ringCount: 6,
		attenuation: 10,
		lineThickness: 2,
		baseRadius: 0.35,
		radiusStep: 0.1,
		scaleRate: 0.1,
		opacity: 1,
		blur: 0,
		noiseAmount: 0.1,
		rotation: 0,
		ringGap: 1.5,
		fadeIn: 0.7,
		fadeOut: 0.5,
		followMouse: true,
		mouseInfluence: 0.2,
		hoverScale: 1.2,
		parallax: 0.05,
		clickBurst: true
	};

	let color = $.state($.proxy(DEFAULTS.color));
	let colorTwo = $.state($.proxy(DEFAULTS.colorTwo));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let ringCount = $.state($.proxy(DEFAULTS.ringCount));
	let attenuation = $.state($.proxy(DEFAULTS.attenuation));
	let lineThickness = $.state($.proxy(DEFAULTS.lineThickness));
	let baseRadius = $.state($.proxy(DEFAULTS.baseRadius));
	let radiusStep = $.state($.proxy(DEFAULTS.radiusStep));
	let scaleRate = $.state($.proxy(DEFAULTS.scaleRate));
	let opacity = $.state($.proxy(DEFAULTS.opacity));
	let blur = $.state($.proxy(DEFAULTS.blur));
	let noiseAmount = $.state($.proxy(DEFAULTS.noiseAmount));
	let rotation = $.state($.proxy(DEFAULTS.rotation));
	let ringGap = $.state($.proxy(DEFAULTS.ringGap));
	let fadeIn = $.state($.proxy(DEFAULTS.fadeIn));
	let fadeOut = $.state($.proxy(DEFAULTS.fadeOut));
	let followMouse = $.state($.proxy(DEFAULTS.followMouse));
	let mouseInfluence = $.state($.proxy(DEFAULTS.mouseInfluence));
	let hoverScale = $.state($.proxy(DEFAULTS.hoverScale));
	let parallax = $.state($.proxy(DEFAULTS.parallax));
	let clickBurst = $.state($.proxy(DEFAULTS.clickBurst));
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(color) !== DEFAULTS.color || $.get(colorTwo) !== DEFAULTS.colorTwo || $.get(speed) !== DEFAULTS.speed || $.get(ringCount) !== DEFAULTS.ringCount || $.get(attenuation) !== DEFAULTS.attenuation || $.get(lineThickness) !== DEFAULTS.lineThickness || $.get(baseRadius) !== DEFAULTS.baseRadius || $.get(radiusStep) !== DEFAULTS.radiusStep || $.get(scaleRate) !== DEFAULTS.scaleRate || $.get(opacity) !== DEFAULTS.opacity || $.get(blur) !== DEFAULTS.blur || $.get(noiseAmount) !== DEFAULTS.noiseAmount || $.get(rotation) !== DEFAULTS.rotation || $.get(ringGap) !== DEFAULTS.ringGap || $.get(fadeIn) !== DEFAULTS.fadeIn || $.get(fadeOut) !== DEFAULTS.fadeOut || $.get(followMouse) !== DEFAULTS.followMouse || $.get(mouseInfluence) !== DEFAULTS.mouseInfluence || $.get(hoverScale) !== DEFAULTS.hoverScale || $.get(parallax) !== DEFAULTS.parallax || $.get(clickBurst) !== DEFAULTS.clickBurst);

	function reset() {
		$.set(color, DEFAULTS.color, true);
		$.set(colorTwo, DEFAULTS.colorTwo, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(ringCount, DEFAULTS.ringCount, true);
		$.set(attenuation, DEFAULTS.attenuation, true);
		$.set(lineThickness, DEFAULTS.lineThickness, true);
		$.set(baseRadius, DEFAULTS.baseRadius, true);
		$.set(radiusStep, DEFAULTS.radiusStep, true);
		$.set(scaleRate, DEFAULTS.scaleRate, true);
		$.set(opacity, DEFAULTS.opacity, true);
		$.set(blur, DEFAULTS.blur, true);
		$.set(noiseAmount, DEFAULTS.noiseAmount, true);
		$.set(rotation, DEFAULTS.rotation, true);
		$.set(ringGap, DEFAULTS.ringGap, true);
		$.set(fadeIn, DEFAULTS.fadeIn, true);
		$.set(fadeOut, DEFAULTS.fadeOut, true);
		$.set(followMouse, DEFAULTS.followMouse, true);
		$.set(mouseInfluence, DEFAULTS.mouseInfluence, true);
		$.set(hoverScale, DEFAULTS.hoverScale, true);
		$.set(parallax, DEFAULTS.parallax, true);
		$.set(clickBurst, DEFAULTS.clickBurst, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import MagicRings from '$lib/components/MagicRings.svelte';
${scriptClose}

<MagicRings
  color="${$.get(color)}"
  colorTwo="${$.get(colorTwo)}"
  speed={${$.get(speed)}}
  ringCount={${$.get(ringCount)}}
  attenuation={${$.get(attenuation)}}
  lineThickness={${$.get(lineThickness)}}
  baseRadius={${$.get(baseRadius)}}
  radiusStep={${$.get(radiusStep)}}
  scaleRate={${$.get(scaleRate)}}
  opacity={${$.get(opacity)}}
  blur={${$.get(blur)}}
  noiseAmount={${$.get(noiseAmount)}}
  rotation={${$.get(rotation)}}
  ringGap={${$.get(ringGap)}}
  fadeIn={${$.get(fadeIn)}}
  fadeOut={${$.get(fadeOut)}}
  followMouse={${$.get(followMouse)}}
  mouseInfluence={${$.get(mouseInfluence)}}
  hoverScale={${$.get(hoverScale)}}
  parallax={${$.get(parallax)}}
  clickBurst={${$.get(clickBurst)}}
/>`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"#FF3E00"',
			description: 'Primary ring color.'
		},

		{
			name: 'colorTwo',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Secondary color blended across rings.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed multiplier.'
		},

		{
			name: 'ringCount',
			type: 'number',
			default: '6',
			description: 'Number of rings (1–10).'
		},

		{
			name: 'attenuation',
			type: 'number',
			default: '10',
			description: 'How quickly ring intensity falls off.'
		},

		{
			name: 'lineThickness',
			type: 'number',
			default: '2',
			description: 'Stroke thickness multiplier.'
		},

		{
			name: 'baseRadius',
			type: 'number',
			default: '0.35',
			description: 'Radius of the innermost ring (0–0.5).'
		},

		{
			name: 'radiusStep',
			type: 'number',
			default: '0.1',
			description: 'Radius increment per ring.'
		},

		{
			name: 'scaleRate',
			type: 'number',
			default: '0.1',
			description: 'How much each ring grows per cycle.'
		},

		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Overall opacity (0–1).'
		},

		{
			name: 'blur',
			type: 'number',
			default: '0',
			description: 'CSS blur applied to the canvas (px).'
		},

		{
			name: 'noiseAmount',
			type: 'number',
			default: '0.1',
			description: 'Per-pixel noise amount.'
		},

		{
			name: 'rotation',
			type: 'number',
			default: '0',
			description: 'Rotation in degrees applied before render.'
		},

		{
			name: 'ringGap',
			type: 'number',
			default: '1.5',
			description: 'Falloff exponent that shapes ring gaps.'
		},

		{
			name: 'fadeIn',
			type: 'number',
			default: '0.7',
			description: 'Cycle fraction used for fade-in.'
		},

		{
			name: 'fadeOut',
			type: 'number',
			default: '0.5',
			description: 'Cycle fraction used for fade-out.'
		},

		{
			name: 'followMouse',
			type: 'boolean',
			default: 'false',
			description: 'Whether rings drift toward the cursor.'
		},

		{
			name: 'mouseInfluence',
			type: 'number',
			default: '0.2',
			description: 'Strength of mouse-driven offset.'
		},

		{
			name: 'hoverScale',
			type: 'number',
			default: '1.2',
			description: 'Scale multiplier on hover.'
		},

		{
			name: 'parallax',
			type: 'number',
			default: '0.05',
			description: 'Per-ring parallax offset multiplier.'
		},

		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'false',
			description: 'Trigger an expansion burst on click.'
		}
	];

	var fragment = root_2();

	$.head('1y548f0', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Magic Rings - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			MagicRings(node_1, {
				get color() {
					return $.get(color);
				},

				get colorTwo() {
					return $.get(colorTwo);
				},

				get speed() {
					return $.get(speed);
				},

				get ringCount() {
					return $.get(ringCount);
				},

				get attenuation() {
					return $.get(attenuation);
				},

				get lineThickness() {
					return $.get(lineThickness);
				},

				get baseRadius() {
					return $.get(baseRadius);
				},

				get radiusStep() {
					return $.get(radiusStep);
				},

				get scaleRate() {
					return $.get(scaleRate);
				},

				get opacity() {
					return $.get(opacity);
				},

				get blur() {
					return $.get(blur);
				},

				get noiseAmount() {
					return $.get(noiseAmount);
				},

				get rotation() {
					return $.get(rotation);
				},

				get ringGap() {
					return $.get(ringGap);
				},

				get fadeIn() {
					return $.get(fadeIn);
				},

				get fadeOut() {
					return $.get(fadeOut);
				},

				get followMouse() {
					return $.get(followMouse);
				},

				get mouseInfluence() {
					return $.get(mouseInfluence);
				},

				get hoverScale() {
					return $.get(hoverScale);
				},

				get parallax() {
					return $.get(parallax);
				},

				get clickBurst() {
					return $.get(clickBurst);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'magic-rings',
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
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewColorPicker(node_3, {
						title: 'Color Two',
						get value() {
							return $.get(colorTwo);
						},
						onChange: (v) => $.set(colorTwo, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						valueUnit: 'x',
						onChange: (v) => $.set(speed, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Ring Count',
						min: 1,
						max: 10,
						step: 1,
						get value() {
							return $.get(ringCount);
						},
						onChange: (v) => $.set(ringCount, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Attenuation',
						min: 1,
						max: 30,
						step: 0.5,
						get value() {
							return $.get(attenuation);
						},
						onChange: (v) => $.set(attenuation, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Line Thickness',
						min: 1,
						max: 10,
						step: 0.5,
						get value() {
							return $.get(lineThickness);
						},
						onChange: (v) => $.set(lineThickness, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Base Radius',
						min: 0.1,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(baseRadius);
						},
						onChange: (v) => $.set(baseRadius, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Radius Step',
						min: 0.05,
						max: 0.3,
						step: 0.01,
						get value() {
							return $.get(radiusStep);
						},
						onChange: (v) => $.set(radiusStep, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Scale Rate',
						min: 0,
						max: 0.2,
						step: 0.01,
						get value() {
							return $.get(scaleRate);
						},
						onChange: (v) => $.set(scaleRate, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(opacity);
						},
						onChange: (v) => $.set(opacity, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Blur',
						min: 0,
						max: 10,
						step: 0.5,
						get value() {
							return $.get(blur);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(blur, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Noise',
						min: 0,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(noiseAmount);
						},
						onChange: (v) => $.set(noiseAmount, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSlider(node_14, {
						title: 'Rotation',
						min: 0,
						max: 360,
						step: 1,
						get value() {
							return $.get(rotation);
						},
						valueUnit: '°',
						onChange: (v) => $.set(rotation, v, true)
					});

					var node_15 = $.sibling(node_14, 2);

					PreviewSlider(node_15, {
						title: 'Ring Gap',
						min: 1,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(ringGap);
						},
						onChange: (v) => $.set(ringGap, v, true)
					});

					var node_16 = $.sibling(node_15, 2);

					PreviewSlider(node_16, {
						title: 'Fade In',
						min: 0.1,
						max: 1.5,
						step: 0.05,
						get value() {
							return $.get(fadeIn);
						},
						onChange: (v) => $.set(fadeIn, v, true)
					});

					var node_17 = $.sibling(node_16, 2);

					PreviewSlider(node_17, {
						title: 'Fade Out',
						min: 0.1,
						max: 1.5,
						step: 0.05,
						get value() {
							return $.get(fadeOut);
						},
						onChange: (v) => $.set(fadeOut, v, true)
					});

					var node_18 = $.sibling(node_17, 2);

					PreviewSwitch(node_18, {
						title: 'Follow Mouse',
						get checked() {
							return $.get(followMouse);
						},
						onChange: (v) => $.set(followMouse, v, true)
					});

					var node_19 = $.sibling(node_18, 2);

					PreviewSlider(node_19, {
						title: 'Mouse Influence',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(mouseInfluence);
						},
						onChange: (v) => $.set(mouseInfluence, v, true)
					});

					var node_20 = $.sibling(node_19, 2);

					PreviewSlider(node_20, {
						title: 'Hover Scale',
						min: 1,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(hoverScale);
						},
						onChange: (v) => $.set(hoverScale, v, true)
					});

					var node_21 = $.sibling(node_20, 2);

					PreviewSlider(node_21, {
						title: 'Parallax',
						min: 0,
						max: 0.2,
						step: 0.01,
						get value() {
							return $.get(parallax);
						},
						onChange: (v) => $.set(parallax, v, true)
					});

					var node_22 = $.sibling(node_21, 2);

					PreviewSwitch(node_22, {
						title: 'Click Burst',
						get checked() {
							return $.get(clickBurst);
						},
						onChange: (v) => $.set(clickBurst, v, true)
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
			componentName: 'MagicRings',
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