import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import RippleGrid from '$lib/components/library/Backgrounds/RippleGrid/RippleGrid.svelte';
import source from '$lib/components/library/Backgrounds/RippleGrid/RippleGrid.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Ripple Grid</h1> <!>`, 1);

export default function RippleGridDemo($$anchor) {
	const D = {
		enableRainbow: false,
		gridColor: '#ff8a3d',
		rippleIntensity: 0.05,
		gridSize: 10,
		gridThickness: 15,
		mouseInteraction: true,
		mouseInteractionRadius: 1.2,
		opacity: 0.8
	};

	let enableRainbow = $.state($.proxy(D.enableRainbow));
	let gridColor = $.state($.proxy(D.gridColor));
	let rippleIntensity = $.state($.proxy(D.rippleIntensity));
	let gridSize = $.state($.proxy(D.gridSize));
	let gridThickness = $.state($.proxy(D.gridThickness));
	let mouseInteraction = $.state($.proxy(D.mouseInteraction));
	let mouseInteractionRadius = $.state($.proxy(D.mouseInteractionRadius));
	let opacity = $.state($.proxy(D.opacity));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(enableRainbow) !== D.enableRainbow || $.get(gridColor) !== D.gridColor || $.get(rippleIntensity) !== D.rippleIntensity || $.get(gridSize) !== D.gridSize || $.get(gridThickness) !== D.gridThickness || $.get(mouseInteraction) !== D.mouseInteraction || $.get(mouseInteractionRadius) !== D.mouseInteractionRadius || $.get(opacity) !== D.opacity);

	function reset() {
		$.set(enableRainbow, D.enableRainbow, true);
		$.set(gridColor, D.gridColor, true);
		$.set(rippleIntensity, D.rippleIntensity, true);
		$.set(gridSize, D.gridSize, true);
		$.set(gridThickness, D.gridThickness, true);
		$.set(mouseInteraction, D.mouseInteraction, true);
		$.set(mouseInteractionRadius, D.mouseInteractionRadius, true);
		$.set(opacity, D.opacity, true);
	}

	const usage = $.derived(() => `${sO}
  import RippleGrid from '$lib/components/RippleGrid.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <RippleGrid gridColor="${$.get(gridColor)}" rippleIntensity={${$.get(rippleIntensity)}} gridSize={${$.get(gridSize)}} />
</div>`);

	const props = [
		{
			name: 'enableRainbow',
			type: 'boolean',
			default: 'false',
			description: 'Cycle through rainbow colors.'
		},

		{
			name: 'gridColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Hex color of the grid.'
		},

		{
			name: 'rippleIntensity',
			type: 'number',
			default: '0.05',
			description: 'Ripple amplitude.'
		},

		{
			name: 'gridSize',
			type: 'number',
			default: '10',
			description: 'Grid density.'
		},

		{
			name: 'gridThickness',
			type: 'number',
			default: '15',
			description: 'Line thickness.'
		},

		{
			name: 'fadeDistance',
			type: 'number',
			default: '1.5',
			description: 'Distance fade.'
		},

		{
			name: 'vignetteStrength',
			type: 'number',
			default: '2',
			description: 'Vignette strength.'
		},

		{
			name: 'glowIntensity',
			type: 'number',
			default: '0.1',
			description: 'Glow intensity.'
		},

		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Overall opacity.'
		},

		{
			name: 'gridRotation',
			type: 'number',
			default: '0',
			description: 'Grid rotation in degrees.'
		},

		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'React to mouse.'
		},

		{
			name: 'mouseInteractionRadius',
			type: 'number',
			default: '1',
			description: 'Mouse influence radius.'
		}
	];

	var fragment = root_2();

	$.head('f1e1dg', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Ripple Grid - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			RippleGrid(node_1, {
				get enableRainbow() {
					return $.get(enableRainbow);
				},

				get gridColor() {
					return $.get(gridColor);
				},

				get rippleIntensity() {
					return $.get(rippleIntensity);
				},

				get gridSize() {
					return $.get(gridSize);
				},

				get gridThickness() {
					return $.get(gridThickness);
				},

				get mouseInteraction() {
					return $.get(mouseInteraction);
				},

				get mouseInteractionRadius() {
					return $.get(mouseInteractionRadius);
				},

				get opacity() {
					return $.get(opacity);
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
				slug: 'ripple-grid',
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

					PreviewSwitch(node_3, {
						title: 'Rainbow',
						get checked() {
							return $.get(enableRainbow);
						},
						onChange: (v) => $.set(enableRainbow, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Grid Color',
						get value() {
							return $.get(gridColor);
						},
						onChange: (v) => $.set(gridColor, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Ripple Intensity',
						min: 0,
						max: 0.3,
						step: 0.005,
						get value() {
							return $.get(rippleIntensity);
						},
						onChange: (v) => $.set(rippleIntensity, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Grid Size',
						min: 1,
						max: 30,
						step: 0.5,
						get value() {
							return $.get(gridSize);
						},
						onChange: (v) => $.set(gridSize, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Grid Thickness',
						min: 1,
						max: 50,
						step: 0.5,
						get value() {
							return $.get(gridThickness);
						},
						onChange: (v) => $.set(gridThickness, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(opacity);
						},
						onChange: (v) => $.set(opacity, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSwitch(node_9, {
						title: 'Mouse Interaction',
						get checked() {
							return $.get(mouseInteraction);
						},
						onChange: (v) => $.set(mouseInteraction, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Mouse Radius',
						min: 0.1,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(mouseInteractionRadius);
						},
						onChange: (v) => $.set(mouseInteractionRadius, v, true)
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
			componentName: 'RippleGrid',
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