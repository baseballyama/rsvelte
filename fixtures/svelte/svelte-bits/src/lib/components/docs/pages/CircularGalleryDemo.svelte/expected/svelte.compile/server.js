import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import CircularGallery from '$lib/components/library/Components/CircularGallery/CircularGallery.svelte';
import source from '$lib/components/library/Components/CircularGallery/CircularGallery.svelte?raw';

export default function CircularGalleryDemo($$renderer) {
	const DEFAULTS = {
		bend: 1,
		borderRadius: 0.05,
		scrollSpeed: 2,
		scrollEase: 0.05
	};

	let bend = DEFAULTS.bend;
	let borderRadius = DEFAULTS.borderRadius;
	let scrollSpeed = DEFAULTS.scrollSpeed;
	let scrollEase = DEFAULTS.scrollEase;
	let key = 0;
	const hasChanges = $.derived(() => bend !== DEFAULTS.bend || borderRadius !== DEFAULTS.borderRadius || scrollSpeed !== DEFAULTS.scrollSpeed || scrollEase !== DEFAULTS.scrollEase);

	function reset() {
		bend = DEFAULTS.bend;
		borderRadius = DEFAULTS.borderRadius;
		scrollSpeed = DEFAULTS.scrollSpeed;
		scrollEase = DEFAULTS.scrollEase;
		key++;
	}

	const usage = `<CircularGallery bend={3} borderRadius={0.05} />`;

	const props = [
		{
			name: 'items',
			type: 'Array<{image, text}>',
			default: '12 placeholder items',
			description: 'Gallery items.'
		},

		{
			name: 'bend',
			type: 'number',
			default: '3',
			description: 'Curvature of the layout.'
		},

		{
			name: 'textColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Title color.'
		},

		{
			name: 'borderRadius',
			type: 'number',
			default: '0.05',
			description: 'Image corner radius.'
		},

		{
			name: 'font',
			type: 'string',
			default: 'bold 30px Figtree',
			description: 'Title font.'
		},

		{
			name: 'scrollSpeed',
			type: 'number',
			default: '2',
			description: 'Scroll velocity multiplier.'
		},

		{
			name: 'scrollEase',
			type: 'number',
			default: '0.05',
			description: 'Smoothing factor.'
		}
	];

	$.head('1cumo4b', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Circular Gallery - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Circular Gallery</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:400px;padding:0;overflow:hidden;"><!---->`);

			{
				CircularGallery($$renderer, { bend, borderRadius, scrollSpeed, scrollEase });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'circular-gallery', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Bend Level',
						min: -10,
						max: 10,
						step: 1,
						value: bend,
						onChange: (v) => {
							bend = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Border Radius',
						min: 0,
						max: 0.5,
						step: 0.01,
						value: borderRadius,
						onChange: (v) => {
							borderRadius = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scroll Speed',
						min: 0.5,
						max: 5,
						step: 0.1,
						value: scrollSpeed,
						onChange: (v) => {
							scrollSpeed = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scroll Ease',
						min: 0.01,
						max: 0.5,
						step: 0.01,
						value: scrollEase,
						onChange: (v) => {
							scrollEase = v;
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
			componentName: 'CircularGallery',
			usage,
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