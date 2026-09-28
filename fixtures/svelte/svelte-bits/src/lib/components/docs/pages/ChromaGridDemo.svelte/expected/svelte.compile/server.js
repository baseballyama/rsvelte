import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ChromaGrid from '$lib/components/library/Components/ChromaGrid/ChromaGrid.svelte';
import source from '$lib/components/library/Components/ChromaGrid/ChromaGrid.svelte?raw';

export default function ChromaGridDemo($$renderer) {
	const DEFAULTS = { radius: 300, damping: 0.45, fadeOut: 0.6 };
	let radius = DEFAULTS.radius;
	let damping = DEFAULTS.damping;
	let fadeOut = DEFAULTS.fadeOut;
	let key = 0;
	const hasChanges = $.derived(() => radius !== DEFAULTS.radius || damping !== DEFAULTS.damping || fadeOut !== DEFAULTS.fadeOut);

	function reset() {
		radius = DEFAULTS.radius;
		damping = DEFAULTS.damping;
		fadeOut = DEFAULTS.fadeOut;
		key++;
	}

	const usage = $.derived(() => `<ChromaGrid radius={${radius}} damping={${damping}} fadeOut={${fadeOut}} />`);

	const props = [
		{
			name: 'items',
			type: 'ChromaItem[]',
			default: '6 demo cards',
			description: 'Cards to render.'
		},

		{
			name: 'radius',
			type: 'number',
			default: '300',
			description: 'Spotlight radius (px).'
		},

		{
			name: 'damping',
			type: 'number',
			default: '0.45',
			description: 'GSAP follow duration.'
		},

		{
			name: 'fadeOut',
			type: 'number',
			default: '0.6',
			description: 'Fade-back duration on leave.'
		},

		{
			name: 'ease',
			type: 'string',
			default: '"power3.out"',
			description: 'GSAP easing.'
		}
	];

	$.head('r7esrg', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Chroma Grid - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Chroma Grid</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;min-height:600px;padding:1.5rem;"><!---->`);

			{
				ChromaGrid($$renderer, { radius, damping, fadeOut });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'chroma-grid', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Radius',
						min: 50,
						max: 600,
						step: 10,
						value: radius,
						onChange: (v) => {
							radius = v;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Damping',
						min: 0,
						max: 2,
						step: 0.05,
						value: damping,
						onChange: (v) => {
							damping = v;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fade Out',
						min: 0,
						max: 2,
						step: 0.05,
						value: fadeOut,
						onChange: (v) => {
							fadeOut = v;
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
			componentName: 'ChromaGrid',
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