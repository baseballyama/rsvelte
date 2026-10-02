import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
import ScrollReveal from '$lib/components/library/TextAnimations/ScrollReveal/ScrollReveal.svelte';
import source from '$lib/components/library/TextAnimations/ScrollReveal/ScrollReveal.svelte?raw';

export default function ScrollRevealDemo($$renderer) {
	const DEFAULTS = {
		enableBlur: true,
		baseOpacity: 0.1,
		baseRotation: 3,
		blurStrength: 4
	};

	let enableBlur = DEFAULTS.enableBlur;
	let baseOpacity = DEFAULTS.baseOpacity;
	let baseRotation = DEFAULTS.baseRotation;
	let blurStrength = DEFAULTS.blurStrength;
	let replay = 0;
	let scrollEl = void 0;
	const hasChanges = $.derived(() => enableBlur !== DEFAULTS.enableBlur || baseOpacity !== DEFAULTS.baseOpacity || baseRotation !== DEFAULTS.baseRotation || blurStrength !== DEFAULTS.blurStrength);

	function reset() {
		enableBlur = DEFAULTS.enableBlur;
		baseOpacity = DEFAULTS.baseOpacity;
		baseRotation = DEFAULTS.baseRotation;
		blurStrength = DEFAULTS.blurStrength;
		scrollEl?.scrollTo({ top: 0, behavior: 'smooth' });
		replay++;
	}

	function rerender() {
		scrollEl?.scrollTo({ top: 0, behavior: 'smooth' });
		replay++;
	}

	const usage = $.derived(() => `<ScrollReveal
  text="When does a man die? When he is hit by a bullet? No! When he suffers a disease? No! When he ate a soup made out of a poisonous mushroom? No! A man dies when he is forgotten!"
  enableBlur={${enableBlur}}
  baseOpacity={${baseOpacity}}
  baseRotation={${baseRotation}}
  blurStrength={${blurStrength}}
/>`);

	const props = [
		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text to be split into words and animated.'
		},

		{
			name: 'scrollContainer',
			type: 'HTMLElement | null',
			default: 'null',
			description: 'Optional element used as the scroll container; defaults to window.'
		},

		{
			name: 'enableBlur',
			type: 'boolean',
			default: 'true',
			description: 'Enables the blur animation on the words.'
		},

		{
			name: 'baseOpacity',
			type: 'number',
			default: '0.1',
			description: 'Initial opacity of the words before the animation.'
		},

		{
			name: 'baseRotation',
			type: 'number',
			default: '3',
			description: 'Starting rotation in degrees, easing back to 0.'
		},

		{
			name: 'blurStrength',
			type: 'number',
			default: '4',
			description: 'Strength of the blur in pixels at the start of the animation.'
		},

		{
			name: 'containerClassName',
			type: 'string',
			default: '""',
			description: 'Additional class on the container element.'
		},

		{
			name: 'textClassName',
			type: 'string',
			default: '""',
			description: 'Additional class on the text element.'
		},

		{
			name: 'rotationEnd',
			type: 'string',
			default: '"bottom bottom"',
			description: 'ScrollTrigger end value for the rotation tween.'
		},

		{
			name: 'wordAnimationEnd',
			type: 'string',
			default: '"bottom bottom"',
			description: 'ScrollTrigger end value for the word fade/blur tweens.'
		}
	];

	$.head('bcq5um', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Scroll Reveal - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Scroll Reveal</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container relative w-full" style="height:400px;max-height:400px;overflow-y:scroll;overflow-x:hidden;">`);
			ReplayButton($$renderer, { onClick: rerender });
			$$renderer.push(`<!----> <div style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);color:#2F293A;font-size:clamp(4rem, 6vw, 4rem);font-weight:900;text-align:center;pointer-events:none;">Scroll Down</div> <div style="position:relative;padding-top:1600px;padding-bottom:600px;padding-left:3rem;padding-right:3rem;"><!---->`);

			{
				ScrollReveal($$renderer, {
					text: 'When does a man die? When he is hit by a bullet? No! When he suffers a disease? No! When he ate a soup made out of a poisonous mushroom? No! A man dies when he is forgotten!',
					scrollContainer: scrollEl,
					enableBlur,
					baseOpacity,
					baseRotation,
					blurStrength
				});
			}

			$$renderer.push(`<!----></div></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'scroll-reveal', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSwitch($$renderer, {
						title: 'Enable Blur',
						checked: enableBlur,
						onChange: (v) => {
							enableBlur = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Blur Strength',
						min: 0,
						max: 15,
						step: 1,
						value: blurStrength,
						onChange: (v) => {
							blurStrength = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Starting Opacity',
						min: 0,
						max: 1,
						step: 0.1,
						value: baseOpacity,
						onChange: (v) => {
							baseOpacity = v;
							rerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Starting Rotation',
						min: 0,
						max: 10,
						step: 1,
						value: baseRotation,
						valueUnit: '°',
						onChange: (v) => {
							baseRotation = v;
							rerender();
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
			componentName: 'ScrollReveal',
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