import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Waves from '$lib/components/library/Backgrounds/Waves/Waves.svelte';
import source from '$lib/components/library/Backgrounds/Waves/Waves.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Waves</h1> <!>`, 1);

export default function WavesDemo($$anchor) {
	const D = {
		lineColor: '#ff8a3d',
		backgroundColor: 'transparent',
		waveSpeedX: 0.0125,
		waveSpeedY: 0.005,
		waveAmpX: 32,
		waveAmpY: 16,
		xGap: 10,
		yGap: 32,
		friction: 0.925,
		tension: 0.005,
		maxCursorMove: 100
	};

	let lineColor = $.state($.proxy(D.lineColor));
	let backgroundColor = $.state($.proxy(D.backgroundColor));
	let waveSpeedX = $.state($.proxy(D.waveSpeedX));
	let waveSpeedY = $.state($.proxy(D.waveSpeedY));
	let waveAmpX = $.state($.proxy(D.waveAmpX));
	let waveAmpY = $.state($.proxy(D.waveAmpY));
	let xGap = $.state($.proxy(D.xGap));
	let yGap = $.state($.proxy(D.yGap));
	let friction = $.state($.proxy(D.friction));
	let tension = $.state($.proxy(D.tension));
	let maxCursorMove = $.state($.proxy(D.maxCursorMove));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(lineColor) !== D.lineColor || $.get(backgroundColor) !== D.backgroundColor || $.get(waveSpeedX) !== D.waveSpeedX || $.get(waveSpeedY) !== D.waveSpeedY || $.get(waveAmpX) !== D.waveAmpX || $.get(waveAmpY) !== D.waveAmpY || $.get(xGap) !== D.xGap || $.get(yGap) !== D.yGap || $.get(friction) !== D.friction || $.get(tension) !== D.tension || $.get(maxCursorMove) !== D.maxCursorMove);

	function reset() {
		$.set(lineColor, D.lineColor, true);
		$.set(backgroundColor, D.backgroundColor, true);
		$.set(waveSpeedX, D.waveSpeedX, true);
		$.set(waveSpeedY, D.waveSpeedY, true);
		$.set(waveAmpX, D.waveAmpX, true);
		$.set(waveAmpY, D.waveAmpY, true);
		$.set(xGap, D.xGap, true);
		$.set(yGap, D.yGap, true);
		$.set(friction, D.friction, true);
		$.set(tension, D.tension, true);
		$.set(maxCursorMove, D.maxCursorMove, true);
	}

	const usage = $.derived(() => `${sO}
  import Waves from '$lib/components/Waves.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px;">
  <Waves lineColor="${$.get(lineColor)}" />
</div>`);

	const props = [
		{
			name: 'lineColor',
			type: 'string',
			default: "'black'",
			description: 'Stroke color of the wavy lines.'
		},

		{
			name: 'backgroundColor',
			type: 'string',
			default: "'transparent'",
			description: 'Background color.'
		},

		{
			name: 'waveSpeedX',
			type: 'number',
			default: '0.0125',
			description: 'Horizontal wave speed.'
		},

		{
			name: 'waveSpeedY',
			type: 'number',
			default: '0.005',
			description: 'Vertical wave speed.'
		},

		{
			name: 'waveAmpX',
			type: 'number',
			default: '32',
			description: 'Horizontal wave amplitude.'
		},

		{
			name: 'waveAmpY',
			type: 'number',
			default: '16',
			description: 'Vertical wave amplitude.'
		},

		{
			name: 'xGap',
			type: 'number',
			default: '10',
			description: 'Horizontal point spacing.'
		},

		{
			name: 'yGap',
			type: 'number',
			default: '32',
			description: 'Vertical point spacing.'
		},

		{
			name: 'friction',
			type: 'number',
			default: '0.925',
			description: 'Cursor velocity friction.'
		},

		{
			name: 'tension',
			type: 'number',
			default: '0.005',
			description: 'Spring tension to rest.'
		},

		{
			name: 'maxCursorMove',
			type: 'number',
			default: '100',
			description: 'Max cursor offset per point.'
		}
	];

	var fragment = root_2();

	$.head('wwvlla', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Waves - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Waves(node_1, {
				get lineColor() {
					return $.get(lineColor);
				},

				get backgroundColor() {
					return $.get(backgroundColor);
				},

				get waveSpeedX() {
					return $.get(waveSpeedX);
				},

				get waveSpeedY() {
					return $.get(waveSpeedY);
				},

				get waveAmpX() {
					return $.get(waveAmpX);
				},

				get waveAmpY() {
					return $.get(waveAmpY);
				},

				get xGap() {
					return $.get(xGap);
				},

				get yGap() {
					return $.get(yGap);
				},

				get friction() {
					return $.get(friction);
				},

				get tension() {
					return $.get(tension);
				},

				get maxCursorMove() {
					return $.get(maxCursorMove);
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
				slug: 'waves',
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
						title: 'Line Color',
						get value() {
							return $.get(lineColor);
						},
						onChange: (v) => $.set(lineColor, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Wave Speed X',
						min: 0,
						max: 0.05,
						step: 0.001,
						get value() {
							return $.get(waveSpeedX);
						},
						onChange: (v) => $.set(waveSpeedX, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Wave Speed Y',
						min: 0,
						max: 0.05,
						step: 0.001,
						get value() {
							return $.get(waveSpeedY);
						},
						onChange: (v) => $.set(waveSpeedY, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Wave Amp X',
						min: 0,
						max: 100,
						step: 1,
						get value() {
							return $.get(waveAmpX);
						},
						onChange: (v) => $.set(waveAmpX, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Wave Amp Y',
						min: 0,
						max: 100,
						step: 1,
						get value() {
							return $.get(waveAmpY);
						},
						onChange: (v) => $.set(waveAmpY, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'X Gap',
						min: 4,
						max: 50,
						step: 1,
						get value() {
							return $.get(xGap);
						},
						onChange: (v) => $.set(xGap, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Y Gap',
						min: 8,
						max: 80,
						step: 1,
						get value() {
							return $.get(yGap);
						},
						onChange: (v) => $.set(yGap, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Friction',
						min: 0.8,
						max: 1,
						step: 0.005,
						get value() {
							return $.get(friction);
						},
						onChange: (v) => $.set(friction, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Tension',
						min: 0,
						max: 0.05,
						step: 0.001,
						get value() {
							return $.get(tension);
						},
						onChange: (v) => $.set(tension, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Max Cursor Move',
						min: 10,
						max: 300,
						step: 5,
						get value() {
							return $.get(maxCursorMove);
						},
						onChange: (v) => $.set(maxCursorMove, v, true)
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
			componentName: 'Waves',
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