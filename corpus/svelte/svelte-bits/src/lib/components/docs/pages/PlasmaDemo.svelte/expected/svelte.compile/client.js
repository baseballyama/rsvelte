import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Plasma from '$lib/components/library/Backgrounds/Plasma/Plasma.svelte';
import source from '$lib/components/library/Backgrounds/Plasma/Plasma.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Plasma</h1> <!>`, 1);

export default function PlasmaDemo($$anchor) {
	const DEFAULTS = {
		color: '#ff3e00',
		speed: 1,
		direction: 'forward',
		scale: 1,
		opacity: 1,
		mouseInteractive: true
	};

	let color = $.state($.proxy(DEFAULTS.color));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let direction = $.state($.proxy(DEFAULTS.direction));
	let scale = $.state($.proxy(DEFAULTS.scale));
	let opacity = $.state($.proxy(DEFAULTS.opacity));
	let mouseInteractive = $.state($.proxy(DEFAULTS.mouseInteractive));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(color) !== DEFAULTS.color || $.get(speed) !== DEFAULTS.speed || $.get(direction) !== DEFAULTS.direction || $.get(scale) !== DEFAULTS.scale || $.get(opacity) !== DEFAULTS.opacity || $.get(mouseInteractive) !== DEFAULTS.mouseInteractive);

	function reset() {
		$.set(color, DEFAULTS.color, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(direction, DEFAULTS.direction, true);
		$.set(scale, DEFAULTS.scale, true);
		$.set(opacity, DEFAULTS.opacity, true);
		$.set(mouseInteractive, DEFAULTS.mouseInteractive, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import Plasma from '$lib/components/Plasma.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <Plasma
    color="${$.get(color)}"
    speed={${$.get(speed)}}
    direction="${$.get(direction)}"
    scale={${$.get(scale)}}
    opacity={${$.get(opacity)}}
    mouseInteractive={${$.get(mouseInteractive)}}
  />
</div>`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"#ffffff"',
			description: 'Tint color for the plasma.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed.'
		},

		{
			name: 'direction',
			type: '"forward" | "reverse" | "pingpong"',
			default: '"forward"',
			description: 'Time direction.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Pattern scale.'
		},

		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Final opacity.'
		},

		{
			name: 'mouseInteractive',
			type: 'boolean',
			default: 'true',
			description: 'Mouse parallax.'
		}
	];

	var fragment = root_2();

	$.head('857jps', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Plasma - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Plasma(node_1, {
				get color() {
					return $.get(color);
				},

				get speed() {
					return $.get(speed);
				},

				get direction() {
					return $.get(direction);
				},

				get scale() {
					return $.get(scale);
				},

				get opacity() {
					return $.get(opacity);
				},

				get mouseInteractive() {
					return $.get(mouseInteractive);
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
				slug: 'plasma',
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

					PreviewSelect(node_4, {
						title: 'Direction',
						options: [
							{ value: 'forward', label: 'Forward' },
							{ value: 'reverse', label: 'Reverse' },
							{ value: 'pingpong', label: 'Pingpong' }
						],

						get value() {
							return $.get(direction);
						},
						onChange: (v) => $.set(direction, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Scale',
						min: 0.5,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => $.set(scale, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(opacity);
						},
						onChange: (v) => $.set(opacity, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Mouse Interactive',
						get checked() {
							return $.get(mouseInteractive);
						},
						onChange: (v) => $.set(mouseInteractive, v, true)
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
			componentName: 'Plasma',
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