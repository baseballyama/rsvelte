import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import GlareHover from '$lib/components/library/Animations/GlareHover/GlareHover.svelte';
import source from '$lib/components/library/Animations/GlareHover/GlareHover.svelte?raw';

var root = $.from_html(`<h2 style="font-size:3rem;font-weight:900;color:#fff;margin:0;">Hover me!</h2>`);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Glare Hover</h1> <!>`, 1);

export default function GlareHoverDemo($$anchor) {
	const DEFAULTS = {
		glareColor: '#FF8A4C',
		glareOpacity: 0.5,
		glareSize: 300,
		transitionDuration: 800,
		playOnce: false
	};

	let glareColor = $.state($.proxy(DEFAULTS.glareColor));
	let glareOpacity = $.state($.proxy(DEFAULTS.glareOpacity));
	let glareSize = $.state($.proxy(DEFAULTS.glareSize));
	let transitionDuration = $.state($.proxy(DEFAULTS.transitionDuration));
	let playOnce = $.state($.proxy(DEFAULTS.playOnce));
	const hasChanges = $.derived(() => $.get(glareColor) !== DEFAULTS.glareColor || $.get(glareOpacity) !== DEFAULTS.glareOpacity || $.get(glareSize) !== DEFAULTS.glareSize || $.get(transitionDuration) !== DEFAULTS.transitionDuration || $.get(playOnce) !== DEFAULTS.playOnce);

	function reset() {
		$.set(glareColor, DEFAULTS.glareColor, true);
		$.set(glareOpacity, DEFAULTS.glareOpacity, true);
		$.set(glareSize, DEFAULTS.glareSize, true);
		$.set(transitionDuration, DEFAULTS.transitionDuration, true);
		$.set(playOnce, DEFAULTS.playOnce, true);
	}

	const usage = $.derived(() => `<GlareHover glareColor="${$.get(glareColor)}" glareOpacity={${$.get(glareOpacity)}} glareSize={${$.get(glareSize)}} transitionDuration={${$.get(transitionDuration)}} playOnce={${$.get(playOnce)}}>
  <h2>Hover me!</h2>
</GlareHover>`);

	const props = [
		{
			name: 'width',
			type: 'string',
			default: '"500px"',
			description: 'Width of the hover element.'
		},

		{
			name: 'height',
			type: 'string',
			default: '"500px"',
			description: 'Height of the hover element.'
		},

		{
			name: 'background',
			type: 'string',
			default: '"#000"',
			description: 'Background color of the element.'
		},

		{
			name: 'borderRadius',
			type: 'string',
			default: '"10px"',
			description: 'Border radius.'
		},

		{
			name: 'borderColor',
			type: 'string',
			default: '"#333"',
			description: 'Border color.'
		},

		{
			name: 'glareColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Color of the glare.'
		},

		{
			name: 'glareOpacity',
			type: 'number',
			default: '0.5',
			description: 'Opacity of the glare (0-1).'
		},

		{
			name: 'glareAngle',
			type: 'number',
			default: '-45',
			description: 'Angle of the glare (degrees).'
		},

		{
			name: 'glareSize',
			type: 'number',
			default: '250',
			description: 'Size of the glare effect (%).'
		},

		{
			name: 'transitionDuration',
			type: 'number',
			default: '650',
			description: 'Duration of the transition (ms).'
		},

		{
			name: 'playOnce',
			type: 'boolean',
			default: 'false',
			description: 'Whether the animation plays only once.'
		}
	];

	var fragment = root_3();

	$.head('1ixde8h', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Glare Hover - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			GlareHover(node_1, {
				width: '500px',
				height: '300px',
				background: '#1a1a1a',
				borderRadius: '10px',
				borderColor: '#333',
				get glareColor() {
					return $.get(glareColor);
				},

				get glareOpacity() {
					return $.get(glareOpacity);
				},

				get glareSize() {
					return $.get(glareSize);
				},

				get transitionDuration() {
					return $.get(transitionDuration);
				},

				get playOnce() {
					return $.get(playOnce);
				},

				children: ($$anchor, $$slotProps) => {
					var h2 = root();

					$.append($$anchor, h2);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'glare-hover',
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
					var fragment_3 = root_2();
					var node_2 = $.first_child(fragment_3);

					PreviewColorPicker(node_2, {
						title: 'Glare Color',
						get value() {
							return $.get(glareColor);
						},
						onChange: (v) => $.set(glareColor, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Glare Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(glareOpacity);
						},
						onChange: (v) => $.set(glareOpacity, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Glare Size',
						min: 50,
						max: 500,
						step: 10,
						get value() {
							return $.get(glareSize);
						},
						onChange: (v) => $.set(glareSize, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Transition Duration',
						min: 100,
						max: 2000,
						step: 50,
						get value() {
							return $.get(transitionDuration);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(transitionDuration, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Play Once',
						get checked() {
							return $.get(playOnce);
						},
						onChange: (v) => $.set(playOnce, v, true)
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
			componentName: 'GlareHover',
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