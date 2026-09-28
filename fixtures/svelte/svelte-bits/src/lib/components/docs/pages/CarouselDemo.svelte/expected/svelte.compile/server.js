import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Carousel from '$lib/components/library/Components/Carousel/Carousel.svelte';
import source from '$lib/components/library/Components/Carousel/Carousel.svelte?raw';

export default function CarouselDemo($$renderer) {
	const DEFAULTS = {
		baseWidth: 300,
		autoplay: true,
		autoplayDelay: 3000,
		pauseOnHover: true,
		loop: true,
		round: false
	};

	let baseWidth = DEFAULTS.baseWidth;
	let autoplay = DEFAULTS.autoplay;
	let autoplayDelay = DEFAULTS.autoplayDelay;
	let pauseOnHover = DEFAULTS.pauseOnHover;
	let loop = DEFAULTS.loop;
	let round = DEFAULTS.round;
	let key = 0;
	const hasChanges = $.derived(() => baseWidth !== DEFAULTS.baseWidth || autoplay !== DEFAULTS.autoplay || autoplayDelay !== DEFAULTS.autoplayDelay || pauseOnHover !== DEFAULTS.pauseOnHover || loop !== DEFAULTS.loop || round !== DEFAULTS.round);

	function reset() {
		baseWidth = DEFAULTS.baseWidth;
		autoplay = DEFAULTS.autoplay;
		autoplayDelay = DEFAULTS.autoplayDelay;
		pauseOnHover = DEFAULTS.pauseOnHover;
		loop = DEFAULTS.loop;
		round = DEFAULTS.round;
		key++;
	}

	const usage = $.derived(() => `<Carousel baseWidth={${baseWidth}} autoplay={${autoplay}} autoplayDelay={${autoplayDelay}} pauseOnHover={${pauseOnHover}} loop={${loop}} round={${round}} />`);

	const props = [
		{
			name: 'items',
			type: 'CarouselItem[]',
			default: '5 default items',
			description: 'Items to display.'
		},

		{
			name: 'baseWidth',
			type: 'number',
			default: '300',
			description: 'Carousel width in px.'
		},

		{
			name: 'autoplay',
			type: 'boolean',
			default: 'false',
			description: 'Auto-advance through items.'
		},

		{
			name: 'autoplayDelay',
			type: 'number',
			default: '3000',
			description: 'Delay between autoplay steps (ms).'
		},

		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Pause autoplay on hover.'
		},

		{
			name: 'loop',
			type: 'boolean',
			default: 'false',
			description: 'Wrap around at edges.'
		},

		{
			name: 'round',
			type: 'boolean',
			default: 'false',
			description: 'Render in a circular frame.'
		}
	];

	$.head('14af3gg', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Carousel - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Carousel</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:500px;"><!---->`);

			{
				Carousel($$renderer, {
					baseWidth,
					autoplay,
					autoplayDelay,
					pauseOnHover,
					loop,
					round
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'carousel', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Base Width',
						min: 200,
						max: 600,
						step: 10,
						value: baseWidth,
						onChange: (v) => {
							baseWidth = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Autoplay',
						checked: autoplay,
						onChange: (v) => {
							autoplay = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Autoplay Delay (ms)',
						min: 500,
						max: 8000,
						step: 100,
						value: autoplayDelay,
						onChange: (v) => {
							autoplayDelay = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Pause on Hover',
						checked: pauseOnHover,
						onChange: (v) => {
							pauseOnHover = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Loop',
						checked: loop,
						onChange: (v) => {
							loop = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Round',
						checked: round,
						onChange: (v) => {
							round = v;
							key++;
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
			componentName: 'Carousel',
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