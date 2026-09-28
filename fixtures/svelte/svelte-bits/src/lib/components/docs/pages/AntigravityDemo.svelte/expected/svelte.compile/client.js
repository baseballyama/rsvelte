import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Antigravity from '$lib/components/library/Animations/Antigravity/Antigravity.svelte';
import source from '$lib/components/library/Animations/Antigravity/Antigravity.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:600px;overflow:hidden;"><div style="position:absolute;inset:0;"><!></div></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Antigravity</h1> <!>`, 1);

export default function AntigravityDemo($$anchor) {
	const DEFAULTS = {
		count: 300,
		color: '#FF8A4C',
		particleShape: 'capsule',
		magnetRadius: 10,
		ringRadius: 10,
		waveSpeed: 0.4,
		waveAmplitude: 1,
		particleSize: 2,
		lerpSpeed: 0.1,
		autoAnimate: false,
		fieldStrength: 10
	};

	let count = $.state($.proxy(DEFAULTS.count));
	let color = $.state($.proxy(DEFAULTS.color));
	let particleShape = $.state($.proxy(DEFAULTS.particleShape));
	let magnetRadius = $.state($.proxy(DEFAULTS.magnetRadius));
	let ringRadius = $.state($.proxy(DEFAULTS.ringRadius));
	let waveSpeed = $.state($.proxy(DEFAULTS.waveSpeed));
	let waveAmplitude = $.state($.proxy(DEFAULTS.waveAmplitude));
	let particleSize = $.state($.proxy(DEFAULTS.particleSize));
	let lerpSpeed = $.state($.proxy(DEFAULTS.lerpSpeed));
	let autoAnimate = $.state($.proxy(DEFAULTS.autoAnimate));
	let fieldStrength = $.state($.proxy(DEFAULTS.fieldStrength));
	const hasChanges = $.derived(() => $.get(count) !== DEFAULTS.count || $.get(color) !== DEFAULTS.color || $.get(particleShape) !== DEFAULTS.particleShape || $.get(magnetRadius) !== DEFAULTS.magnetRadius || $.get(ringRadius) !== DEFAULTS.ringRadius || $.get(waveSpeed) !== DEFAULTS.waveSpeed || $.get(waveAmplitude) !== DEFAULTS.waveAmplitude || $.get(particleSize) !== DEFAULTS.particleSize || $.get(lerpSpeed) !== DEFAULTS.lerpSpeed || $.get(autoAnimate) !== DEFAULTS.autoAnimate || $.get(fieldStrength) !== DEFAULTS.fieldStrength);

	function reset() {
		$.set(count, DEFAULTS.count, true);
		$.set(color, DEFAULTS.color, true);
		$.set(particleShape, DEFAULTS.particleShape, true);
		$.set(magnetRadius, DEFAULTS.magnetRadius, true);
		$.set(ringRadius, DEFAULTS.ringRadius, true);
		$.set(waveSpeed, DEFAULTS.waveSpeed, true);
		$.set(waveAmplitude, DEFAULTS.waveAmplitude, true);
		$.set(particleSize, DEFAULTS.particleSize, true);
		$.set(lerpSpeed, DEFAULTS.lerpSpeed, true);
		$.set(autoAnimate, DEFAULTS.autoAnimate, true);
		$.set(fieldStrength, DEFAULTS.fieldStrength, true);
	}

	const usage = $.derived(() => `<Antigravity count={${$.get(count)}} color="${$.get(color)}" particleShape="${$.get(particleShape)}" magnetRadius={${$.get(magnetRadius)}} fieldStrength={${$.get(fieldStrength)}} />`);

	const props = [
		{
			name: 'count',
			type: 'number',
			default: '300',
			description: 'Number of particles.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#FF9FFC"',
			description: 'Particle color.'
		},

		{
			name: 'particleShape',
			type: '"capsule" | "sphere" | "box" | "tetrahedron"',
			default: '"capsule"',
			description: 'Geometry per particle.'
		},

		{
			name: 'magnetRadius',
			type: 'number',
			default: '10',
			description: 'Cursor pull radius.'
		},

		{
			name: 'ringRadius',
			type: 'number',
			default: '10',
			description: 'Idle ring formation radius.'
		},

		{
			name: 'waveSpeed',
			type: 'number',
			default: '0.4',
			description: 'Wave-motion speed.'
		},

		{
			name: 'waveAmplitude',
			type: 'number',
			default: '1',
			description: 'Wave amplitude.'
		},

		{
			name: 'particleSize',
			type: 'number',
			default: '2',
			description: 'Particle size scale.'
		},

		{
			name: 'lerpSpeed',
			type: 'number',
			default: '0.1',
			description: 'Lerp factor for following motion.'
		},

		{
			name: 'autoAnimate',
			type: 'boolean',
			default: 'false',
			description: 'Animate automatically when idle.'
		},

		{
			name: 'fieldStrength',
			type: 'number',
			default: '10',
			description: 'Strength of the magnetic field.'
		}
	];

	var fragment = root_2();

	$.head('9tmf2', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Antigravity - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			Antigravity(node_1, {
				get count() {
					return $.get(count);
				},

				get color() {
					return $.get(color);
				},

				get particleShape() {
					return $.get(particleShape);
				},

				get magnetRadius() {
					return $.get(magnetRadius);
				},

				get ringRadius() {
					return $.get(ringRadius);
				},

				get waveSpeed() {
					return $.get(waveSpeed);
				},

				get waveAmplitude() {
					return $.get(waveAmplitude);
				},

				get particleSize() {
					return $.get(particleSize);
				},

				get lerpSpeed() {
					return $.get(lerpSpeed);
				},

				get autoAnimate() {
					return $.get(autoAnimate);
				},

				get fieldStrength() {
					return $.get(fieldStrength);
				}
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'antigravity',
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

					PreviewSelect(node_3, {
						title: 'Particle Shape',
						get value() {
							return $.get(particleShape);
						},

						options: [
							{ label: 'Capsule', value: 'capsule' },
							{ label: 'Sphere', value: 'sphere' },
							{ label: 'Box', value: 'box' },
							{ label: 'Tetrahedron', value: 'tetrahedron' }
						],
						onChange: (v) => $.set(particleShape, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Count',
						min: 50,
						max: 1000,
						step: 10,
						get value() {
							return $.get(count);
						},
						onChange: (v) => $.set(count, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Magnet Radius',
						min: 1,
						max: 30,
						step: 1,
						get value() {
							return $.get(magnetRadius);
						},
						onChange: (v) => $.set(magnetRadius, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Ring Radius',
						min: 1,
						max: 30,
						step: 1,
						get value() {
							return $.get(ringRadius);
						},
						onChange: (v) => $.set(ringRadius, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Wave Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(waveSpeed);
						},
						onChange: (v) => $.set(waveSpeed, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Wave Amplitude',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(waveAmplitude);
						},
						onChange: (v) => $.set(waveAmplitude, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Particle Size',
						min: 0.5,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(particleSize);
						},
						onChange: (v) => $.set(particleSize, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Lerp Speed',
						min: 0.01,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(lerpSpeed);
						},
						onChange: (v) => $.set(lerpSpeed, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Field Strength',
						min: 1,
						max: 50,
						step: 1,
						get value() {
							return $.get(fieldStrength);
						},
						onChange: (v) => $.set(fieldStrength, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSwitch(node_12, {
						title: 'Auto Animate',
						get checked() {
							return $.get(autoAnimate);
						},
						onChange: (v) => $.set(autoAnimate, v, true)
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
			componentName: 'Antigravity',
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