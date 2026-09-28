import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Threads from '$lib/components/library/Backgrounds/Threads/Threads.svelte';
import source from '$lib/components/library/Backgrounds/Threads/Threads.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Threads</h1> <!>`, 1);

export default function ThreadsDemo($$anchor) {
	const DEFAULTS = { amplitude: 1, distance: 0, enableMouseInteraction: true };
	let amplitude = $.state($.proxy(DEFAULTS.amplitude));
	let distance = $.state($.proxy(DEFAULTS.distance));
	let enableMouseInteraction = $.state($.proxy(DEFAULTS.enableMouseInteraction));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(amplitude) !== DEFAULTS.amplitude || $.get(distance) !== DEFAULTS.distance || $.get(enableMouseInteraction) !== DEFAULTS.enableMouseInteraction);

	function reset() {
		$.set(amplitude, DEFAULTS.amplitude, true);
		$.set(distance, DEFAULTS.distance, true);
		$.set(enableMouseInteraction, DEFAULTS.enableMouseInteraction, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import Threads from '$lib/components/Threads.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <Threads
    amplitude={${$.get(amplitude)}}
    distance={${$.get(distance)}}
    enableMouseInteraction={${$.get(enableMouseInteraction)}}
  />
</div>`);

	const props = [
		{
			name: 'color',
			type: '[number, number, number]',
			default: '[1, 1, 1]',
			description: 'RGB color of the threads (0–1).'
		},

		{
			name: 'amplitude',
			type: 'number',
			default: '1',
			description: 'Wave amplitude.'
		},

		{
			name: 'distance',
			type: 'number',
			default: '0',
			description: 'Vertical separation between threads.'
		},

		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'false',
			description: 'Whether the threads react to the mouse.'
		}
	];

	var fragment = root_2();

	$.head('1h6zynb', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Threads - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Threads(node_1, {
				color: [1, 0.541, 0.298],
				get amplitude() {
					return $.get(amplitude);
				},

				get distance() {
					return $.get(distance);
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
				slug: 'threads',
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
						title: 'Amplitude',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(amplitude);
						},
						onChange: (v) => $.set(amplitude, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Distance',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(distance);
						},
						onChange: (v) => $.set(distance, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
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
			componentName: 'Threads',
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