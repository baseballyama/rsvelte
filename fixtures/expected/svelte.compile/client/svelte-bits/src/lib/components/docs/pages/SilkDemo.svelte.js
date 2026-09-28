import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Silk from '$lib/components/library/Backgrounds/Silk/Silk.svelte';
import source from '$lib/components/library/Backgrounds/Silk/Silk.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Silk</h1> <!>`, 1);

export default function SilkDemo($$anchor) {
	const DEFAULTS = {
		speed: 5,
		scale: 1,
		color: '#FF8A4C',
		noiseIntensity: 1.5,
		rotation: 0
	};

	let speed = $.state($.proxy(DEFAULTS.speed));
	let scale = $.state($.proxy(DEFAULTS.scale));
	let color = $.state($.proxy(DEFAULTS.color));
	let noiseIntensity = $.state($.proxy(DEFAULTS.noiseIntensity));
	let rotation = $.state($.proxy(DEFAULTS.rotation));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(speed) !== DEFAULTS.speed || $.get(scale) !== DEFAULTS.scale || $.get(color) !== DEFAULTS.color || $.get(noiseIntensity) !== DEFAULTS.noiseIntensity || $.get(rotation) !== DEFAULTS.rotation);

	function reset() {
		$.set(speed, DEFAULTS.speed, true);
		$.set(scale, DEFAULTS.scale, true);
		$.set(color, DEFAULTS.color, true);
		$.set(noiseIntensity, DEFAULTS.noiseIntensity, true);
		$.set(rotation, DEFAULTS.rotation, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import Silk from '$lib/components/Silk.svelte';
${scriptClose}

<Silk
  speed={${$.get(speed)}}
  scale={${$.get(scale)}}
  color="${$.get(color)}"
  noiseIntensity={${$.get(noiseIntensity)}}
  rotation={${$.get(rotation)}}
/>`);

	const props = [
		{
			name: 'speed',
			type: 'number',
			default: '5',
			description: 'Speed of the silk waves.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'UV scale of the pattern.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#7B7481"',
			description: 'Tint color.'
		},

		{
			name: 'noiseIntensity',
			type: 'number',
			default: '1.5',
			description: 'Strength of the grain noise.'
		},

		{
			name: 'rotation',
			type: 'number',
			default: '0',
			description: 'Rotation in radians.'
		}
	];

	var fragment = root_2();

	$.head('1favr1j', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Silk - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Silk(node_1, {
				get speed() {
					return $.get(speed);
				},

				get scale() {
					return $.get(scale);
				},

				get color() {
					return $.get(color);
				},

				get noiseIntensity() {
					return $.get(noiseIntensity);
				},

				get rotation() {
					return $.get(rotation);
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
				slug: 'silk',
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
						max: 20,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Scale',
						min: 0.1,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => $.set(scale, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Noise Intensity',
						min: 0,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(noiseIntensity);
						},
						onChange: (v) => $.set(noiseIntensity, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Rotation',
						min: 0,
						max: 6.28,
						step: 0.05,
						get value() {
							return $.get(rotation);
						},
						onChange: (v) => $.set(rotation, v, true)
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
			componentName: 'Silk',
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