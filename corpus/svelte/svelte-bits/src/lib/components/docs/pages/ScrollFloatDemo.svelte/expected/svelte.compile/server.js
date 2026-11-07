import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import ScrollFloat from '$lib/components/library/TextAnimations/ScrollFloat/ScrollFloat.svelte';
import source from '$lib/components/library/TextAnimations/ScrollFloat/ScrollFloat.svelte?raw';

export default function ScrollFloatDemo($$renderer) {
	const DEFAULTS = {
		children: 'Smooth Scroll Floating',
		animationDuration: 1,
		stagger: 0.03,
		ease: 'back.inOut(2)'
	};

	let children = DEFAULTS.children;
	let animationDuration = DEFAULTS.animationDuration;
	let stagger = DEFAULTS.stagger;
	let ease = DEFAULTS.ease;
	let replay = 0;
	let containerRef = null;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => children !== DEFAULTS.children || animationDuration !== DEFAULTS.animationDuration || stagger !== DEFAULTS.stagger || ease !== DEFAULTS.ease);

	function reset() {
		children = DEFAULTS.children;
		animationDuration = DEFAULTS.animationDuration;
		stagger = DEFAULTS.stagger;
		ease = DEFAULTS.ease;
		replay++;
	}

	const usage = $.derived(() => `${scriptOpen}
  import ScrollFloat from '$lib/components/ScrollFloat.svelte';
${scriptClose}

<div class="h-[200vh]">
  <ScrollFloat
    children="${children}"
    animationDuration={${animationDuration}}
    stagger={${stagger}}
    ease="${ease}"
  />
</div>`);

	const props = [
		{
			name: 'children',
			type: 'string',
			default: '""',
			description: 'Text to animate.'
		},

		{
			name: 'scrollContainer',
			type: 'HTMLElement | null',
			default: 'window',
			description: 'Optional scrolling element used by ScrollTrigger.'
		},

		{
			name: 'containerClass',
			type: 'string',
			default: '""',
			description: 'Classes applied to the outer heading element.'
		},

		{
			name: 'textClass',
			type: 'string',
			default: '""',
			description: 'Classes applied to the inner text wrapper.'
		},

		{
			name: 'animationDuration',
			type: 'number',
			default: '1',
			description: 'GSAP tween duration for each character.'
		},

		{
			name: 'ease',
			type: 'string',
			default: '"back.inOut(2)"',
			description: 'GSAP easing string.'
		},

		{
			name: 'scrollStart',
			type: 'string',
			default: '"center bottom+=50%"',
			description: 'ScrollTrigger start position.'
		},

		{
			name: 'scrollEnd',
			type: 'string',
			default: '"bottom bottom-=40%"',
			description: 'ScrollTrigger end position.'
		},

		{
			name: 'stagger',
			type: 'number',
			default: '0.03',
			description: 'Delay between each character animation.'
		}
	];

	$.head('4msltz', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Scroll Float - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Scroll Float</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container relative h-[450px] w-full overflow-y-auto border border-white/10 bg-neutral-950 pt-[300px]" style="overscroll-behavior: contain;">`);
			ReplayButton($$renderer, { onClick: () => replay++ });
			$$renderer.push(`<!----> <!---->`);

			{
				ScrollFloat($$renderer, {
					children,
					animationDuration,
					stagger,
					ease,
					scrollContainer: containerRef,
					containerClass: 'text-5xl font-black text-center'
				});
			}

			$$renderer.push(`<!----> <div class="h-[600px] w-full shrink-0"></div></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'scroll-float', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Duration',
						min: 0.1,
						max: 3,
						step: 0.1,
						value: animationDuration,
						onChange: (v) => {
							animationDuration = v;
							replay++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Stagger',
						min: 0.01,
						max: 0.2,
						step: 0.01,
						value: stagger,
						onChange: (v) => {
							stagger = v;
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
			componentName: 'ScrollFloat',
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