import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import AnimatedContent from '$lib/components/library/Animations/AnimatedContent/AnimatedContent.svelte';
import source from '$lib/components/library/Animations/AnimatedContent/AnimatedContent.svelte?raw';

export default function AnimatedContentDemo($$renderer) {
	const DEFAULTS = {
		distance: 100,
		direction: 'vertical',
		reverse: false,
		duration: 0.8,
		initialOpacity: 0,
		animateOpacity: true,
		scale: 1,
		threshold: 0.1,
		delay: 0
	};

	let distance = DEFAULTS.distance;
	let direction = DEFAULTS.direction;
	let reverse = DEFAULTS.reverse;
	let duration = DEFAULTS.duration;
	let initialOpacity = DEFAULTS.initialOpacity;
	let animateOpacity = DEFAULTS.animateOpacity;
	let scale = DEFAULTS.scale;
	let threshold = DEFAULTS.threshold;
	let delay = DEFAULTS.delay;

	// remount key to replay animation when props change
	let replay = 0;

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => distance !== DEFAULTS.distance || direction !== DEFAULTS.direction || reverse !== DEFAULTS.reverse || duration !== DEFAULTS.duration || initialOpacity !== DEFAULTS.initialOpacity || animateOpacity !== DEFAULTS.animateOpacity || scale !== DEFAULTS.scale || threshold !== DEFAULTS.threshold || delay !== DEFAULTS.delay);

	function reset() {
		distance = DEFAULTS.distance;
		direction = DEFAULTS.direction;
		reverse = DEFAULTS.reverse;
		duration = DEFAULTS.duration;
		initialOpacity = DEFAULTS.initialOpacity;
		animateOpacity = DEFAULTS.animateOpacity;
		scale = DEFAULTS.scale;
		threshold = DEFAULTS.threshold;
		delay = DEFAULTS.delay;
		replay += 1;
	}

	const usage = $.derived(() => `${scriptOpen}
  import AnimatedContent from '$lib/components/AnimatedContent.svelte';
${scriptClose}

<AnimatedContent
  distance={${distance}}
  direction="${direction}"
  reverse={${reverse}}
  duration={${duration}}
  initialOpacity={${initialOpacity}}
  animateOpacity={${animateOpacity}}
  scale={${scale}}
  threshold={${threshold}}
  delay={${delay}}
>
  <p>Animate me!</p>
</AnimatedContent>`);

	const props = [
		{
			name: 'distance',
			type: 'number',
			default: '100',
			description: 'Distance (px) the element travels.'
		},

		{
			name: 'direction',
			type: "'vertical' | 'horizontal'",
			default: '"vertical"',
			description: 'Movement axis.'
		},

		{
			name: 'reverse',
			type: 'boolean',
			default: 'false',
			description: 'Inverts the start direction.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '0.8',
			description: 'Animation duration in seconds.'
		},

		{
			name: 'easing',
			type: 'string',
			default: '"cubic-bezier(0.16, 1, 0.3, 1)"',
			description: 'CSS easing function.'
		},

		{
			name: 'initialOpacity',
			type: 'number',
			default: '0',
			description: 'Starting opacity (0–1).'
		},

		{
			name: 'animateOpacity',
			type: 'boolean',
			default: 'true',
			description: 'Whether opacity is animated.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Starting scale.'
		},

		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'IntersectionObserver threshold to trigger.'
		},

		{
			name: 'delay',
			type: 'number',
			default: '0',
			description: 'Delay before animation (seconds).'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		}
	];

	$.head('tft7ju', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Animated Content - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Animated Content</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				AnimatedContent($$renderer, {
					distance,
					direction,
					reverse,
					duration,
					initialOpacity,
					animateOpacity,
					scale,
					threshold,
					delay,
					children: ($$renderer) => {
						$$renderer.push(`<div style="padding:1.2em 2em;border-radius:14px;border:1px solid var(--border-primary);background:var(--bg-elevated);color:var(--text-primary);font-size:1.1rem;font-weight:600;">Animate me!</div>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'animated-content', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Distance',
						min: 0,
						max: 400,
						step: 10,
						value: distance,
						valueUnit: 'px',
						onChange: (v) => distance = v
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Direction',
						options: [
							{ label: 'Vertical', value: 'vertical' },
							{ label: 'Horizontal', value: 'horizontal' }
						],
						value: direction,
						onChange: (v) => direction = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Duration',
						min: 0.1,
						max: 3,
						step: 0.1,
						value: duration,
						valueUnit: 's',
						onChange: (v) => duration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Delay',
						min: 0,
						max: 2,
						step: 0.05,
						value: delay,
						valueUnit: 's',
						onChange: (v) => delay = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Initial Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						value: initialOpacity,
						onChange: (v) => initialOpacity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scale',
						min: 0.5,
						max: 2,
						step: 0.05,
						value: scale,
						onChange: (v) => scale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Threshold',
						min: 0,
						max: 1,
						step: 0.05,
						value: threshold,
						onChange: (v) => threshold = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Reverse',
						checked: reverse,
						onChange: (v) => reverse = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Animate Opacity',
						checked: animateOpacity,
						onChange: (v) => animateOpacity = v
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		function propTable($$renderer) {
			PropTable($$renderer, { rows: props });
		}

		TabsLayout($$renderer, {
			onreset: reset,
			hasChanges: hasChanges(),
			componentName: 'AnimatedContent',
			usage: usage(),
			source,
			props,
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$$renderer.push(`<!---->`);
}