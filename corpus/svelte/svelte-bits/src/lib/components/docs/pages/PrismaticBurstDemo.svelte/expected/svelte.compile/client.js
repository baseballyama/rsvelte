import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import PrismaticBurst from '$lib/components/library/Backgrounds/PrismaticBurst/PrismaticBurst.svelte';
import source from '$lib/components/library/Backgrounds/PrismaticBurst/PrismaticBurst.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Prismatic Burst</h1> <!>`, 1);

export default function PrismaticBurstDemo($$anchor) {
	const D = {
		intensity: 2,
		speed: 0.5,
		animationType: 'rotate3d',
		distort: 0,
		paused: false,
		hoverDampness: 0,
		rayCount: 0
	};

	let intensity = $.state($.proxy(D.intensity));
	let speed = $.state($.proxy(D.speed));
	let animationType = $.state($.proxy(D.animationType));
	let distort = $.state($.proxy(D.distort));
	let paused = $.state($.proxy(D.paused));
	let hoverDampness = $.state($.proxy(D.hoverDampness));
	let rayCount = $.state($.proxy(D.rayCount));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(intensity) !== D.intensity || $.get(speed) !== D.speed || $.get(animationType) !== D.animationType || $.get(distort) !== D.distort || $.get(paused) !== D.paused || $.get(hoverDampness) !== D.hoverDampness || $.get(rayCount) !== D.rayCount);

	function reset() {
		$.set(intensity, D.intensity, true);
		$.set(speed, D.speed, true);
		$.set(animationType, D.animationType, true);
		$.set(distort, D.distort, true);
		$.set(paused, D.paused, true);
		$.set(hoverDampness, D.hoverDampness, true);
		$.set(rayCount, D.rayCount, true);
	}

	const usage = $.derived(() => `${sO}
  import PrismaticBurst from '$lib/components/PrismaticBurst.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <PrismaticBurst intensity={${$.get(intensity)}} speed={${$.get(speed)}} animationType="${$.get(animationType)}" />
</div>`);

	const props = [
		{
			name: 'intensity',
			type: 'number',
			default: '2',
			description: 'Brightness.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.5',
			description: 'Animation speed.'
		},

		{
			name: 'animationType',
			type: "'rotate'|'rotate3d'|'hover'",
			default: "'rotate3d'",
			description: 'Animation mode.'
		},

		{
			name: 'colors',
			type: 'string[]',
			default: 'undefined',
			description: 'Custom gradient colors.'
		},

		{
			name: 'distort',
			type: 'number',
			default: '0',
			description: 'Bend distortion strength.'
		},

		{
			name: 'paused',
			type: 'boolean',
			default: 'false',
			description: 'Pause animation.'
		},

		{
			name: 'offset',
			type: '{x,y}',
			default: '{x:0,y:0}',
			description: 'Pixel offset.'
		},

		{
			name: 'hoverDampness',
			type: 'number',
			default: '0',
			description: 'Hover damping (hover mode).'
		},

		{
			name: 'rayCount',
			type: 'number',
			default: '0',
			description: 'Discrete ray count.'
		},

		{
			name: 'mixBlendMode',
			type: 'string',
			default: "'lighten'",
			description: 'CSS mix-blend-mode.'
		}
	];

	var fragment = root_2();

	$.head('pzjz1g', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Prismatic Burst - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			PrismaticBurst(node_1, {
				get intensity() {
					return $.get(intensity);
				},

				get speed() {
					return $.get(speed);
				},

				get animationType() {
					return $.get(animationType);
				},

				get distort() {
					return $.get(distort);
				},

				get paused() {
					return $.get(paused);
				},

				get hoverDampness() {
					return $.get(hoverDampness);
				},

				get rayCount() {
					return $.get(rayCount);
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
				slug: 'prismatic-burst',
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
						title: 'Intensity',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(intensity);
						},
						onChange: (v) => $.set(intensity, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Distort',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(distort);
						},
						onChange: (v) => $.set(distort, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Hover Dampness',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(hoverDampness);
						},
						onChange: (v) => $.set(hoverDampness, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Ray Count',
						min: 0,
						max: 24,
						step: 1,
						get value() {
							return $.get(rayCount);
						},
						onChange: (v) => $.set(rayCount, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Paused',
						get checked() {
							return $.get(paused);
						},
						onChange: (v) => $.set(paused, v, true)
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
			componentName: 'PrismaticBurst',
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