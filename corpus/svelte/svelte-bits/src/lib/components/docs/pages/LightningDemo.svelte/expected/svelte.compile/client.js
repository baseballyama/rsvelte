import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Lightning from '$lib/components/library/Backgrounds/Lightning/Lightning.svelte';
import source from '$lib/components/library/Backgrounds/Lightning/Lightning.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Lightning</h1> <!>`, 1);

export default function LightningDemo($$anchor) {
	const DEFAULTS = { hue: 230, xOffset: 0, speed: 1, intensity: 1, size: 1 };
	let hue = $.state($.proxy(DEFAULTS.hue));
	let xOffset = $.state($.proxy(DEFAULTS.xOffset));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let intensity = $.state($.proxy(DEFAULTS.intensity));
	let size = $.state($.proxy(DEFAULTS.size));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(hue) !== DEFAULTS.hue || $.get(xOffset) !== DEFAULTS.xOffset || $.get(speed) !== DEFAULTS.speed || $.get(intensity) !== DEFAULTS.intensity || $.get(size) !== DEFAULTS.size);

	function reset() {
		$.set(hue, DEFAULTS.hue, true);
		$.set(xOffset, DEFAULTS.xOffset, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(intensity, DEFAULTS.intensity, true);
		$.set(size, DEFAULTS.size, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import Lightning from '$lib/components/Lightning.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <Lightning hue={${$.get(hue)}} xOffset={${$.get(xOffset)}} speed={${$.get(speed)}} intensity={${$.get(intensity)}} size={${$.get(size)}} />
</div>`);

	const props = [
		{
			name: 'hue',
			type: 'number',
			default: '230',
			description: 'Color hue (0–360).'
		},

		{
			name: 'xOffset',
			type: 'number',
			default: '0',
			description: 'Horizontal offset.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed.'
		},

		{
			name: 'intensity',
			type: 'number',
			default: '1',
			description: 'Bolt intensity multiplier.'
		},

		{
			name: 'size',
			type: 'number',
			default: '1',
			description: 'Size of the bolt pattern.'
		}
	];

	var fragment = root_2();

	$.head('1nlqon2', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Lightning - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Lightning(node_1, {
				get hue() {
					return $.get(hue);
				},

				get xOffset() {
					return $.get(xOffset);
				},

				get speed() {
					return $.get(speed);
				},

				get intensity() {
					return $.get(intensity);
				},

				get size() {
					return $.get(size);
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
				slug: 'lightning',
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

					PreviewSlider(node_3, {
						title: 'Hue',
						min: 0,
						max: 360,
						step: 1,
						get value() {
							return $.get(hue);
						},
						onChange: (v) => $.set(hue, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'X Offset',
						min: -1,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(xOffset);
						},
						onChange: (v) => $.set(xOffset, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Intensity',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(intensity);
						},
						onChange: (v) => $.set(intensity, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Size',
						min: 0.1,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(size);
						},
						onChange: (v) => $.set(size, v, true)
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
			componentName: 'Lightning',
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