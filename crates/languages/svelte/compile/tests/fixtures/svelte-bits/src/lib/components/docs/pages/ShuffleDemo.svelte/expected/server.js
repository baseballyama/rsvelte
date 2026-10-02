import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import Shuffle from '$lib/components/library/TextAnimations/Shuffle/Shuffle.svelte';
import source from '$lib/components/library/TextAnimations/Shuffle/Shuffle.svelte?raw';

export default function ShuffleDemo($$renderer) {
	const DEFAULTS = {
		duration: 0.35,
		shuffleTimes: 1,
		stagger: 0.03,
		shuffleDirection: 'right',
		ease: 'power3.out',
		loop: false,
		loopDelay: 0,
		triggerOnHover: true
	};

	let duration = DEFAULTS.duration;
	let shuffleTimes = DEFAULTS.shuffleTimes;
	let stagger = DEFAULTS.stagger;
	let shuffleDirection = DEFAULTS.shuffleDirection;
	let ease = DEFAULTS.ease;
	let loop = DEFAULTS.loop;
	let loopDelay = DEFAULTS.loopDelay;
	let triggerOnHover = DEFAULTS.triggerOnHover;
	let replay = 0;
	const hasChanges = $.derived(() => duration !== DEFAULTS.duration || shuffleTimes !== DEFAULTS.shuffleTimes || stagger !== DEFAULTS.stagger || shuffleDirection !== DEFAULTS.shuffleDirection || ease !== DEFAULTS.ease || loop !== DEFAULTS.loop || loopDelay !== DEFAULTS.loopDelay || triggerOnHover !== DEFAULTS.triggerOnHover);

	function reset() {
		duration = DEFAULTS.duration;
		shuffleTimes = DEFAULTS.shuffleTimes;
		stagger = DEFAULTS.stagger;
		shuffleDirection = DEFAULTS.shuffleDirection;
		ease = DEFAULTS.ease;
		loop = DEFAULTS.loop;
		loopDelay = DEFAULTS.loopDelay;
		triggerOnHover = DEFAULTS.triggerOnHover;
		replay++;
	}

	const usage = $.derived(() => `<Shuffle
  text="SVELTE BITS"
  shuffleDirection="${shuffleDirection}"
  duration={${duration}}
  shuffleTimes={${shuffleTimes}}
  stagger={${stagger}}
  ease="${ease}"
  loop={${loop}}
  loopDelay={${loopDelay}}
  triggerOnHover={${triggerOnHover}}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text content to shuffle.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Optional CSS class for the wrapper element.'
		},

		{
			name: 'style',
			type: 'string',
			default: '""',
			description: 'Inline styles applied to the wrapper element.'
		},

		{
			name: 'shuffleDirection',
			type: '"left" | "right" | "up" | "down"',
			default: '"right"',
			description: 'Direction the per-letter strip slides to reveal the final character.'
		},

		{
			name: 'duration',
			type: 'number',
			default: '0.35',
			description: 'Duration (s) of the strip slide per letter.'
		},

		{
			name: 'maxDelay',
			type: 'number',
			default: '0',
			description: 'Max random delay per strip when animationMode = "random".'
		},

		{
			name: 'ease',
			type: 'string | Function',
			default: '"power3.out"',
			description: 'GSAP ease for sliding and color tween.'
		},

		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'Portion of the element that must enter view before starting.'
		},

		{
			name: 'rootMargin',
			type: 'string',
			default: '"-100px"',
			description: 'ScrollTrigger start offset (px, %, etc.).'
		},

		{
			name: 'tag',
			type: '"h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"',
			default: '"p"',
			description: 'HTML tag to render for the text container.'
		},

		{
			name: 'textAlign',
			type: 'string',
			default: '"center"',
			description: 'Text alignment applied via inline style.'
		},

		{
			name: 'onShuffleComplete',
			type: '() => void',
			default: 'undefined',
			description: 'Called after a full run completes (and on each loop repeat).'
		},

		{
			name: 'shuffleTimes',
			type: 'number',
			default: '1',
			description: 'How many interim scrambled glyphs to scroll past before the final char.'
		},

		{
			name: 'animationMode',
			type: '"evenodd" | "random"',
			default: '"evenodd"',
			description: 'Odd/even staggered strips or random per-strip delays.'
		},

		{
			name: 'loop',
			type: 'boolean',
			default: 'false',
			description: 'Repeat the shuffle indefinitely.'
		},

		{
			name: 'loopDelay',
			type: 'number',
			default: '0',
			description: 'Delay (s) between loop repeats.'
		},

		{
			name: 'stagger',
			type: 'number',
			default: '0.03',
			description: 'Stagger (s) for strips in "evenodd" mode.'
		},

		{
			name: 'scrambleCharset',
			type: 'string',
			default: '""',
			description: 'Characters to use for interim scrambles; empty keeps original copies.'
		},

		{
			name: 'colorFrom',
			type: 'string',
			default: 'undefined',
			description: 'Optional starting text color while shuffling.'
		},

		{
			name: 'colorTo',
			type: 'string',
			default: 'undefined',
			description: 'Optional final text color to tween to.'
		},

		{
			name: 'triggerOnce',
			type: 'boolean',
			default: 'true',
			description: 'Auto-run only on first scroll into view.'
		},

		{
			name: 'respectReducedMotion',
			type: 'boolean',
			default: 'true',
			description: 'Skip animation if user prefers reduced motion.'
		},

		{
			name: 'triggerOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Allow re-playing the animation on hover after it completes.'
		}
	];

	const directionOptions = [
		{ label: 'Right', value: 'right' },
		{ label: 'Left', value: 'left' },
		{ label: 'Up', value: 'up' },
		{ label: 'Down', value: 'down' }
	];

	const easeOptions = [
		{ label: 'power2.out', value: 'power2.out' },
		{ label: 'power3.out', value: 'power3.out' },
		{ label: 'back.out(1.1)', value: 'back.out(1.1)' },
		{ label: 'expo.out', value: 'expo.out' }
	];

	$.head('1tchaon', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Shuffle - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Shuffle</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container relative flex min-h-[400px] w-full items-center justify-center overflow-hidden">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				Shuffle($$renderer, {
					text: 'SVELTE BITS',
					ease,
					duration,
					shuffleTimes,
					stagger,
					shuffleDirection,
					loop,
					loopDelay,
					triggerOnHover
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'shuffle', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Direction',
						options: directionOptions,
						value: shuffleDirection,
						onChange: (v) => {
							shuffleDirection = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Ease',
						options: easeOptions,
						value: ease,
						onChange: (v) => {
							ease = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Duration',
						min: 0.1,
						max: 1.5,
						step: 0.05,
						value: duration,
						valueUnit: 's',
						onChange: (v) => {
							duration = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Shuffle Times',
						min: 1,
						max: 8,
						step: 1,
						value: shuffleTimes,
						onChange: (v) => {
							shuffleTimes = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Stagger',
						min: 0,
						max: 0.2,
						step: 0.01,
						value: stagger,
						valueUnit: 's',
						onChange: (v) => {
							stagger = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Hover Replay',
						checked: triggerOnHover,
						onChange: (v) => {
							triggerOnHover = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Loop',
						checked: loop,
						onChange: (v) => {
							loop = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Loop Delay',
						min: 0,
						max: 2,
						step: 0.1,
						value: loopDelay,
						isDisabled: !loop,
						valueUnit: 's',
						onChange: (v) => {
							loopDelay = v;
							replay++;
						}
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
			componentName: 'Shuffle',
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