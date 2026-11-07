import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import LiquidChrome from '$lib/components/library/Backgrounds/LiquidChrome/LiquidChrome.svelte';
import source from '$lib/components/library/Backgrounds/LiquidChrome/LiquidChrome.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Liquid Chrome</h1> <!>`, 1);

export default function LiquidChromeDemo($$anchor) {
	const DEFAULTS = {
		speed: 0.2,
		amplitude: 0.5,
		frequencyX: 3,
		frequencyY: 2,
		interactive: true
	};

	let speed = $.state($.proxy(DEFAULTS.speed));
	let amplitude = $.state($.proxy(DEFAULTS.amplitude));
	let frequencyX = $.state($.proxy(DEFAULTS.frequencyX));
	let frequencyY = $.state($.proxy(DEFAULTS.frequencyY));
	let interactive = $.state($.proxy(DEFAULTS.interactive));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(speed) !== DEFAULTS.speed || $.get(amplitude) !== DEFAULTS.amplitude || $.get(frequencyX) !== DEFAULTS.frequencyX || $.get(frequencyY) !== DEFAULTS.frequencyY || $.get(interactive) !== DEFAULTS.interactive);

	function reset() {
		$.set(speed, DEFAULTS.speed, true);
		$.set(amplitude, DEFAULTS.amplitude, true);
		$.set(frequencyX, DEFAULTS.frequencyX, true);
		$.set(frequencyY, DEFAULTS.frequencyY, true);
		$.set(interactive, DEFAULTS.interactive, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import LiquidChrome from '$lib/components/LiquidChrome.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <LiquidChrome
    baseColor={[0.1, 0.1, 0.1]}
    speed={${$.get(speed)}}
    amplitude={${$.get(amplitude)}}
    interactive={${$.get(interactive)}}
  />
</div>`);

	const props = [
		{
			name: 'baseColor',
			type: '[number, number, number]',
			default: '[0.1, 0.1, 0.1]',
			description: 'Base RGB color (0–1).'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.2',
			description: 'Animation speed.'
		},

		{
			name: 'amplitude',
			type: 'number',
			default: '0.5',
			description: 'Wave amplitude.'
		},

		{
			name: 'frequencyX',
			type: 'number',
			default: '3',
			description: 'X-axis frequency.'
		},

		{
			name: 'frequencyY',
			type: 'number',
			default: '2',
			description: 'Y-axis frequency.'
		},

		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Pointer interaction.'
		}
	];

	var fragment = root_2();

	$.head('1i0kxx8', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Liquid Chrome - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			LiquidChrome(node_1, {
				get speed() {
					return $.get(speed);
				},

				get amplitude() {
					return $.get(amplitude);
				},

				get frequencyX() {
					return $.get(frequencyX);
				},

				get frequencyY() {
					return $.get(frequencyY);
				},

				get interactive() {
					return $.get(interactive);
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
				slug: 'liquid-chrome',
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
						title: 'Speed',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Amplitude',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(amplitude);
						},
						onChange: (v) => $.set(amplitude, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Frequency X',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(frequencyX);
						},
						onChange: (v) => $.set(frequencyX, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Frequency Y',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(frequencyY);
						},
						onChange: (v) => $.set(frequencyY, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Interactive',
						get checked() {
							return $.get(interactive);
						},
						onChange: (v) => $.set(interactive, v, true)
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
			componentName: 'LiquidChrome',
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