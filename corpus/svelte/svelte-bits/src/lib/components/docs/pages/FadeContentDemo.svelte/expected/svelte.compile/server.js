import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import FadeContent from '$lib/components/library/Animations/FadeContent/FadeContent.svelte';
import fadeContentSource from '$lib/components/library/Animations/FadeContent/FadeContent.svelte?raw';

export default function FadeContentDemo($$renderer) {
	const DEFAULTS = {
		blur: false,
		duration: 1000,
		delay: 0,
		threshold: 0.1,
		initialOpacity: 0
	};

	let blur = DEFAULTS.blur;
	let duration = DEFAULTS.duration;
	let delay = DEFAULTS.delay;
	let threshold = DEFAULTS.threshold;
	let initialOpacity = DEFAULTS.initialOpacity;
	let replay = 0;
	const hasChanges = $.derived(() => blur !== DEFAULTS.blur || duration !== DEFAULTS.duration || delay !== DEFAULTS.delay || threshold !== DEFAULTS.threshold || initialOpacity !== DEFAULTS.initialOpacity);

	function reset() {
		blur = DEFAULTS.blur;
		duration = DEFAULTS.duration;
		delay = DEFAULTS.delay;
		threshold = DEFAULTS.threshold;
		initialOpacity = DEFAULTS.initialOpacity;
		replay++;
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import FadeContent from '$lib/components/FadeContent.svelte';
${'</' + 'script>'}

<FadeContent
  blur={${blur}}
  duration={${duration}}
  delay={${delay}}
  threshold={${threshold}}
  initialOpacity={${initialOpacity}}
>
  <p>Fade me in!</p>
</FadeContent>`);

	const props = [
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Content to fade in.'
		},

		{
			name: 'blur',
			type: 'boolean',
			default: 'false',
			description: 'Whether to also animate a 10px blur on entrance.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '1000',
			description: 'Animation duration; values >10 are treated as ms, otherwise seconds.'
		},

		{
			name: 'ease',
			type: 'string',
			default: '"power2.out"',
			description: 'GSAP easing string.'
		},

		{
			name: 'delay',
			type: 'number',
			default: '0',
			description: 'Delay before animation starts; values >10 treated as ms.'
		},

		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'IntersectionObserver-style trigger threshold.'
		},

		{
			name: 'initialOpacity',
			type: 'number',
			default: '0',
			description: 'Starting opacity (0–1).'
		},

		{
			name: 'disappearAfter',
			type: 'number',
			default: '0',
			description: 'If >0, fades back out after this duration once entrance completes.'
		},

		{
			name: 'disappearDuration',
			type: 'number',
			default: '0.5',
			description: 'Duration of the disappear tween.'
		},

		{
			name: 'disappearEase',
			type: 'string',
			default: '"power2.in"',
			description: 'GSAP easing for the disappear tween.'
		},

		{
			name: 'onComplete',
			type: '() => void',
			default: 'undefined',
			description: 'Fires when the entrance animation completes.'
		},

		{
			name: 'onDisappearanceComplete',
			type: '() => void',
			default: 'undefined',
			description: 'Fires when the optional disappear animation completes.'
		},

		{
			name: 'container',
			type: 'Element | string | null',
			default: 'null',
			description: 'Optional scroller (selector or element) for ScrollTrigger.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the wrapper.'
		}
	];

	$.head('1lzvibx', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Fade Content - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Fade Content</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				FadeContent($$renderer, {
					blur,
					duration,
					delay,
					threshold,
					initialOpacity,
					children: ($$renderer) => {
						$$renderer.push(`<div style="padding:1.2em 2em;border-radius:14px;border:1px solid var(--border-primary);background:var(--bg-elevated);color:var(--text-primary);font-size:1.1rem;font-weight:600;">Fade me in!</div>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, {
				slug: 'fade-content',
				usage: usage(),
				source: fadeContentSource
			});
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSwitch($$renderer, {
						title: 'Blur',
						checked: blur,
						onChange: (v) => {
							blur = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Duration',
						min: 100,
						max: 3000,
						step: 50,
						value: duration,
						valueUnit: 'ms',
						onChange: (v) => duration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Delay',
						min: 0,
						max: 2000,
						step: 50,
						value: delay,
						valueUnit: 'ms',
						onChange: (v) => delay = v
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

					PreviewSlider($$renderer, {
						title: 'Initial Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						value: initialOpacity,
						onChange: (v) => initialOpacity = v
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
			componentName: 'FadeContent',
			usage: usage(),
			source: fadeContentSource,
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