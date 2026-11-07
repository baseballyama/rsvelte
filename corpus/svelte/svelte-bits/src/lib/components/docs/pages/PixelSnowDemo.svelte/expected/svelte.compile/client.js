import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import PixelSnow from '$lib/components/library/Backgrounds/PixelSnow/PixelSnow.svelte';
import source from '$lib/components/library/Backgrounds/PixelSnow/PixelSnow.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Pixel Snow</h1> <!>`, 1);

export default function PixelSnowDemo($$anchor) {
	const D = {
		color: '#ffffff',
		flakeSize: 0.01,
		minFlakeSize: 1.25,
		pixelResolution: 200,
		speed: 1.25,
		depthFade: 8,
		brightness: 1,
		density: 0.3,
		direction: 125,
		variant: 'square'
	};

	let color = $.state($.proxy(D.color));
	let flakeSize = $.state($.proxy(D.flakeSize));
	let minFlakeSize = $.state($.proxy(D.minFlakeSize));
	let pixelResolution = $.state($.proxy(D.pixelResolution));
	let speed = $.state($.proxy(D.speed));
	let depthFade = $.state($.proxy(D.depthFade));
	let brightness = $.state($.proxy(D.brightness));
	let density = $.state($.proxy(D.density));
	let direction = $.state($.proxy(D.direction));
	let variant = $.state($.proxy(D.variant));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(color) !== D.color || $.get(flakeSize) !== D.flakeSize || $.get(minFlakeSize) !== D.minFlakeSize || $.get(pixelResolution) !== D.pixelResolution || $.get(speed) !== D.speed || $.get(depthFade) !== D.depthFade || $.get(brightness) !== D.brightness || $.get(density) !== D.density || $.get(direction) !== D.direction || $.get(variant) !== D.variant);

	function reset() {
		$.set(color, D.color, true);
		$.set(flakeSize, D.flakeSize, true);
		$.set(minFlakeSize, D.minFlakeSize, true);
		$.set(pixelResolution, D.pixelResolution, true);
		$.set(speed, D.speed, true);
		$.set(depthFade, D.depthFade, true);
		$.set(brightness, D.brightness, true);
		$.set(density, D.density, true);
		$.set(direction, D.direction, true);
		$.set(variant, D.variant, true);
	}

	const usage = $.derived(() => `${sO}
  import PixelSnow from '$lib/components/PixelSnow.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative; background: #14110E;">
  <PixelSnow color="${$.get(color)}" density={${$.get(density)}} variant="${$.get(variant)}" />
</div>`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: "'#ffffff'",
			description: 'Snowflake color.'
		},

		{
			name: 'flakeSize',
			type: 'number',
			default: '0.01',
			description: 'Flake size.'
		},

		{
			name: 'minFlakeSize',
			type: 'number',
			default: '1.25',
			description: 'Minimum flake size in screen pixels.'
		},

		{
			name: 'pixelResolution',
			type: 'number',
			default: '200',
			description: 'Resolution downsample for pixel look.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1.25',
			description: 'Fall speed.'
		},

		{
			name: 'depthFade',
			type: 'number',
			default: '8',
			description: 'Depth fade falloff.'
		},

		{
			name: 'farPlane',
			type: 'number',
			default: '20',
			description: 'Far render plane.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '1',
			description: 'Brightness.'
		},

		{
			name: 'gamma',
			type: 'number',
			default: '0.4545',
			description: 'Gamma correction.'
		},

		{
			name: 'density',
			type: 'number',
			default: '0.3',
			description: 'Snowflake density.'
		},

		{
			name: 'variant',
			type: "'square' | 'round' | 'snowflake'",
			default: "'square'",
			description: 'Flake shape.'
		},

		{
			name: 'direction',
			type: 'number',
			default: '125',
			description: 'Wind direction in degrees.'
		}
	];

	var fragment = root_2();

	$.head('m8bfrx', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Pixel Snow - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			PixelSnow(node_1, {
				get color() {
					return $.get(color);
				},

				get flakeSize() {
					return $.get(flakeSize);
				},

				get minFlakeSize() {
					return $.get(minFlakeSize);
				},

				get pixelResolution() {
					return $.get(pixelResolution);
				},

				get speed() {
					return $.get(speed);
				},

				get depthFade() {
					return $.get(depthFade);
				},

				get brightness() {
					return $.get(brightness);
				},

				get density() {
					return $.get(density);
				},

				get variant() {
					return $.get(variant);
				},

				get direction() {
					return $.get(direction);
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
				slug: 'pixel-snow',
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
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Density',
						min: 0.05,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(density);
						},
						onChange: (v) => $.set(density, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Direction',
						min: 0,
						max: 360,
						step: 1,
						get value() {
							return $.get(direction);
						},
						onChange: (v) => $.set(direction, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Flake Size',
						min: 0.005,
						max: 0.05,
						step: 0.001,
						get value() {
							return $.get(flakeSize);
						},
						onChange: (v) => $.set(flakeSize, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Min Flake Size',
						min: 0.5,
						max: 4,
						step: 0.1,
						get value() {
							return $.get(minFlakeSize);
						},
						onChange: (v) => $.set(minFlakeSize, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Pixel Resolution',
						min: 50,
						max: 500,
						step: 10,
						get value() {
							return $.get(pixelResolution);
						},
						onChange: (v) => $.set(pixelResolution, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Depth Fade',
						min: 1,
						max: 20,
						step: 0.5,
						get value() {
							return $.get(depthFade);
						},
						onChange: (v) => $.set(depthFade, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Brightness',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(brightness);
						},
						onChange: (v) => $.set(brightness, v, true)
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
			componentName: 'PixelSnow',
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