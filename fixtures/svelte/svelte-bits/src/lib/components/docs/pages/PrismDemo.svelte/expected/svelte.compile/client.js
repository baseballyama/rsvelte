import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Prism from '$lib/components/library/Backgrounds/Prism/Prism.svelte';
import source from '$lib/components/library/Backgrounds/Prism/Prism.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Prism</h1> <!>`, 1);

export default function PrismDemo($$anchor) {
	const D = {
		height: 3.5,
		baseWidth: 5.5,
		animationType: 'rotate',
		glow: 1,
		noise: 0.5,
		scale: 3.6,
		hueShift: 0,
		colorFrequency: 1,
		hoverStrength: 2,
		inertia: 0.05,
		bloom: 1,
		timeScale: 0.5,
		transparent: true
	};

	let height = $.state($.proxy(D.height));
	let baseWidth = $.state($.proxy(D.baseWidth));
	let animationType = $.state($.proxy(D.animationType));
	let glow = $.state($.proxy(D.glow));
	let noise = $.state($.proxy(D.noise));
	let scale = $.state($.proxy(D.scale));
	let hueShift = $.state($.proxy(D.hueShift));
	let colorFrequency = $.state($.proxy(D.colorFrequency));
	let hoverStrength = $.state($.proxy(D.hoverStrength));
	let inertia = $.state($.proxy(D.inertia));
	let bloom = $.state($.proxy(D.bloom));
	let timeScale = $.state($.proxy(D.timeScale));
	let transparent = $.state($.proxy(D.transparent));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(height) !== D.height || $.get(baseWidth) !== D.baseWidth || $.get(animationType) !== D.animationType || $.get(glow) !== D.glow || $.get(noise) !== D.noise || $.get(scale) !== D.scale || $.get(hueShift) !== D.hueShift || $.get(colorFrequency) !== D.colorFrequency || $.get(hoverStrength) !== D.hoverStrength || $.get(inertia) !== D.inertia || $.get(bloom) !== D.bloom || $.get(timeScale) !== D.timeScale || $.get(transparent) !== D.transparent);

	function reset() {
		$.set(height, D.height, true);
		$.set(baseWidth, D.baseWidth, true);
		$.set(animationType, D.animationType, true);
		$.set(glow, D.glow, true);
		$.set(noise, D.noise, true);
		$.set(scale, D.scale, true);
		$.set(hueShift, D.hueShift, true);
		$.set(colorFrequency, D.colorFrequency, true);
		$.set(hoverStrength, D.hoverStrength, true);
		$.set(inertia, D.inertia, true);
		$.set(bloom, D.bloom, true);
		$.set(timeScale, D.timeScale, true);
		$.set(transparent, D.transparent, true);
	}

	const usage = $.derived(() => `${sO}
  import Prism from '$lib/components/Prism.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px;">
  <Prism animationType="${$.get(animationType)}" timeScale={${$.get(timeScale)}} />
</div>`);

	const props = [
		{
			name: 'height',
			type: 'number',
			default: '3.5',
			description: 'Pyramid height.'
		},

		{
			name: 'baseWidth',
			type: 'number',
			default: '5.5',
			description: 'Pyramid base width.'
		},

		{
			name: 'animationType',
			type: "'rotate'|'hover'|'3drotate'",
			default: "'rotate'",
			description: 'Animation mode.'
		},

		{
			name: 'glow',
			type: 'number',
			default: '1',
			description: 'Glow strength.'
		},

		{
			name: 'offset',
			type: '{x,y}',
			default: '{x:0,y:0}',
			description: 'Pixel offset.'
		},

		{
			name: 'noise',
			type: 'number',
			default: '0.5',
			description: 'Grain noise.'
		},

		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Alpha background.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '3.6',
			description: 'Scene scale.'
		},

		{
			name: 'hueShift',
			type: 'number',
			default: '0',
			description: 'Hue rotation (rad).'
		},

		{
			name: 'colorFrequency',
			type: 'number',
			default: '1',
			description: 'Color stripe frequency.'
		},

		{
			name: 'hoverStrength',
			type: 'number',
			default: '2',
			description: 'Hover rotate strength.'
		},

		{
			name: 'inertia',
			type: 'number',
			default: '0.05',
			description: 'Hover inertia.'
		},

		{
			name: 'bloom',
			type: 'number',
			default: '1',
			description: 'Bloom multiplier.'
		},

		{
			name: 'suspendWhenOffscreen',
			type: 'boolean',
			default: 'false',
			description: 'Pause RAF off-screen.'
		},

		{
			name: 'timeScale',
			type: 'number',
			default: '0.5',
			description: 'Time multiplier.'
		}
	];

	let key = $.state(0);

	function rebuild() {
		$.update(key);
	}

	var fragment = root_2();

	$.head('1eyc6g3', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Prism - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				Prism($$anchor, {
					get height() {
						return $.get(height);
					},

					get baseWidth() {
						return $.get(baseWidth);
					},

					get animationType() {
						return $.get(animationType);
					},

					get glow() {
						return $.get(glow);
					},

					get noise() {
						return $.get(noise);
					},

					get scale() {
						return $.get(scale);
					},

					get hueShift() {
						return $.get(hueShift);
					},

					get colorFrequency() {
						return $.get(colorFrequency);
					},

					get hoverStrength() {
						return $.get(hoverStrength);
					},

					get inertia() {
						return $.get(inertia);
					},

					get bloom() {
						return $.get(bloom);
					},

					get timeScale() {
						return $.get(timeScale);
					},

					get transparent() {
						return $.get(transparent);
					}
				});
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
				slug: 'prism',
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
					var node_3 = $.first_child(fragment_4);

					PreviewSlider(node_3, {
						title: 'Height',
						min: 0.5,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(height);
						},

						onChange: (v) => {
							$.set(height, v, true);
							rebuild();
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Base Width',
						min: 0.5,
						max: 12,
						step: 0.1,
						get value() {
							return $.get(baseWidth);
						},

						onChange: (v) => {
							$.set(baseWidth, v, true);
							rebuild();
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Glow',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(glow);
						},
						onChange: (v) => $.set(glow, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Noise',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(noise);
						},
						onChange: (v) => $.set(noise, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Scale',
						min: 0.5,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(scale);
						},

						onChange: (v) => {
							$.set(scale, v, true);
							rebuild();
						}
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Hue Shift',
						min: -3.14,
						max: 3.14,
						step: 0.01,
						get value() {
							return $.get(hueShift);
						},
						onChange: (v) => $.set(hueShift, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Color Frequency',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(colorFrequency);
						},
						onChange: (v) => $.set(colorFrequency, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Hover Strength',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(hoverStrength);
						},

						onChange: (v) => {
							$.set(hoverStrength, v, true);
							rebuild();
						}
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Inertia',
						min: 0.01,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(inertia);
						},

						onChange: (v) => {
							$.set(inertia, v, true);
							rebuild();
						}
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Bloom',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(bloom);
						},
						onChange: (v) => $.set(bloom, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Time Scale',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(timeScale);
						},

						onChange: (v) => {
							$.set(timeScale, v, true);
							rebuild();
						}
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSwitch(node_14, {
						title: 'Transparent',
						get checked() {
							return $.get(transparent);
						},

						onChange: (v) => {
							$.set(transparent, v, true);
							rebuild();
						}
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
			onreset: () => {
				reset();
				rebuild();
			},

			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'Prism',
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