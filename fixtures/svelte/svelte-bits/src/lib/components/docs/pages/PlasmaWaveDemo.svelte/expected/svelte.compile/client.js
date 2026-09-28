import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import PlasmaWave from '$lib/components/library/Backgrounds/PlasmaWave/PlasmaWave.svelte';
import source from '$lib/components/library/Backgrounds/PlasmaWave/PlasmaWave.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Plasma Wave</h1> <!>`, 1);

export default function PlasmaWaveDemo($$anchor) {
	const D = {
		xOffset: 0,
		yOffset: 0,
		rotationDeg: 0,
		focalLength: 0.8,
		speed1: 0.05,
		speed2: 0.05,
		dir2: 1,
		bend1: 1,
		bend2: 0.5,
		color1: '#ff8a3d',
		color2: '#FFB089'
	};

	let xOffset = $.state($.proxy(D.xOffset));
	let yOffset = $.state($.proxy(D.yOffset));
	let rotationDeg = $.state($.proxy(D.rotationDeg));
	let focalLength = $.state($.proxy(D.focalLength));
	let speed1 = $.state($.proxy(D.speed1));
	let speed2 = $.state($.proxy(D.speed2));
	let dir2 = $.state($.proxy(D.dir2));
	let bend1 = $.state($.proxy(D.bend1));
	let bend2 = $.state($.proxy(D.bend2));
	let color1 = $.state($.proxy(D.color1));
	let color2 = $.state($.proxy(D.color2));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(xOffset) !== D.xOffset || $.get(yOffset) !== D.yOffset || $.get(rotationDeg) !== D.rotationDeg || $.get(focalLength) !== D.focalLength || $.get(speed1) !== D.speed1 || $.get(speed2) !== D.speed2 || $.get(dir2) !== D.dir2 || $.get(bend1) !== D.bend1 || $.get(bend2) !== D.bend2 || $.get(color1) !== D.color1 || $.get(color2) !== D.color2);

	function reset() {
		$.set(xOffset, D.xOffset, true);
		$.set(yOffset, D.yOffset, true);
		$.set(rotationDeg, D.rotationDeg, true);
		$.set(focalLength, D.focalLength, true);
		$.set(speed1, D.speed1, true);
		$.set(speed2, D.speed2, true);
		$.set(dir2, D.dir2, true);
		$.set(bend1, D.bend1, true);
		$.set(bend2, D.bend2, true);
		$.set(color1, D.color1, true);
		$.set(color2, D.color2, true);
	}

	const usage = $.derived(() => `${sO}
  import PlasmaWave from '$lib/components/PlasmaWave.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <PlasmaWave colors={["${$.get(color1)}", "${$.get(color2)}"]} />
</div>`);

	const colorsTuple = $.derived(() => [$.get(color1), $.get(color2)]);

	const props = [
		{
			name: 'xOffset',
			type: 'number',
			default: '0',
			description: 'Horizontal offset in pixels.'
		},

		{
			name: 'yOffset',
			type: 'number',
			default: '0',
			description: 'Vertical offset in pixels.'
		},

		{
			name: 'rotationDeg',
			type: 'number',
			default: '0',
			description: 'Rotation angle in degrees.'
		},

		{
			name: 'focalLength',
			type: 'number',
			default: '0.8',
			description: 'Camera focal length.'
		},

		{
			name: 'speed1',
			type: 'number',
			default: '0.05',
			description: 'Speed of first wave.'
		},

		{
			name: 'speed2',
			type: 'number',
			default: '0.05',
			description: 'Speed of second wave.'
		},

		{
			name: 'dir2',
			type: 'number',
			default: '1',
			description: 'Direction of second wave.'
		},

		{
			name: 'bend1',
			type: 'number',
			default: '1',
			description: 'Bend of first wave.'
		},

		{
			name: 'bend2',
			type: 'number',
			default: '0.5',
			description: 'Bend of second wave.'
		},

		{
			name: 'colors',
			type: '[string, string]',
			default: "['#A855F7', '#06B6D4']",
			description: 'Pair of wave colors.'
		}
	];

	var fragment = root_2();

	$.head('okky6t', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Plasma Wave - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			PlasmaWave(node_1, {
				get xOffset() {
					return $.get(xOffset);
				},

				get yOffset() {
					return $.get(yOffset);
				},

				get rotationDeg() {
					return $.get(rotationDeg);
				},

				get focalLength() {
					return $.get(focalLength);
				},

				get speed1() {
					return $.get(speed1);
				},

				get speed2() {
					return $.get(speed2);
				},

				get dir2() {
					return $.get(dir2);
				},

				get bend1() {
					return $.get(bend1);
				},

				get bend2() {
					return $.get(bend2);
				},

				get colors() {
					return $.get(colorsTuple);
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
				slug: 'plasma-wave',
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
						title: 'Color 1',
						get value() {
							return $.get(color1);
						},
						onChange: (v) => $.set(color1, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Color 2',
						get value() {
							return $.get(color2);
						},
						onChange: (v) => $.set(color2, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Rotation',
						min: -180,
						max: 180,
						step: 1,
						get value() {
							return $.get(rotationDeg);
						},
						onChange: (v) => $.set(rotationDeg, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Focal Length',
						min: 0.2,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(focalLength);
						},
						onChange: (v) => $.set(focalLength, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Speed 1',
						min: 0,
						max: 0.3,
						step: 0.005,
						get value() {
							return $.get(speed1);
						},
						onChange: (v) => $.set(speed1, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Speed 2',
						min: 0,
						max: 0.3,
						step: 0.005,
						get value() {
							return $.get(speed2);
						},
						onChange: (v) => $.set(speed2, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Bend 1',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(bend1);
						},
						onChange: (v) => $.set(bend1, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Bend 2',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(bend2);
						},
						onChange: (v) => $.set(bend2, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'X Offset',
						min: -200,
						max: 200,
						step: 1,
						get value() {
							return $.get(xOffset);
						},
						onChange: (v) => $.set(xOffset, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Y Offset',
						min: -200,
						max: 200,
						step: 1,
						get value() {
							return $.get(yOffset);
						},
						onChange: (v) => $.set(yOffset, v, true)
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
			componentName: 'PlasmaWave',
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