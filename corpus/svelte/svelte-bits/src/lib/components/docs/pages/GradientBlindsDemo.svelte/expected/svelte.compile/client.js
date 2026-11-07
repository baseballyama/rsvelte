import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import GradientBlinds from '$lib/components/library/Backgrounds/GradientBlinds/GradientBlinds.svelte';
import source from '$lib/components/library/Backgrounds/GradientBlinds/GradientBlinds.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Gradient Blinds</h1> <!>`, 1);

export default function GradientBlindsDemo($$anchor) {
	const D = {
		angle: 0,
		noise: 0.3,
		blindCount: 16,
		blindMinWidth: 60,
		mouseDampening: 0.15,
		mirrorGradient: false,
		spotlightRadius: 0.5,
		spotlightSoftness: 1,
		spotlightOpacity: 1,
		distortAmount: 0,
		shineDirection: 'left'
	};

	let angle = $.state($.proxy(D.angle));
	let noise = $.state($.proxy(D.noise));
	let blindCount = $.state($.proxy(D.blindCount));
	let blindMinWidth = $.state($.proxy(D.blindMinWidth));
	let mouseDampening = $.state($.proxy(D.mouseDampening));
	let mirrorGradient = $.state($.proxy(D.mirrorGradient));
	let spotlightRadius = $.state($.proxy(D.spotlightRadius));
	let spotlightSoftness = $.state($.proxy(D.spotlightSoftness));
	let spotlightOpacity = $.state($.proxy(D.spotlightOpacity));
	let distortAmount = $.state($.proxy(D.distortAmount));
	let shineDirection = $.state($.proxy(D.shineDirection));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(angle) !== D.angle || $.get(noise) !== D.noise || $.get(blindCount) !== D.blindCount || $.get(blindMinWidth) !== D.blindMinWidth || $.get(mouseDampening) !== D.mouseDampening || $.get(mirrorGradient) !== D.mirrorGradient || $.get(spotlightRadius) !== D.spotlightRadius || $.get(spotlightSoftness) !== D.spotlightSoftness || $.get(spotlightOpacity) !== D.spotlightOpacity || $.get(distortAmount) !== D.distortAmount || $.get(shineDirection) !== D.shineDirection);

	function reset() {
		$.set(angle, D.angle, true);
		$.set(noise, D.noise, true);
		$.set(blindCount, D.blindCount, true);
		$.set(blindMinWidth, D.blindMinWidth, true);
		$.set(mouseDampening, D.mouseDampening, true);
		$.set(mirrorGradient, D.mirrorGradient, true);
		$.set(spotlightRadius, D.spotlightRadius, true);
		$.set(spotlightSoftness, D.spotlightSoftness, true);
		$.set(spotlightOpacity, D.spotlightOpacity, true);
		$.set(distortAmount, D.distortAmount, true);
		$.set(shineDirection, D.shineDirection, true);
	}

	const usage = $.derived(() => `${sO}
  import GradientBlinds from '$lib/components/GradientBlinds.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative; background: #14110E;">
  <GradientBlinds gradientColors={["#FF9FFC", "#ff8a3d"]} angle={${$.get(angle)}} blindCount={${$.get(blindCount)}} />
</div>`);

	const props = [
		{
			name: 'gradientColors',
			type: 'string[]',
			default: "['#FF9FFC', '#ff8a3d']",
			description: 'Gradient stops (up to 8).'
		},

		{
			name: 'angle',
			type: 'number',
			default: '0',
			description: 'Gradient rotation in degrees.'
		},

		{
			name: 'noise',
			type: 'number',
			default: '0.3',
			description: 'Grain noise amount.'
		},

		{
			name: 'blindCount',
			type: 'number',
			default: '16',
			description: 'Number of blinds.'
		},

		{
			name: 'blindMinWidth',
			type: 'number',
			default: '60',
			description: 'Min blind width in px (cap).'
		},

		{
			name: 'mouseDampening',
			type: 'number',
			default: '0.15',
			description: 'Mouse follow tau in seconds.'
		},

		{
			name: 'mirrorGradient',
			type: 'boolean',
			default: 'false',
			description: 'Mirror the gradient.'
		},

		{
			name: 'spotlightRadius',
			type: 'number',
			default: '0.5',
			description: 'Spotlight radius.'
		},

		{
			name: 'spotlightSoftness',
			type: 'number',
			default: '1',
			description: 'Spotlight softness.'
		},

		{
			name: 'spotlightOpacity',
			type: 'number',
			default: '1',
			description: 'Spotlight opacity.'
		},

		{
			name: 'distortAmount',
			type: 'number',
			default: '0',
			description: 'Distortion strength.'
		},

		{
			name: 'shineDirection',
			type: "'left' | 'right'",
			default: "'left'",
			description: 'Shine direction.'
		},

		{
			name: 'mixBlendMode',
			type: 'string',
			default: "'lighten'",
			description: 'CSS mix-blend-mode.'
		}
	];

	var fragment = root_2();

	$.head('15zjqcq', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Gradient Blinds - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			GradientBlinds(node_1, {
				gradientColors: ['#FF9FFC', '#ff8a3d'],
				get angle() {
					return $.get(angle);
				},

				get noise() {
					return $.get(noise);
				},

				get blindCount() {
					return $.get(blindCount);
				},

				get blindMinWidth() {
					return $.get(blindMinWidth);
				},

				get mouseDampening() {
					return $.get(mouseDampening);
				},

				get mirrorGradient() {
					return $.get(mirrorGradient);
				},

				get spotlightRadius() {
					return $.get(spotlightRadius);
				},

				get spotlightSoftness() {
					return $.get(spotlightSoftness);
				},

				get spotlightOpacity() {
					return $.get(spotlightOpacity);
				},

				get distortAmount() {
					return $.get(distortAmount);
				},

				get shineDirection() {
					return $.get(shineDirection);
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
				slug: 'gradient-blinds',
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
						title: 'Angle',
						min: -180,
						max: 180,
						step: 1,
						get value() {
							return $.get(angle);
						},
						onChange: (v) => $.set(angle, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Blind Count',
						min: 1,
						max: 64,
						step: 1,
						get value() {
							return $.get(blindCount);
						},
						onChange: (v) => $.set(blindCount, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Blind Min Width',
						min: 0,
						max: 300,
						step: 1,
						get value() {
							return $.get(blindMinWidth);
						},
						onChange: (v) => $.set(blindMinWidth, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Noise',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(noise);
						},
						onChange: (v) => $.set(noise, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Mouse Dampening',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(mouseDampening);
						},
						onChange: (v) => $.set(mouseDampening, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Mirror Gradient',
						get checked() {
							return $.get(mirrorGradient);
						},
						onChange: (v) => $.set(mirrorGradient, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Spotlight Radius',
						min: 0.1,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(spotlightRadius);
						},
						onChange: (v) => $.set(spotlightRadius, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Spotlight Softness',
						min: 0.1,
						max: 4,
						step: 0.1,
						get value() {
							return $.get(spotlightSoftness);
						},
						onChange: (v) => $.set(spotlightSoftness, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Spotlight Opacity',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(spotlightOpacity);
						},
						onChange: (v) => $.set(spotlightOpacity, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Distort',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(distortAmount);
						},
						onChange: (v) => $.set(distortAmount, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					{
						let $0 = $.derived(() => $.get(shineDirection) === 'right');

						PreviewSwitch(node_13, {
							title: 'Shine Right',
							get checked() {
								return $.get($0);
							},
							onChange: (v) => $.set(shineDirection, v ? 'right' : 'left', true)
						});
					}

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
			componentName: 'GradientBlinds',
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