import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Galaxy from '$lib/components/library/Backgrounds/Galaxy/Galaxy.svelte';
import source from '$lib/components/library/Backgrounds/Galaxy/Galaxy.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Galaxy</h1> <!>`, 1);

export default function GalaxyDemo($$anchor) {
	const D = {
		density: 1,
		hueShift: 30,
		glowIntensity: 0.3,
		saturation: 0,
		twinkleIntensity: 0.3,
		rotationSpeed: 0.1,
		repulsionStrength: 2,
		speed: 1,
		mouseRepulsion: true,
		autoCenterRepulsion: 0,
		transparent: true
	};

	let density = $.state($.proxy(D.density));
	let hueShift = $.state($.proxy(D.hueShift));
	let glowIntensity = $.state($.proxy(D.glowIntensity));
	let saturation = $.state($.proxy(D.saturation));
	let twinkleIntensity = $.state($.proxy(D.twinkleIntensity));
	let rotationSpeed = $.state($.proxy(D.rotationSpeed));
	let repulsionStrength = $.state($.proxy(D.repulsionStrength));
	let speed = $.state($.proxy(D.speed));
	let mouseRepulsion = $.state($.proxy(D.mouseRepulsion));
	let autoCenterRepulsion = $.state($.proxy(D.autoCenterRepulsion));
	let transparent = $.state($.proxy(D.transparent));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(density) !== D.density || $.get(hueShift) !== D.hueShift || $.get(glowIntensity) !== D.glowIntensity || $.get(saturation) !== D.saturation || $.get(twinkleIntensity) !== D.twinkleIntensity || $.get(rotationSpeed) !== D.rotationSpeed || $.get(repulsionStrength) !== D.repulsionStrength || $.get(speed) !== D.speed || $.get(mouseRepulsion) !== D.mouseRepulsion || $.get(autoCenterRepulsion) !== D.autoCenterRepulsion || $.get(transparent) !== D.transparent);

	function reset() {
		$.set(density, D.density, true);
		$.set(hueShift, D.hueShift, true);
		$.set(glowIntensity, D.glowIntensity, true);
		$.set(saturation, D.saturation, true);
		$.set(twinkleIntensity, D.twinkleIntensity, true);
		$.set(rotationSpeed, D.rotationSpeed, true);
		$.set(repulsionStrength, D.repulsionStrength, true);
		$.set(speed, D.speed, true);
		$.set(mouseRepulsion, D.mouseRepulsion, true);
		$.set(autoCenterRepulsion, D.autoCenterRepulsion, true);
		$.set(transparent, D.transparent, true);
	}

	const usage = $.derived(() => `${sO}
  import Galaxy from '$lib/components/Galaxy.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <Galaxy density={${$.get(density)}} hueShift={${$.get(hueShift)}} glowIntensity={${$.get(glowIntensity)}} />
</div>`);

	const props = [
		{
			name: 'focal',
			type: '[number, number]',
			default: '[0.5, 0.5]',
			description: 'Focal point.'
		},

		{
			name: 'rotation',
			type: '[number, number]',
			default: '[1, 0]',
			description: 'Rotation matrix.'
		},

		{
			name: 'starSpeed',
			type: 'number',
			default: '0.5',
			description: 'Star speed.'
		},

		{
			name: 'density',
			type: 'number',
			default: '1',
			description: 'Star density.'
		},

		{
			name: 'hueShift',
			type: 'number',
			default: '140',
			description: 'Hue shift in degrees.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed.'
		},

		{
			name: 'glowIntensity',
			type: 'number',
			default: '0.3',
			description: 'Star glow intensity.'
		},

		{
			name: 'saturation',
			type: 'number',
			default: '0',
			description: 'Color saturation.'
		},

		{
			name: 'twinkleIntensity',
			type: 'number',
			default: '0.3',
			description: 'Twinkle strength.'
		},

		{
			name: 'rotationSpeed',
			type: 'number',
			default: '0.1',
			description: 'Auto rotation speed.'
		},

		{
			name: 'mouseRepulsion',
			type: 'boolean',
			default: 'true',
			description: 'Repel from cursor.'
		},

		{
			name: 'repulsionStrength',
			type: 'number',
			default: '2',
			description: 'Repulsion strength.'
		},

		{
			name: 'autoCenterRepulsion',
			type: 'number',
			default: '0',
			description: 'Auto center repulsion.'
		},

		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Respond to mouse.'
		},

		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Transparent background.'
		}
	];

	var fragment = root_2();

	$.head('apkwoe', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Galaxy - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Galaxy(node_1, {
				get density() {
					return $.get(density);
				},

				get hueShift() {
					return $.get(hueShift);
				},

				get glowIntensity() {
					return $.get(glowIntensity);
				},

				get saturation() {
					return $.get(saturation);
				},

				get twinkleIntensity() {
					return $.get(twinkleIntensity);
				},

				get rotationSpeed() {
					return $.get(rotationSpeed);
				},

				get repulsionStrength() {
					return $.get(repulsionStrength);
				},

				get speed() {
					return $.get(speed);
				},

				get mouseRepulsion() {
					return $.get(mouseRepulsion);
				},

				get autoCenterRepulsion() {
					return $.get(autoCenterRepulsion);
				},

				get transparent() {
					return $.get(transparent);
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
				slug: 'galaxy',
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

					PreviewSlider(node_3, {
						title: 'Density',
						min: 0.1,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(density);
						},
						onChange: (v) => $.set(density, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Hue Shift',
						min: 0,
						max: 360,
						step: 1,
						get value() {
							return $.get(hueShift);
						},
						onChange: (v) => $.set(hueShift, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Glow Intensity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(glowIntensity);
						},
						onChange: (v) => $.set(glowIntensity, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Saturation',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(saturation);
						},
						onChange: (v) => $.set(saturation, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Twinkle Intensity',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(twinkleIntensity);
						},
						onChange: (v) => $.set(twinkleIntensity, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Rotation Speed',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(rotationSpeed);
						},
						onChange: (v) => $.set(rotationSpeed, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSwitch(node_10, {
						title: 'Mouse Repulsion',
						get checked() {
							return $.get(mouseRepulsion);
						},
						onChange: (v) => $.set(mouseRepulsion, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Repulsion Strength',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(repulsionStrength);
						},
						onChange: (v) => $.set(repulsionStrength, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Auto Center Repulsion',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(autoCenterRepulsion);
						},
						onChange: (v) => $.set(autoCenterRepulsion, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSwitch(node_13, {
						title: 'Transparent',
						get checked() {
							return $.get(transparent);
						},
						onChange: (v) => $.set(transparent, v, true)
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
			componentName: 'Galaxy',
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