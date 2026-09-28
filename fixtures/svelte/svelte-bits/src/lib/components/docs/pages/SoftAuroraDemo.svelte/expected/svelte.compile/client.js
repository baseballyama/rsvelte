import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import SoftAurora from '$lib/components/library/Backgrounds/SoftAurora/SoftAurora.svelte';
import source from '$lib/components/library/Backgrounds/SoftAurora/SoftAurora.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Soft Aurora</h1> <!>`, 1);

export default function SoftAuroraDemo($$anchor) {
	const D = {
		speed: 0.6,
		scale: 1.5,
		brightness: 1,
		color1: '#f7f7f7',
		color2: '#ff8a3d',
		bandHeight: 0.5,
		bandSpread: 1,
		colorSpeed: 1,
		enableMouseInteraction: true
	};

	let speed = $.state($.proxy(D.speed));
	let scale = $.state($.proxy(D.scale));
	let brightness = $.state($.proxy(D.brightness));
	let color1 = $.state($.proxy(D.color1));
	let color2 = $.state($.proxy(D.color2));
	let bandHeight = $.state($.proxy(D.bandHeight));
	let bandSpread = $.state($.proxy(D.bandSpread));
	let colorSpeed = $.state($.proxy(D.colorSpeed));
	let enableMouseInteraction = $.state($.proxy(D.enableMouseInteraction));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(speed) !== D.speed || $.get(scale) !== D.scale || $.get(brightness) !== D.brightness || $.get(color1) !== D.color1 || $.get(color2) !== D.color2 || $.get(bandHeight) !== D.bandHeight || $.get(bandSpread) !== D.bandSpread || $.get(colorSpeed) !== D.colorSpeed || $.get(enableMouseInteraction) !== D.enableMouseInteraction);

	function reset() {
		$.set(speed, D.speed, true);
		$.set(scale, D.scale, true);
		$.set(brightness, D.brightness, true);
		$.set(color1, D.color1, true);
		$.set(color2, D.color2, true);
		$.set(bandHeight, D.bandHeight, true);
		$.set(bandSpread, D.bandSpread, true);
		$.set(colorSpeed, D.colorSpeed, true);
		$.set(enableMouseInteraction, D.enableMouseInteraction, true);
	}

	const usage = $.derived(() => `${sO}
  import SoftAurora from '$lib/components/SoftAurora.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <SoftAurora color1="${$.get(color1)}" color2="${$.get(color2)}" speed={${$.get(speed)}} />
</div>`);

	const props = [
		{
			name: 'speed',
			type: 'number',
			default: '0.6',
			description: 'Animation speed.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1.5',
			description: 'Noise scale.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '1',
			description: 'Overall brightness.'
		},

		{
			name: 'color1',
			type: 'string',
			default: '"#f7f7f7"',
			description: 'Layer 1 color.'
		},

		{
			name: 'color2',
			type: 'string',
			default: '"#e100ff"',
			description: 'Layer 2 color.'
		},

		{
			name: 'noiseFrequency',
			type: 'number',
			default: '2.5',
			description: 'Noise frequency.'
		},

		{
			name: 'noiseAmplitude',
			type: 'number',
			default: '1',
			description: 'Noise amplitude.'
		},

		{
			name: 'bandHeight',
			type: 'number',
			default: '0.5',
			description: 'Aurora band height.'
		},

		{
			name: 'bandSpread',
			type: 'number',
			default: '1',
			description: 'Aurora band spread.'
		},

		{
			name: 'octaveDecay',
			type: 'number',
			default: '0.1',
			description: 'Octave decay.'
		},

		{
			name: 'layerOffset',
			type: 'number',
			default: '0',
			description: 'Second layer offset.'
		},

		{
			name: 'colorSpeed',
			type: 'number',
			default: '1',
			description: 'Color cycle speed.'
		},

		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Mouse interaction.'
		},

		{
			name: 'mouseInfluence',
			type: 'number',
			default: '0.25',
			description: 'Mouse influence.'
		}
	];

	var fragment = root_2();

	$.head('1hpmr5a', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Soft Aurora - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			SoftAurora(node_1, {
				get speed() {
					return $.get(speed);
				},

				get scale() {
					return $.get(scale);
				},

				get brightness() {
					return $.get(brightness);
				},

				get color1() {
					return $.get(color1);
				},

				get color2() {
					return $.get(color2);
				},

				get bandHeight() {
					return $.get(bandHeight);
				},

				get bandSpread() {
					return $.get(bandSpread);
				},

				get colorSpeed() {
					return $.get(colorSpeed);
				},

				get enableMouseInteraction() {
					return $.get(enableMouseInteraction);
				}
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
				slug: 'soft-aurora',
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
					var node_3 = $.first_child(fragment_3);

					PreviewColorPicker(node_3, {
						title: 'Color 1',
						get value() {
							return $.get(color1);
						},
						onChange: (v) => $.set(color1, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Color 2',
						get value() {
							return $.get(color2);
						},
						onChange: (v) => $.set(color2, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Scale',
						min: 0.1,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => $.set(scale, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Brightness',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(brightness);
						},
						onChange: (v) => $.set(brightness, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Band Height',
						min: -1,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(bandHeight);
						},
						onChange: (v) => $.set(bandHeight, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Band Spread',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(bandSpread);
						},
						onChange: (v) => $.set(bandSpread, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Color Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(colorSpeed);
						},
						onChange: (v) => $.set(colorSpeed, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSwitch(node_11, {
						title: 'Mouse Interaction',
						get checked() {
							return $.get(enableMouseInteraction);
						},
						onChange: (v) => $.set(enableMouseInteraction, v, true)
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
			componentName: 'SoftAurora',
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