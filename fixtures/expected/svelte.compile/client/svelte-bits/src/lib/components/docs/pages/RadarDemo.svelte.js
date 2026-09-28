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
import Radar from '$lib/components/library/Backgrounds/Radar/Radar.svelte';
import source from '$lib/components/library/Backgrounds/Radar/Radar.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Radar</h1> <!>`, 1);

export default function RadarDemo($$anchor) {
	const D = {
		speed: 1,
		scale: 0.5,
		ringCount: 10,
		spokeCount: 10,
		ringThickness: 0.05,
		spokeThickness: 0.01,
		sweepSpeed: 1,
		sweepWidth: 2,
		sweepLobes: 1,
		color: '#ff8a3d',
		brightness: 1,
		enableMouseInteraction: true
	};

	let speed = $.state($.proxy(D.speed));
	let scale = $.state($.proxy(D.scale));
	let ringCount = $.state($.proxy(D.ringCount));
	let spokeCount = $.state($.proxy(D.spokeCount));
	let ringThickness = $.state($.proxy(D.ringThickness));
	let spokeThickness = $.state($.proxy(D.spokeThickness));
	let sweepSpeed = $.state($.proxy(D.sweepSpeed));
	let sweepWidth = $.state($.proxy(D.sweepWidth));
	let sweepLobes = $.state($.proxy(D.sweepLobes));
	let color = $.state($.proxy(D.color));
	let brightness = $.state($.proxy(D.brightness));
	let enableMouseInteraction = $.state($.proxy(D.enableMouseInteraction));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(speed) !== D.speed || $.get(scale) !== D.scale || $.get(ringCount) !== D.ringCount || $.get(spokeCount) !== D.spokeCount || $.get(ringThickness) !== D.ringThickness || $.get(spokeThickness) !== D.spokeThickness || $.get(sweepSpeed) !== D.sweepSpeed || $.get(sweepWidth) !== D.sweepWidth || $.get(sweepLobes) !== D.sweepLobes || $.get(color) !== D.color || $.get(brightness) !== D.brightness || $.get(enableMouseInteraction) !== D.enableMouseInteraction);

	function reset() {
		$.set(speed, D.speed, true);
		$.set(scale, D.scale, true);
		$.set(ringCount, D.ringCount, true);
		$.set(spokeCount, D.spokeCount, true);
		$.set(ringThickness, D.ringThickness, true);
		$.set(spokeThickness, D.spokeThickness, true);
		$.set(sweepSpeed, D.sweepSpeed, true);
		$.set(sweepWidth, D.sweepWidth, true);
		$.set(sweepLobes, D.sweepLobes, true);
		$.set(color, D.color, true);
		$.set(brightness, D.brightness, true);
		$.set(enableMouseInteraction, D.enableMouseInteraction, true);
	}

	const usage = $.derived(() => `${sO}
  import Radar from '$lib/components/Radar.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Radar color="${$.get(color)}" speed={${$.get(speed)}} />
</div>`);

	const props = [
		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '0.5',
			description: 'Pattern scale.'
		},

		{
			name: 'ringCount',
			type: 'number',
			default: '10',
			description: 'Number of rings.'
		},

		{
			name: 'spokeCount',
			type: 'number',
			default: '10',
			description: 'Number of spokes.'
		},

		{
			name: 'ringThickness',
			type: 'number',
			default: '0.05',
			description: 'Ring thickness.'
		},

		{
			name: 'spokeThickness',
			type: 'number',
			default: '0.01',
			description: 'Spoke thickness.'
		},

		{
			name: 'sweepSpeed',
			type: 'number',
			default: '1',
			description: 'Sweep speed.'
		},

		{
			name: 'sweepWidth',
			type: 'number',
			default: '2',
			description: 'Sweep width.'
		},

		{
			name: 'sweepLobes',
			type: 'number',
			default: '1',
			description: 'Sweep lobes.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#9f29ff"',
			description: 'Foreground color.'
		},

		{
			name: 'backgroundColor',
			type: 'string',
			default: '"#000000"',
			description: 'Background color.'
		},

		{
			name: 'falloff',
			type: 'number',
			default: '2',
			description: 'Edge falloff.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '1',
			description: 'Brightness.'
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
			default: '0.1',
			description: 'Mouse influence.'
		}
	];

	var fragment = root_2();

	$.head('1qs7qi8', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Radar - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Radar(node_1, {
				get speed() {
					return $.get(speed);
				},

				get scale() {
					return $.get(scale);
				},

				get ringCount() {
					return $.get(ringCount);
				},

				get spokeCount() {
					return $.get(spokeCount);
				},

				get ringThickness() {
					return $.get(ringThickness);
				},

				get spokeThickness() {
					return $.get(spokeThickness);
				},

				get sweepSpeed() {
					return $.get(sweepSpeed);
				},

				get sweepWidth() {
					return $.get(sweepWidth);
				},

				get sweepLobes() {
					return $.get(sweepLobes);
				},

				get color() {
					return $.get(color);
				},

				get brightness() {
					return $.get(brightness);
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
				slug: 'radar',
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
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Scale',
						min: 0.1,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => $.set(scale, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Ring Count',
						min: 1,
						max: 30,
						step: 1,
						get value() {
							return $.get(ringCount);
						},
						onChange: (v) => $.set(ringCount, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Spoke Count',
						min: 1,
						max: 30,
						step: 1,
						get value() {
							return $.get(spokeCount);
						},
						onChange: (v) => $.set(spokeCount, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Ring Thickness',
						min: 0.005,
						max: 0.2,
						step: 0.005,
						get value() {
							return $.get(ringThickness);
						},
						onChange: (v) => $.set(ringThickness, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Spoke Thickness',
						min: 0.001,
						max: 0.05,
						step: 0.001,
						get value() {
							return $.get(spokeThickness);
						},
						onChange: (v) => $.set(spokeThickness, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Sweep Speed',
						min: 0,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(sweepSpeed);
						},
						onChange: (v) => $.set(sweepSpeed, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Sweep Width',
						min: 0.5,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(sweepWidth);
						},
						onChange: (v) => $.set(sweepWidth, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Sweep Lobes',
						min: 1,
						max: 6,
						step: 1,
						get value() {
							return $.get(sweepLobes);
						},
						onChange: (v) => $.set(sweepLobes, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Brightness',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(brightness);
						},
						onChange: (v) => $.set(brightness, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSwitch(node_14, {
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
			componentName: 'Radar',
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