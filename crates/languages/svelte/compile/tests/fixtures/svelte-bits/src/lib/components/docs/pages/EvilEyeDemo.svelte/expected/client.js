import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import EvilEye from '$lib/components/library/Backgrounds/EvilEye/EvilEye.svelte';
import source from '$lib/components/library/Backgrounds/EvilEye/EvilEye.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Evil Eye</h1> <!>`, 1);

export default function EvilEyeDemo($$anchor) {
	const D = {
		eyeColor: '#FF6F37',
		intensity: 1.5,
		pupilSize: 0.6,
		irisWidth: 0.25,
		glowIntensity: 0.35,
		scale: 0.8,
		noiseScale: 1,
		pupilFollow: 1,
		flameSpeed: 1,
		backgroundColor: '#14110E'
	};

	let eyeColor = $.state($.proxy(D.eyeColor));
	let intensity = $.state($.proxy(D.intensity));
	let pupilSize = $.state($.proxy(D.pupilSize));
	let irisWidth = $.state($.proxy(D.irisWidth));
	let glowIntensity = $.state($.proxy(D.glowIntensity));
	let scale = $.state($.proxy(D.scale));
	let noiseScale = $.state($.proxy(D.noiseScale));
	let pupilFollow = $.state($.proxy(D.pupilFollow));
	let flameSpeed = $.state($.proxy(D.flameSpeed));
	let backgroundColor = $.state($.proxy(D.backgroundColor));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(eyeColor) !== D.eyeColor || $.get(intensity) !== D.intensity || $.get(pupilSize) !== D.pupilSize || $.get(irisWidth) !== D.irisWidth || $.get(glowIntensity) !== D.glowIntensity || $.get(scale) !== D.scale || $.get(noiseScale) !== D.noiseScale || $.get(pupilFollow) !== D.pupilFollow || $.get(flameSpeed) !== D.flameSpeed || $.get(backgroundColor) !== D.backgroundColor);

	function reset() {
		$.set(eyeColor, D.eyeColor, true);
		$.set(intensity, D.intensity, true);
		$.set(pupilSize, D.pupilSize, true);
		$.set(irisWidth, D.irisWidth, true);
		$.set(glowIntensity, D.glowIntensity, true);
		$.set(scale, D.scale, true);
		$.set(noiseScale, D.noiseScale, true);
		$.set(pupilFollow, D.pupilFollow, true);
		$.set(flameSpeed, D.flameSpeed, true);
		$.set(backgroundColor, D.backgroundColor, true);
	}

	const usage = $.derived(() => `${sO}
  import EvilEye from '$lib/components/EvilEye.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <EvilEye eyeColor="${$.get(eyeColor)}" />
</div>`);

	const props = [
		{
			name: 'eyeColor',
			type: 'string',
			default: '"#FF6F37"',
			description: 'Primary eye color.'
		},

		{
			name: 'intensity',
			type: 'number',
			default: '1.5',
			description: 'Brightness multiplier.'
		},

		{
			name: 'pupilSize',
			type: 'number',
			default: '0.6',
			description: 'Pupil size.'
		},

		{
			name: 'irisWidth',
			type: 'number',
			default: '0.25',
			description: 'Iris ring width.'
		},

		{
			name: 'glowIntensity',
			type: 'number',
			default: '0.35',
			description: 'Outer glow intensity.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '0.8',
			description: 'Eye scale.'
		},

		{
			name: 'noiseScale',
			type: 'number',
			default: '1',
			description: 'Noise scale.'
		},

		{
			name: 'pupilFollow',
			type: 'number',
			default: '1',
			description: 'Pupil cursor follow strength.'
		},

		{
			name: 'flameSpeed',
			type: 'number',
			default: '1',
			description: 'Flame animation speed.'
		},

		{
			name: 'backgroundColor',
			type: 'string',
			default: '"#000000"',
			description: 'Background color.'
		}
	];

	var fragment = root_2();

	$.head('1gaiw99', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Evil Eye - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			EvilEye(node_1, {
				get eyeColor() {
					return $.get(eyeColor);
				},

				get intensity() {
					return $.get(intensity);
				},

				get pupilSize() {
					return $.get(pupilSize);
				},

				get irisWidth() {
					return $.get(irisWidth);
				},

				get glowIntensity() {
					return $.get(glowIntensity);
				},

				get scale() {
					return $.get(scale);
				},

				get noiseScale() {
					return $.get(noiseScale);
				},

				get pupilFollow() {
					return $.get(pupilFollow);
				},

				get flameSpeed() {
					return $.get(flameSpeed);
				},

				get backgroundColor() {
					return $.get(backgroundColor);
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
				slug: 'evil-eye',
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
						title: 'Eye Color',
						get value() {
							return $.get(eyeColor);
						},
						onChange: (v) => $.set(eyeColor, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Background',
						get value() {
							return $.get(backgroundColor);
						},
						onChange: (v) => $.set(backgroundColor, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Intensity',
						min: 0,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(intensity);
						},
						onChange: (v) => $.set(intensity, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Pupil Size',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(pupilSize);
						},
						onChange: (v) => $.set(pupilSize, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Iris Width',
						min: 0.05,
						max: 0.6,
						step: 0.01,
						get value() {
							return $.get(irisWidth);
						},
						onChange: (v) => $.set(irisWidth, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Glow Intensity',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(glowIntensity);
						},
						onChange: (v) => $.set(glowIntensity, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Scale',
						min: 0.2,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => $.set(scale, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Noise Scale',
						min: 0.1,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(noiseScale);
						},
						onChange: (v) => $.set(noiseScale, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Pupil Follow',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(pupilFollow);
						},
						onChange: (v) => $.set(pupilFollow, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Flame Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(flameSpeed);
						},
						onChange: (v) => $.set(flameSpeed, v, true)
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
			componentName: 'EvilEye',
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