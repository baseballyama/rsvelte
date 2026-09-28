import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import LogoLoop from '$lib/components/library/Animations/LogoLoop/LogoLoop.svelte';
import source from '$lib/components/library/Animations/LogoLoop/LogoLoop.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;"><div style="width:100%;"><!></div></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Logo Loop</h1> <!>`, 1);

export default function LogoLoopDemo($$anchor) {
	const logos = [
		{
			src: 'https://cdn.simpleicons.org/svelte/FF3E00',
			alt: 'Svelte'
		},

		{
			src: 'https://cdn.simpleicons.org/typescript/3178C6',
			alt: 'TypeScript'
		},
		{ src: 'https://cdn.simpleicons.org/vite/646CFF', alt: 'Vite' },
		{
			src: 'https://cdn.simpleicons.org/tailwindcss/06B6D4',
			alt: 'Tailwind'
		},

		{
			src: 'https://cdn.simpleicons.org/react/61DAFB',
			alt: 'React'
		},

		{
			src: 'https://cdn.simpleicons.org/nodedotjs/339933',
			alt: 'Node.js'
		}
	];

	const DEFAULTS = {
		speed: 100,
		logoHeight: 60,
		gap: 60,
		hoverSpeed: 0,
		fadeOut: true,
		scaleOnHover: true,
		direction: 'left'
	};

	let speed = $.state($.proxy(DEFAULTS.speed));
	let logoHeight = $.state($.proxy(DEFAULTS.logoHeight));
	let gap = $.state($.proxy(DEFAULTS.gap));
	let hoverSpeed = $.state($.proxy(DEFAULTS.hoverSpeed));
	let fadeOut = $.state($.proxy(DEFAULTS.fadeOut));
	let scaleOnHover = $.state($.proxy(DEFAULTS.scaleOnHover));
	let direction = $.state($.proxy(DEFAULTS.direction));
	const hasChanges = $.derived(() => $.get(speed) !== DEFAULTS.speed || $.get(logoHeight) !== DEFAULTS.logoHeight || $.get(gap) !== DEFAULTS.gap || $.get(hoverSpeed) !== DEFAULTS.hoverSpeed || $.get(fadeOut) !== DEFAULTS.fadeOut || $.get(scaleOnHover) !== DEFAULTS.scaleOnHover || $.get(direction) !== DEFAULTS.direction);

	function reset() {
		$.set(speed, DEFAULTS.speed, true);
		$.set(logoHeight, DEFAULTS.logoHeight, true);
		$.set(gap, DEFAULTS.gap, true);
		$.set(hoverSpeed, DEFAULTS.hoverSpeed, true);
		$.set(fadeOut, DEFAULTS.fadeOut, true);
		$.set(scaleOnHover, DEFAULTS.scaleOnHover, true);
		$.set(direction, DEFAULTS.direction, true);
	}

	const usage = $.derived(() => `<LogoLoop logos={logos} speed={${$.get(speed)}} logoHeight={${$.get(logoHeight)}} gap={${$.get(gap)}} direction="${$.get(direction)}" fadeOut={${$.get(fadeOut)}} scaleOnHover={${$.get(scaleOnHover)}} />`);

	const props = [
		{
			name: 'logos',
			type: 'LogoItem[]',
			default: 'required',
			description: 'Array of logo items. Each item: { src, alt } or { node }.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '120',
			description: 'Animation speed in pixels per second.'
		},

		{
			name: 'direction',
			type: '"left" | "right" | "up" | "down"',
			default: '"left"',
			description: 'Scroll direction.'
		},

		{
			name: 'width',
			type: 'string | number',
			default: '"100%"',
			description: 'Container width.'
		},

		{
			name: 'logoHeight',
			type: 'number',
			default: '28',
			description: 'Logo height (px).'
		},

		{
			name: 'gap',
			type: 'number',
			default: '32',
			description: 'Gap between logos (px).'
		},

		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pause animation on hover.'
		},

		{
			name: 'hoverSpeed',
			type: 'number',
			default: 'undefined',
			description: 'Optional speed override on hover.'
		},

		{
			name: 'fadeOut',
			type: 'boolean',
			default: 'false',
			description: 'Apply edge fade gradient.'
		},

		{
			name: 'fadeOutColor',
			type: 'string',
			default: 'inherits',
			description: 'Edge fade color.'
		},

		{
			name: 'scaleOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Scale up the hovered logo.'
		},

		{
			name: 'ariaLabel',
			type: 'string',
			default: '"Logo loop"',
			description: 'Accessible label.'
		}
	];

	var fragment = root_2();

	$.head('u3750n', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Logo Loop - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			LogoLoop(node_1, {
				get logos() {
					return logos;
				},

				get speed() {
					return $.get(speed);
				},

				get logoHeight() {
					return $.get(logoHeight);
				},

				get gap() {
					return $.get(gap);
				},

				get hoverSpeed() {
					return $.get(hoverSpeed);
				},

				get fadeOut() {
					return $.get(fadeOut);
				},
				fadeOutColor: '#14110E',
				get scaleOnHover() {
					return $.get(scaleOnHover);
				},

				get direction() {
					return $.get(direction);
				}
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'logo-loop',
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
					var node_2 = $.first_child(fragment_3);

					PreviewSelect(node_2, {
						title: 'Direction',
						get value() {
							return $.get(direction);
						},

						options: [
							{ label: 'Left', value: 'left' },
							{ label: 'Right', value: 'right' },
							{ label: 'Up', value: 'up' },
							{ label: 'Down', value: 'down' }
						],
						onChange: (v) => $.set(direction, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Speed',
						min: 10,
						max: 400,
						step: 10,
						get value() {
							return $.get(speed);
						},
						valueUnit: 'px/s',
						onChange: (v) => $.set(speed, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Logo Height',
						min: 20,
						max: 140,
						step: 2,
						get value() {
							return $.get(logoHeight);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(logoHeight, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Gap',
						min: 0,
						max: 160,
						step: 4,
						get value() {
							return $.get(gap);
						},
						valueUnit: 'px',
						onChange: (v) => $.set(gap, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Hover Speed',
						min: 0,
						max: 400,
						step: 10,
						get value() {
							return $.get(hoverSpeed);
						},
						valueUnit: 'px/s',
						onChange: (v) => $.set(hoverSpeed, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Fade Out Edges',
						get checked() {
							return $.get(fadeOut);
						},
						onChange: (v) => $.set(fadeOut, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Scale On Hover',
						get checked() {
							return $.get(scaleOnHover);
						},
						onChange: (v) => $.set(scaleOnHover, v, true)
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
			componentName: 'LogoLoop',
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