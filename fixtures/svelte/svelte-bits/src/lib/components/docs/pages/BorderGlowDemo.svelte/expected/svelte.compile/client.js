import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BorderGlow from '$lib/components/library/Components/BorderGlow/BorderGlow.svelte';
import source from '$lib/components/library/Components/BorderGlow/BorderGlow.svelte?raw';

var root = $.from_html(`<div style="display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:2em;min-height:200px;min-width:380px;"><svg width="40" height="40" viewBox="0 0 24 24" fill="white" style="margin-bottom:0.75em;"><path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"></path></svg> <div style="font-weight:600;font-size:1.4rem;letter-spacing:-0.5px;">Hover Near the Edges</div> <div style="color:#a1a1aa;font-size:14px;max-width:40ch;margin-top:0.25em;">Move your cursor close to the card border to see the colored glow effect follow your pointer direction.</div></div>`);
var root_1 = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<h1 class="sub-category">Border Glow</h1> <!>`, 1);

export default function BorderGlowDemo($$anchor) {
	const DEFAULTS = {
		edgeSensitivity: 30,
		glowColor: '40 80 80',
		backgroundColor: '#14110E',
		borderRadius: 28,
		glowRadius: 40,
		glowIntensity: 1.0,
		coneSpread: 25,
		animated: false,
		colors: ['#FF8A4C', '#FFC18A', '#FF6B2C']
	};

	let edgeSensitivity = $.state($.proxy(DEFAULTS.edgeSensitivity));
	let backgroundColor = $.state($.proxy(DEFAULTS.backgroundColor));
	let borderRadius = $.state($.proxy(DEFAULTS.borderRadius));
	let glowRadius = $.state($.proxy(DEFAULTS.glowRadius));
	let glowIntensity = $.state($.proxy(DEFAULTS.glowIntensity));
	let coneSpread = $.state($.proxy(DEFAULTS.coneSpread));
	let animated = $.state($.proxy(DEFAULTS.animated));
	let colors = $.state($.proxy([...DEFAULTS.colors]));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(edgeSensitivity) !== DEFAULTS.edgeSensitivity || $.get(backgroundColor) !== DEFAULTS.backgroundColor || $.get(borderRadius) !== DEFAULTS.borderRadius || $.get(glowRadius) !== DEFAULTS.glowRadius || $.get(glowIntensity) !== DEFAULTS.glowIntensity || $.get(coneSpread) !== DEFAULTS.coneSpread || $.get(animated) !== DEFAULTS.animated || $.get(colors).some((c, i) => c !== DEFAULTS.colors[i]));

	function reset() {
		$.set(edgeSensitivity, DEFAULTS.edgeSensitivity, true);
		$.set(backgroundColor, DEFAULTS.backgroundColor, true);
		$.set(borderRadius, DEFAULTS.borderRadius, true);
		$.set(glowRadius, DEFAULTS.glowRadius, true);
		$.set(glowIntensity, DEFAULTS.glowIntensity, true);
		$.set(coneSpread, DEFAULTS.coneSpread, true);
		$.set(animated, DEFAULTS.animated, true);
		$.set(colors, [...DEFAULTS.colors], true);
		$.update(key);
	}

	const usage = $.derived(() => `<BorderGlow edgeSensitivity={${$.get(edgeSensitivity)}} borderRadius={${$.get(borderRadius)}} glowRadius={${$.get(glowRadius)}} glowIntensity={${$.get(glowIntensity)}} coneSpread={${$.get(coneSpread)}} animated={${$.get(animated)}} />`);

	const props = [
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content rendered inside the card.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional CSS classes for the outer wrapper.'
		},

		{
			name: 'edgeSensitivity',
			type: 'number',
			default: '30',
			description: 'How close the pointer must be to the edge for the glow to appear (0-100).'
		},

		{
			name: 'glowColor',
			type: 'string',
			default: '"40 80 80"',
			description: 'HSL values for the glow color, as "H S L".'
		},

		{
			name: 'backgroundColor',
			type: 'string',
			default: '"#14110E"',
			description: 'Background color of the card.'
		},

		{
			name: 'borderRadius',
			type: 'number',
			default: '28',
			description: 'Corner radius of the card in pixels.'
		},

		{
			name: 'glowRadius',
			type: 'number',
			default: '40',
			description: 'How far the outer glow extends beyond the card in pixels.'
		},

		{
			name: 'glowIntensity',
			type: 'number',
			default: '1.0',
			description: 'Multiplier for glow opacity (0.1-3.0).'
		},

		{
			name: 'coneSpread',
			type: 'number',
			default: '25',
			description: 'Width of the directional cone mask as a percentage (5-45).'
		},

		{
			name: 'animated',
			type: 'boolean',
			default: 'false',
			description: 'Play an intro sweep animation on mount.'
		},

		{
			name: 'colors',
			type: 'string[]',
			default: '[...]',
			description: 'Array of 3 hex colors for the mesh gradient.'
		}
	];

	var fragment = root_3();

	$.head('1a4xytt', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Border Glow - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				BorderGlow($$anchor, {
					get edgeSensitivity() {
						return $.get(edgeSensitivity);
					},

					get backgroundColor() {
						return $.get(backgroundColor);
					},

					get borderRadius() {
						return $.get(borderRadius);
					},

					get glowRadius() {
						return $.get(glowRadius);
					},

					get glowIntensity() {
						return $.get(glowIntensity);
					},

					get coneSpread() {
						return $.get(coneSpread);
					},

					get animated() {
						return $.get(animated);
					},

					get colors() {
						return $.get(colors);
					},

					children: ($$anchor, $$slotProps) => {
						var div_1 = root();

						$.append($$anchor, div_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'border-glow',
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
					var fragment_4 = root_2();
					var node_2 = $.first_child(fragment_4);

					PreviewSlider(node_2, {
						title: 'Edge Sensitivity',
						min: 0,
						max: 80,
						step: 1,
						get value() {
							return $.get(edgeSensitivity);
						},
						onChange: (v) => $.set(edgeSensitivity, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Border Radius',
						min: 0,
						max: 50,
						step: 1,
						get value() {
							return $.get(borderRadius);
						},
						onChange: (v) => $.set(borderRadius, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Glow Radius',
						min: 10,
						max: 80,
						step: 1,
						get value() {
							return $.get(glowRadius);
						},
						onChange: (v) => $.set(glowRadius, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Glow Intensity',
						min: 0.1,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(glowIntensity);
						},
						onChange: (v) => $.set(glowIntensity, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Cone Spread',
						min: 5,
						max: 45,
						step: 1,
						get value() {
							return $.get(coneSpread);
						},
						onChange: (v) => $.set(coneSpread, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Animated Intro',
						get checked() {
							return $.get(animated);
						},

						onChange: (v) => {
							$.set(animated, v, true);
							$.update(key);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewColorPicker(node_8, {
						title: 'Background',
						get value() {
							return $.get(backgroundColor);
						},
						onChange: (v) => $.set(backgroundColor, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewColorPicker(node_9, {
						title: 'Color 1',
						get value() {
							return $.get(colors)[0];
						},
						onChange: (v) => $.set(colors, [v, $.get(colors)[1], $.get(colors)[2]], true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewColorPicker(node_10, {
						title: 'Color 2',
						get value() {
							return $.get(colors)[1];
						},
						onChange: (v) => $.set(colors, [$.get(colors)[0], v, $.get(colors)[2]], true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewColorPicker(node_11, {
						title: 'Color 3',
						get value() {
							return $.get(colors)[2];
						},
						onChange: (v) => $.set(colors, [$.get(colors)[0], $.get(colors)[1], v], true)
					});

					$.append($$anchor, fragment_4);
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
			componentName: 'BorderGlow',
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