import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Iridescence from '$lib/components/library/Backgrounds/Iridescence/Iridescence.svelte';
import source from '$lib/components/library/Backgrounds/Iridescence/Iridescence.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Iridescence</h1> <!>`, 1);

export default function IridescenceDemo($$anchor) {
	const DEFAULTS = {
		speed: 1.0,
		amplitude: 0.1,
		mouseReact: true,
		r: 1,
		g: 1,
		b: 1
	};

	let speed = $.state($.proxy(DEFAULTS.speed));
	let amplitude = $.state($.proxy(DEFAULTS.amplitude));
	let mouseReact = $.state($.proxy(DEFAULTS.mouseReact));
	let r = $.state($.proxy(DEFAULTS.r));
	let g = $.state($.proxy(DEFAULTS.g));
	let b = $.state($.proxy(DEFAULTS.b));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const color = $.derived(() => [$.get(r), $.get(g), $.get(b)]);
	const hasChanges = $.derived(() => $.get(speed) !== DEFAULTS.speed || $.get(amplitude) !== DEFAULTS.amplitude || $.get(mouseReact) !== DEFAULTS.mouseReact || $.get(r) !== DEFAULTS.r || $.get(g) !== DEFAULTS.g || $.get(b) !== DEFAULTS.b);

	function reset() {
		$.set(speed, DEFAULTS.speed, true);
		$.set(amplitude, DEFAULTS.amplitude, true);
		$.set(mouseReact, DEFAULTS.mouseReact, true);
		$.set(r, DEFAULTS.r, true);
		$.set(g, DEFAULTS.g, true);
		$.set(b, DEFAULTS.b, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import Iridescence from '$lib/components/Iridescence.svelte';
${scriptClose}

<div style="height: 600px; position: relative;">
  <Iridescence
    color={[${$.get(r)}, ${$.get(g)}, ${$.get(b)}]}
    mouseReact={${$.get(mouseReact)}}
    amplitude={${$.get(amplitude)}}
    speed={${$.get(speed)}}
  />
</div>`);

	const props = [
		{
			name: 'color',
			type: '[number, number, number]',
			default: '[1, 1, 1]',
			description: 'RGB color tint (0–1).'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1.0',
			description: 'Animation speed multiplier.'
		},

		{
			name: 'amplitude',
			type: 'number',
			default: '0.1',
			description: 'Mouse parallax amplitude.'
		},

		{
			name: 'mouseReact',
			type: 'boolean',
			default: 'true',
			description: 'Whether the effect reacts to the mouse.'
		}
	];

	var fragment = root_2();

	$.head('1e7ayp8', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Iridescence - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Iridescence(node_1, {
				get color() {
					return $.get(color);
				},

				get speed() {
					return $.get(speed);
				},

				get amplitude() {
					return $.get(amplitude);
				},

				get mouseReact() {
					return $.get(mouseReact);
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
				slug: 'iridescence',
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
						title: 'Red',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(r);
						},
						onChange: (v) => $.set(r, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Green',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(g);
						},
						onChange: (v) => $.set(g, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Blue',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(b);
						},
						onChange: (v) => $.set(b, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Amplitude',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(amplitude);
						},
						onChange: (v) => $.set(amplitude, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Mouse React',
						get checked() {
							return $.get(mouseReact);
						},
						onChange: (v) => $.set(mouseReact, v, true)
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
			componentName: 'Iridescence',
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