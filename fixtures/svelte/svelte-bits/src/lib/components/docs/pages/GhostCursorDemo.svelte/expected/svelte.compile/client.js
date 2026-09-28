import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GhostCursor from '$lib/components/library/Animations/GhostCursor/GhostCursor.svelte';
import source from '$lib/components/library/Animations/GhostCursor/GhostCursor.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Ghost Cursor</h1> <!>`, 1);

export default function GhostCursorDemo($$anchor) {
	const DEFAULTS = {
		trailLength: 50,
		inertia: 0.5,
		grainIntensity: 0.05,
		bloomStrength: 0.1,
		bloomRadius: 1.0,
		bloomThreshold: 0.025,
		brightness: 2,
		color: '#FF8A4C',
		fadeDelayMs: 1000,
		fadeDurationMs: 1500
	};

	let trailLength = $.state($.proxy(DEFAULTS.trailLength));
	let inertia = $.state($.proxy(DEFAULTS.inertia));
	let grainIntensity = $.state($.proxy(DEFAULTS.grainIntensity));
	let bloomStrength = $.state($.proxy(DEFAULTS.bloomStrength));
	let bloomRadius = $.state($.proxy(DEFAULTS.bloomRadius));
	let bloomThreshold = $.state($.proxy(DEFAULTS.bloomThreshold));
	let brightness = $.state($.proxy(DEFAULTS.brightness));
	let color = $.state($.proxy(DEFAULTS.color));
	let fadeDelayMs = $.state($.proxy(DEFAULTS.fadeDelayMs));
	let fadeDurationMs = $.state($.proxy(DEFAULTS.fadeDurationMs));
	const hasChanges = $.derived(() => $.get(trailLength) !== DEFAULTS.trailLength || $.get(inertia) !== DEFAULTS.inertia || $.get(grainIntensity) !== DEFAULTS.grainIntensity || $.get(bloomStrength) !== DEFAULTS.bloomStrength || $.get(bloomRadius) !== DEFAULTS.bloomRadius || $.get(bloomThreshold) !== DEFAULTS.bloomThreshold || $.get(brightness) !== DEFAULTS.brightness || $.get(color) !== DEFAULTS.color || $.get(fadeDelayMs) !== DEFAULTS.fadeDelayMs || $.get(fadeDurationMs) !== DEFAULTS.fadeDurationMs);

	function reset() {
		$.set(trailLength, DEFAULTS.trailLength, true);
		$.set(inertia, DEFAULTS.inertia, true);
		$.set(grainIntensity, DEFAULTS.grainIntensity, true);
		$.set(bloomStrength, DEFAULTS.bloomStrength, true);
		$.set(bloomRadius, DEFAULTS.bloomRadius, true);
		$.set(bloomThreshold, DEFAULTS.bloomThreshold, true);
		$.set(brightness, DEFAULTS.brightness, true);
		$.set(color, DEFAULTS.color, true);
		$.set(fadeDelayMs, DEFAULTS.fadeDelayMs, true);
		$.set(fadeDurationMs, DEFAULTS.fadeDurationMs, true);
	}

	const usage = $.derived(() => `<GhostCursor trailLength={${$.get(trailLength)}} inertia={${$.get(inertia)}} brightness={${$.get(brightness)}} color="${$.get(color)}" />`);

	const props = [
		{
			name: 'trailLength',
			type: 'number',
			default: '50',
			description: 'Number of trail points kept.'
		},

		{
			name: 'inertia',
			type: 'number',
			default: '0.5',
			description: 'Trail inertia (0-1).'
		},

		{
			name: 'grainIntensity',
			type: 'number',
			default: '0.05',
			description: 'Film grain intensity.'
		},

		{
			name: 'bloomStrength',
			type: 'number',
			default: '0.1',
			description: 'Bloom post-process strength.'
		},

		{
			name: 'bloomRadius',
			type: 'number',
			default: '1.0',
			description: 'Bloom radius.'
		},

		{
			name: 'bloomThreshold',
			type: 'number',
			default: '0.025',
			description: 'Bloom luminance threshold.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '1',
			description: 'Trail brightness multiplier.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#B497CF"',
			description: 'Trail color.'
		},

		{
			name: 'mixBlendMode',
			type: 'string',
			default: '"screen"',
			description: 'CSS mix-blend-mode of overlay.'
		},

		{
			name: 'fadeDelayMs',
			type: 'number',
			default: 'undefined',
			description: 'Idle delay before fading.'
		},

		{
			name: 'fadeDurationMs',
			type: 'number',
			default: 'undefined',
			description: 'Idle fade duration.'
		}
	];

	var fragment = root_2();

	$.head('1yuyzsz', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Ghost Cursor - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			GhostCursor(node_1, {
				get trailLength() {
					return $.get(trailLength);
				},

				get inertia() {
					return $.get(inertia);
				},

				get grainIntensity() {
					return $.get(grainIntensity);
				},

				get bloomStrength() {
					return $.get(bloomStrength);
				},

				get bloomRadius() {
					return $.get(bloomRadius);
				},

				get bloomThreshold() {
					return $.get(bloomThreshold);
				},

				get brightness() {
					return $.get(brightness);
				},

				get color() {
					return $.get(color);
				},

				get fadeDelayMs() {
					return $.get(fadeDelayMs);
				},

				get fadeDurationMs() {
					return $.get(fadeDurationMs);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'ghost-cursor',
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

					PreviewSlider(node_3, {
						title: 'Trail Length',
						min: 5,
						max: 150,
						step: 1,
						get value() {
							return $.get(trailLength);
						},
						onChange: (v) => $.set(trailLength, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Inertia',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(inertia);
						},
						onChange: (v) => $.set(inertia, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Brightness',
						min: 0.5,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(brightness);
						},
						onChange: (v) => $.set(brightness, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Grain Intensity',
						min: 0,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(grainIntensity);
						},
						onChange: (v) => $.set(grainIntensity, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Bloom Strength',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(bloomStrength);
						},
						onChange: (v) => $.set(bloomStrength, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Bloom Radius',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(bloomRadius);
						},
						onChange: (v) => $.set(bloomRadius, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Bloom Threshold',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(bloomThreshold);
						},
						onChange: (v) => $.set(bloomThreshold, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Fade Delay',
						min: 0,
						max: 5000,
						step: 100,
						get value() {
							return $.get(fadeDelayMs);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(fadeDelayMs, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Fade Duration',
						min: 100,
						max: 5000,
						step: 100,
						get value() {
							return $.get(fadeDurationMs);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(fadeDurationMs, v, true)
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
			componentName: 'GhostCursor',
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