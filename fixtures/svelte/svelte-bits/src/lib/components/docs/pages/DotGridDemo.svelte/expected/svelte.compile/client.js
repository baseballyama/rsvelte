import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import DotGrid from '$lib/components/library/Backgrounds/DotGrid/DotGrid.svelte';
import source from '$lib/components/library/Backgrounds/DotGrid/DotGrid.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Dot Grid</h1> <!>`, 1);

export default function DotGridDemo($$anchor) {
	const D = {
		dotSize: 16,
		gap: 32,
		baseColor: '#5c2a08',
		activeColor: '#ff8a3d',
		proximity: 150,
		shockRadius: 250,
		shockStrength: 5,
		resistance: 750,
		returnDuration: 1.5
	};

	let dotSize = $.state($.proxy(D.dotSize));
	let gap = $.state($.proxy(D.gap));
	let baseColor = $.state($.proxy(D.baseColor));
	let activeColor = $.state($.proxy(D.activeColor));
	let proximity = $.state($.proxy(D.proximity));
	let shockRadius = $.state($.proxy(D.shockRadius));
	let shockStrength = $.state($.proxy(D.shockStrength));
	let resistance = $.state($.proxy(D.resistance));
	let returnDuration = $.state($.proxy(D.returnDuration));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(dotSize) !== D.dotSize || $.get(gap) !== D.gap || $.get(baseColor) !== D.baseColor || $.get(activeColor) !== D.activeColor || $.get(proximity) !== D.proximity || $.get(shockRadius) !== D.shockRadius || $.get(shockStrength) !== D.shockStrength || $.get(resistance) !== D.resistance || $.get(returnDuration) !== D.returnDuration);

	function reset() {
		$.set(dotSize, D.dotSize, true);
		$.set(gap, D.gap, true);
		$.set(baseColor, D.baseColor, true);
		$.set(activeColor, D.activeColor, true);
		$.set(proximity, D.proximity, true);
		$.set(shockRadius, D.shockRadius, true);
		$.set(shockStrength, D.shockStrength, true);
		$.set(resistance, D.resistance, true);
		$.set(returnDuration, D.returnDuration, true);
	}

	const usage = $.derived(() => `${sO}
  import DotGrid from '$lib/components/DotGrid.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <DotGrid baseColor="${$.get(baseColor)}" activeColor="${$.get(activeColor)}" />
</div>`);

	const props = [
		{
			name: 'dotSize',
			type: 'number',
			default: '16',
			description: 'Dot diameter in px.'
		},

		{
			name: 'gap',
			type: 'number',
			default: '32',
			description: 'Gap between dots.'
		},

		{
			name: 'baseColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Base dot color.'
		},

		{
			name: 'activeColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Color near cursor.'
		},

		{
			name: 'proximity',
			type: 'number',
			default: '150',
			description: 'Proximity highlight radius.'
		},

		{
			name: 'speedTrigger',
			type: 'number',
			default: '100',
			description: 'Velocity threshold to push dots.'
		},

		{
			name: 'shockRadius',
			type: 'number',
			default: '250',
			description: 'Click shockwave radius.'
		},

		{
			name: 'shockStrength',
			type: 'number',
			default: '5',
			description: 'Click shockwave strength.'
		},

		{
			name: 'maxSpeed',
			type: 'number',
			default: '5000',
			description: 'Maximum mouse velocity.'
		},

		{
			name: 'resistance',
			type: 'number',
			default: '750',
			description: 'Inertia resistance.'
		},

		{
			name: 'returnDuration',
			type: 'number',
			default: '1.5',
			description: 'Return animation duration.'
		}
	];

	var fragment = root_2();

	$.head('15m2iy1', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Dot Grid - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => `${$.get(dotSize)}-${$.get(gap)}`, ($$anchor) => {
				var div = root();
				var node_2 = $.child(div);

				DotGrid(node_2, {
					get dotSize() {
						return $.get(dotSize);
					},

					get gap() {
						return $.get(gap);
					},

					get baseColor() {
						return $.get(baseColor);
					},

					get activeColor() {
						return $.get(activeColor);
					},

					get proximity() {
						return $.get(proximity);
					},

					get shockRadius() {
						return $.get(shockRadius);
					},

					get shockStrength() {
						return $.get(shockStrength);
					},

					get resistance() {
						return $.get(resistance);
					},

					get returnDuration() {
						return $.get(returnDuration);
					}
				});

				var node_3 = $.sibling(node_2, 2);

				BackgroundContentToggle(node_3, {
					get showContent() {
						return $.get(showContent);
					},
					onToggle: (v) => $.set(showContent, v, true)
				});

				$.reset(div);
				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'dot-grid',
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
					var fragment_4 = root_1();
					var node_4 = $.first_child(fragment_4);

					PreviewColorPicker(node_4, {
						title: 'Base Color',
						get value() {
							return $.get(baseColor);
						},
						onChange: (v) => $.set(baseColor, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewColorPicker(node_5, {
						title: 'Active Color',
						get value() {
							return $.get(activeColor);
						},
						onChange: (v) => $.set(activeColor, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Dot Size',
						min: 4,
						max: 40,
						step: 1,
						get value() {
							return $.get(dotSize);
						},
						onChange: (v) => $.set(dotSize, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Gap',
						min: 4,
						max: 80,
						step: 1,
						get value() {
							return $.get(gap);
						},
						onChange: (v) => $.set(gap, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Proximity',
						min: 20,
						max: 400,
						step: 1,
						get value() {
							return $.get(proximity);
						},
						onChange: (v) => $.set(proximity, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Shock Radius',
						min: 50,
						max: 500,
						step: 1,
						get value() {
							return $.get(shockRadius);
						},
						onChange: (v) => $.set(shockRadius, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Shock Strength',
						min: 0,
						max: 20,
						step: 0.1,
						get value() {
							return $.get(shockStrength);
						},
						onChange: (v) => $.set(shockStrength, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Resistance',
						min: 50,
						max: 3000,
						step: 10,
						get value() {
							return $.get(resistance);
						},
						onChange: (v) => $.set(resistance, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Return Duration',
						min: 0.1,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(returnDuration);
						},
						onChange: (v) => $.set(returnDuration, v, true)
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
			componentName: 'DotGrid',
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