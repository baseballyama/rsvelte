import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import BlurText from '$lib/components/library/TextAnimations/BlurText/BlurText.svelte';
import blurTextSource from '$lib/components/library/TextAnimations/BlurText/BlurText.svelte?raw';

export default function BlurTextDemo($$renderer) {
	const DEFAULTS = {
		text: 'Isn\u2019t this so cool?!',
		delay: 200,
		animateBy: 'words',
		direction: 'top',
		threshold: 0.1,
		stepDuration: 0.35
	};

	let text = DEFAULTS.text;
	let delay = DEFAULTS.delay;
	let animateBy = DEFAULTS.animateBy;
	let direction = DEFAULTS.direction;
	let threshold = DEFAULTS.threshold;
	let stepDuration = DEFAULTS.stepDuration;
	let replay = 0;
	const hasChanges = $.derived(() => text !== DEFAULTS.text || delay !== DEFAULTS.delay || animateBy !== DEFAULTS.animateBy || direction !== DEFAULTS.direction || threshold !== DEFAULTS.threshold || stepDuration !== DEFAULTS.stepDuration);

	function reset() {
		text = DEFAULTS.text;
		delay = DEFAULTS.delay;
		animateBy = DEFAULTS.animateBy;
		direction = DEFAULTS.direction;
		threshold = DEFAULTS.threshold;
		stepDuration = DEFAULTS.stepDuration;
		replay++;
	}

	const usage = $.derived(() => `${'<' + 'script lang="ts">'}
  import BlurText from '$lib/components/BlurText.svelte';
${'</' + 'script>'}

<BlurText
  text="${text}"
  delay={${delay}}
  animateBy="${animateBy}"
  direction="${direction}"
  threshold={${threshold}}
  stepDuration={${stepDuration}}
  onAnimationComplete={() => console.log('done')}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text to animate.'
		},

		{
			name: 'delay',
			type: 'number',
			default: '200',
			description: 'Per-segment stagger in milliseconds.'
		},

		{
			name: 'animateBy',
			type: "'words' | 'letters'",
			default: '"words"',
			description: 'Whether to animate one segment per word or per letter.'
		},

		{
			name: 'direction',
			type: "'top' | 'bottom'",
			default: '"top"',
			description: 'Direction segments enter from.'
		},

		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'IntersectionObserver threshold to trigger.'
		},

		{
			name: 'rootMargin',
			type: 'string',
			default: '"0px"',
			description: 'IntersectionObserver root margin.'
		},

		{
			name: 'animationFrom',
			type: 'Record<string, string | number>',
			default: 'undefined',
			description: 'Override the initial keyframe.'
		},

		{
			name: 'animationTo',
			type: 'Array<Record<string, string | number>>',
			default: 'undefined',
			description: 'Override the array of intermediate/final keyframes.'
		},

		{
			name: 'easing',
			type: 'Easing',
			default: '(t) => t',
			description: 'Easing function or array passed through to motion.'
		},

		{
			name: 'stepDuration',
			type: 'number',
			default: '0.35',
			description: 'Duration of each keyframe step in seconds.'
		},

		{
			name: 'onAnimationComplete',
			type: '() => void',
			default: 'undefined',
			description: 'Fires when the last segment finishes.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the paragraph wrapper.'
		}
	];

	$.head('gz8ugk', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Blur Text - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Blur Text</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div style="position:relative;min-height:400px;display:flex;align-items:center;justify-content:center;width:100%;font-size:48px;font-weight:700;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				BlurText($$renderer, { text, delay, animateBy, direction, threshold, stepDuration });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'blur-text', usage: usage(), source: blurTextSource });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Delay',
						min: 0,
						max: 1000,
						step: 10,
						value: delay,
						valueUnit: 'ms',
						onChange: (v) => delay = v
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Animate By',
						options: [
							{ label: 'Words', value: 'words' },
							{ label: 'Letters', value: 'letters' }
						],
						value: animateBy,
						onChange: (v) => {
							animateBy = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Direction',
						options: [
							{ label: 'Top', value: 'top' },
							{ label: 'Bottom', value: 'bottom' }
						],
						value: direction,
						onChange: (v) => {
							direction = v;
							replay++;
						}
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
						title: 'Step Duration',
						min: 0.1,
						max: 1.5,
						step: 0.05,
						value: stepDuration,
						valueUnit: 's',
						onChange: (v) => stepDuration = v
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
			componentName: 'BlurText',
			usage: usage(),
			source: blurTextSource,
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