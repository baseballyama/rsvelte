import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import LightRays from '$lib/components/library/Backgrounds/LightRays/LightRays.svelte';
import source from '$lib/components/library/Backgrounds/LightRays/LightRays.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Light Rays</h1> <!>`, 1);

export default function LightRaysDemo($$anchor, $$props) {
	$.push($$props, true);

	const D = {
		raysOrigin: 'top-center',
		raysColor: '#ffffff',
		raysSpeed: 1,
		lightSpread: 1,
		rayLength: 2,
		pulsating: false,
		fadeDistance: 1,
		saturation: 1,
		followMouse: true,
		mouseInfluence: 0.1,
		noiseAmount: 0,
		distortion: 0
	};

	let raysOrigin = $.state($.proxy(D.raysOrigin));
	let raysColor = $.state($.proxy(D.raysColor));
	let raysSpeed = $.state($.proxy(D.raysSpeed));
	let lightSpread = $.state($.proxy(D.lightSpread));
	let rayLength = $.state($.proxy(D.rayLength));
	let pulsating = $.state($.proxy(D.pulsating));
	let fadeDistance = $.state($.proxy(D.fadeDistance));
	let saturation = $.state($.proxy(D.saturation));
	let followMouse = $.state($.proxy(D.followMouse));
	let mouseInfluence = $.state($.proxy(D.mouseInfluence));
	let noiseAmount = $.state($.proxy(D.noiseAmount));
	let distortion = $.state($.proxy(D.distortion));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(raysOrigin) !== D.raysOrigin || $.get(raysColor) !== D.raysColor || $.get(raysSpeed) !== D.raysSpeed || $.get(lightSpread) !== D.lightSpread || $.get(rayLength) !== D.rayLength || $.get(pulsating) !== D.pulsating || $.get(fadeDistance) !== D.fadeDistance || $.get(saturation) !== D.saturation || $.get(followMouse) !== D.followMouse || $.get(mouseInfluence) !== D.mouseInfluence || $.get(noiseAmount) !== D.noiseAmount || $.get(distortion) !== D.distortion);

	function reset() {
		$.set(raysOrigin, D.raysOrigin, true);
		$.set(raysColor, D.raysColor, true);
		$.set(raysSpeed, D.raysSpeed, true);
		$.set(lightSpread, D.lightSpread, true);
		$.set(rayLength, D.rayLength, true);
		$.set(pulsating, D.pulsating, true);
		$.set(fadeDistance, D.fadeDistance, true);
		$.set(saturation, D.saturation, true);
		$.set(followMouse, D.followMouse, true);
		$.set(mouseInfluence, D.mouseInfluence, true);
		$.set(noiseAmount, D.noiseAmount, true);
		$.set(distortion, D.distortion, true);
	}

	const usage = $.derived(() => `${sO}
  import LightRays from '$lib/components/LightRays.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <LightRays raysOrigin="${$.get(raysOrigin)}" raysColor="${$.get(raysColor)}" raysSpeed={${$.get(raysSpeed)}} />
</div>`);

	const props = [
		{
			name: 'raysOrigin',
			type: '"top-center" | "top-left" | …',
			default: '"top-center"',
			description: 'Ray emission anchor.'
		},

		{
			name: 'raysColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Hex tint of the rays.'
		},

		{
			name: 'raysSpeed',
			type: 'number',
			default: '1',
			description: 'Animation speed.'
		},

		{
			name: 'lightSpread',
			type: 'number',
			default: '1',
			description: 'Spread tightness.'
		},

		{
			name: 'rayLength',
			type: 'number',
			default: '2',
			description: 'Ray length multiplier.'
		},

		{
			name: 'pulsating',
			type: 'boolean',
			default: 'false',
			description: 'Pulsating intensity.'
		},

		{
			name: 'fadeDistance',
			type: 'number',
			default: '1',
			description: 'Fade distance.'
		},

		{
			name: 'saturation',
			type: 'number',
			default: '1',
			description: 'Color saturation.'
		},

		{
			name: 'followMouse',
			type: 'boolean',
			default: 'true',
			description: 'Follow mouse.'
		},

		{
			name: 'mouseInfluence',
			type: 'number',
			default: '0.1',
			description: 'Mouse influence amount.'
		},

		{
			name: 'noiseAmount',
			type: 'number',
			default: '0',
			description: 'Noise grain amount.'
		},

		{
			name: 'distortion',
			type: 'number',
			default: '0',
			description: 'Distortion amount.'
		}
	];

	const originOptions = [
		'top-center',
		'top-left',
		'top-right',
		'left',
		'right',
		'bottom-center',
		'bottom-left',
		'bottom-right'
	].map((o) => ({ label: o, value: o }));

	var fragment = root_2();

	$.head('14yaxrb', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Light Rays - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			LightRays(node_1, {
				get raysOrigin() {
					return $.get(raysOrigin);
				},

				get raysColor() {
					return $.get(raysColor);
				},

				get raysSpeed() {
					return $.get(raysSpeed);
				},

				get lightSpread() {
					return $.get(lightSpread);
				},

				get rayLength() {
					return $.get(rayLength);
				},

				get pulsating() {
					return $.get(pulsating);
				},

				get fadeDistance() {
					return $.get(fadeDistance);
				},

				get saturation() {
					return $.get(saturation);
				},

				get followMouse() {
					return $.get(followMouse);
				},

				get mouseInfluence() {
					return $.get(mouseInfluence);
				},

				get noiseAmount() {
					return $.get(noiseAmount);
				},

				get distortion() {
					return $.get(distortion);
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
				slug: 'light-rays',
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

					PreviewSelect(node_3, {
						title: 'Rays Origin',
						get value() {
							return $.get(raysOrigin);
						},

						get options() {
							return originOptions;
						},
						onChange: (v) => $.set(raysOrigin, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Rays Color',
						get value() {
							return $.get(raysColor);
						},
						onChange: (v) => $.set(raysColor, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(raysSpeed);
						},
						onChange: (v) => $.set(raysSpeed, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Spread',
						min: 0.1,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(lightSpread);
						},
						onChange: (v) => $.set(lightSpread, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Ray Length',
						min: 0.5,
						max: 5,
						step: 0.05,
						get value() {
							return $.get(rayLength);
						},
						onChange: (v) => $.set(rayLength, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Pulsating',
						get checked() {
							return $.get(pulsating);
						},
						onChange: (v) => $.set(pulsating, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Fade Distance',
						min: 0.1,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(fadeDistance);
						},
						onChange: (v) => $.set(fadeDistance, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Saturation',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(saturation);
						},
						onChange: (v) => $.set(saturation, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSwitch(node_11, {
						title: 'Follow Mouse',
						get checked() {
							return $.get(followMouse);
						},
						onChange: (v) => $.set(followMouse, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Mouse Influence',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(mouseInfluence);
						},
						onChange: (v) => $.set(mouseInfluence, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Noise',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(noiseAmount);
						},
						onChange: (v) => $.set(noiseAmount, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSlider(node_14, {
						title: 'Distortion',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(distortion);
						},
						onChange: (v) => $.set(distortion, v, true)
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
			componentName: 'LightRays',
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
	$.pop();
}