import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import MetaBalls from '$lib/components/library/Animations/MetaBalls/MetaBalls.svelte';
import source from '$lib/components/library/Animations/MetaBalls/MetaBalls.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Meta Balls</h1> <!>`, 1);

export default function MetaBallsDemo($$anchor) {
	const DEFAULTS = {
		color: '#FF8A4C',
		cursorBallColor: '#FF8A4C',
		speed: 0.3,
		animationSize: 30,
		ballCount: 15,
		clumpFactor: 1,
		enableMouseInteraction: true,
		hoverSmoothness: 0.15,
		cursorBallSize: 2
	};

	let color = $.state($.proxy(DEFAULTS.color));
	let cursorBallColor = $.state($.proxy(DEFAULTS.cursorBallColor));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let animationSize = $.state($.proxy(DEFAULTS.animationSize));
	let ballCount = $.state($.proxy(DEFAULTS.ballCount));
	let clumpFactor = $.state($.proxy(DEFAULTS.clumpFactor));
	let enableMouseInteraction = $.state($.proxy(DEFAULTS.enableMouseInteraction));
	let hoverSmoothness = $.state($.proxy(DEFAULTS.hoverSmoothness));
	let cursorBallSize = $.state($.proxy(DEFAULTS.cursorBallSize));
	const hasChanges = $.derived(() => $.get(color) !== DEFAULTS.color || $.get(cursorBallColor) !== DEFAULTS.cursorBallColor || $.get(speed) !== DEFAULTS.speed || $.get(animationSize) !== DEFAULTS.animationSize || $.get(ballCount) !== DEFAULTS.ballCount || $.get(clumpFactor) !== DEFAULTS.clumpFactor || $.get(enableMouseInteraction) !== DEFAULTS.enableMouseInteraction || $.get(hoverSmoothness) !== DEFAULTS.hoverSmoothness || $.get(cursorBallSize) !== DEFAULTS.cursorBallSize);

	function reset() {
		$.set(color, DEFAULTS.color, true);
		$.set(cursorBallColor, DEFAULTS.cursorBallColor, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(animationSize, DEFAULTS.animationSize, true);
		$.set(ballCount, DEFAULTS.ballCount, true);
		$.set(clumpFactor, DEFAULTS.clumpFactor, true);
		$.set(enableMouseInteraction, DEFAULTS.enableMouseInteraction, true);
		$.set(hoverSmoothness, DEFAULTS.hoverSmoothness, true);
		$.set(cursorBallSize, DEFAULTS.cursorBallSize, true);
	}

	const usage = $.derived(() => `<MetaBalls color="${$.get(color)}" cursorBallColor="${$.get(cursorBallColor)}" speed={${$.get(speed)}} ballCount={${$.get(ballCount)}} animationSize={${$.get(animationSize)}} clumpFactor={${$.get(clumpFactor)}} enableMouseInteraction={${$.get(enableMouseInteraction)}} hoverSmoothness={${$.get(hoverSmoothness)}} cursorBallSize={${$.get(cursorBallSize)}} />`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"#ffffff"',
			description: 'Metaball color.'
		},

		{
			name: 'cursorBallColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Cursor ball color.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.3',
			description: 'Animation speed.'
		},

		{
			name: 'animationSize',
			type: 'number',
			default: '30',
			description: 'Animation field size.'
		},

		{
			name: 'ballCount',
			type: 'number',
			default: '15',
			description: 'Number of balls (1-50).'
		},

		{
			name: 'clumpFactor',
			type: 'number',
			default: '1',
			description: 'How tightly balls cluster.'
		},

		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Cursor ball follows mouse.'
		},

		{
			name: 'enableTransparency',
			type: 'boolean',
			default: 'false',
			description: 'Transparent canvas background.'
		},

		{
			name: 'hoverSmoothness',
			type: 'number',
			default: '0.05',
			description: 'Cursor follow smoothness.'
		},

		{
			name: 'cursorBallSize',
			type: 'number',
			default: '3',
			description: 'Cursor ball radius.'
		}
	];

	var fragment = root_2();

	$.head('1iwngh7', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Meta Balls - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			MetaBalls(node_1, {
				get color() {
					return $.get(color);
				},

				get cursorBallColor() {
					return $.get(cursorBallColor);
				},

				get speed() {
					return $.get(speed);
				},

				get animationSize() {
					return $.get(animationSize);
				},

				get ballCount() {
					return $.get(ballCount);
				},

				get clumpFactor() {
					return $.get(clumpFactor);
				},

				get enableMouseInteraction() {
					return $.get(enableMouseInteraction);
				},
				enableTransparency: true,
				get hoverSmoothness() {
					return $.get(hoverSmoothness);
				},

				get cursorBallSize() {
					return $.get(cursorBallSize);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'meta-balls',
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

					PreviewColorPicker(node_2, {
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewColorPicker(node_3, {
						title: 'Cursor Ball Color',
						get value() {
							return $.get(cursorBallColor);
						},
						onChange: (v) => $.set(cursorBallColor, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Ball Count',
						min: 1,
						max: 50,
						step: 1,
						get value() {
							return $.get(ballCount);
						},
						onChange: (v) => $.set(ballCount, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Animation Size',
						min: 5,
						max: 80,
						step: 1,
						get value() {
							return $.get(animationSize);
						},
						onChange: (v) => $.set(animationSize, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Clump Factor',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(clumpFactor);
						},
						onChange: (v) => $.set(clumpFactor, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Hover Smoothness',
						min: 0.01,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(hoverSmoothness);
						},
						onChange: (v) => $.set(hoverSmoothness, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Cursor Ball Size',
						min: 0.5,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(cursorBallSize);
						},
						onChange: (v) => $.set(cursorBallSize, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
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
			componentName: 'MetaBalls',
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