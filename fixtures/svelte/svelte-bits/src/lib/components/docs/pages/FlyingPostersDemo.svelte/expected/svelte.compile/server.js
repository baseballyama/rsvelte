import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import FlyingPosters from '$lib/components/library/Components/FlyingPosters/FlyingPosters.svelte';
import source from '$lib/components/library/Components/FlyingPosters/FlyingPosters.svelte?raw';

export default function FlyingPostersDemo($$renderer) {
	const items = [
		'https://picsum.photos/500/500?grayscale',
		'https://picsum.photos/600/600?grayscale',
		'https://picsum.photos/400/400?grayscale'
	];

	const DEFAULTS = {
		planeWidth: 320,
		planeHeight: 320,
		distortion: 3,
		scrollEase: 0.01,
		cameraFov: 45,
		cameraZ: 20
	};

	let planeWidth = DEFAULTS.planeWidth;
	let planeHeight = DEFAULTS.planeHeight;
	let distortion = DEFAULTS.distortion;
	let scrollEase = DEFAULTS.scrollEase;
	let cameraFov = DEFAULTS.cameraFov;
	let cameraZ = DEFAULTS.cameraZ;
	let renderKey = 0;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	function forceRerender() {
		renderKey += 1;
	}

	const hasChanges = $.derived(() => planeWidth !== DEFAULTS.planeWidth || planeHeight !== DEFAULTS.planeHeight || distortion !== DEFAULTS.distortion || scrollEase !== DEFAULTS.scrollEase || cameraFov !== DEFAULTS.cameraFov || cameraZ !== DEFAULTS.cameraZ);

	function reset() {
		planeWidth = DEFAULTS.planeWidth;
		planeHeight = DEFAULTS.planeHeight;
		distortion = DEFAULTS.distortion;
		scrollEase = DEFAULTS.scrollEase;
		cameraFov = DEFAULTS.cameraFov;
		cameraZ = DEFAULTS.cameraZ;
		forceRerender();
	}

	const usage = $.derived(() => `${scriptOpen}
  import FlyingPosters from '$lib/components/FlyingPosters.svelte';

  const items = [
    'https://picsum.photos/500/500?grayscale',
    'https://picsum.photos/600/600?grayscale',
    'https://picsum.photos/400/400?grayscale'
  ];
${scriptClose}

<div style="height:600px;position:relative;">
  <FlyingPosters {items} />
</div>`);

	const props = [
		{
			name: 'items',
			type: 'string[]',
			default: '[]',
			description: 'An array of image URLs to be displayed as flying posters.'
		},

		{
			name: 'planeWidth',
			type: 'number',
			default: '320',
			description: 'The width of each poster plane in pixels.'
		},

		{
			name: 'planeHeight',
			type: 'number',
			default: '320',
			description: 'The height of each poster plane in pixels.'
		},

		{
			name: 'distortion',
			type: 'number',
			default: '3',
			description: "The amount of distortion applied to the posters' movement."
		},

		{
			name: 'scrollEase',
			type: 'number',
			default: '0.01',
			description: 'The easing factor for smooth scrolling interactions.'
		},

		{
			name: 'cameraFov',
			type: 'number',
			default: '45',
			description: 'The field of view for the camera in degrees.'
		},

		{
			name: 'cameraZ',
			type: 'number',
			default: '20',
			description: 'The Z position of the camera, affecting zoom and perspective.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root wrapper.'
		}
	];

	$.head('1pkapep', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Flying Posters - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Flying Posters</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container relative h-[500px] overflow-hidden p-0"><!---->`);

			{
				FlyingPosters($$renderer, {
					items,
					planeWidth,
					planeHeight,
					distortion,
					scrollEase,
					cameraFov,
					cameraZ
				});
			}

			$$renderer.push(`<!----> <p class="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 text-[clamp(2rem,6vw,6rem)] font-black text-[#333]">Scroll.</p></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'flying-posters', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Plane Width',
						min: 300,
						max: 400,
						step: 10,
						value: planeWidth,
						valueUnit: 'px',
						onChange: (v) => {
							planeWidth = v;
							forceRerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Plane Height',
						min: 200,
						max: 350,
						step: 10,
						value: planeHeight,
						valueUnit: 'px',
						onChange: (v) => {
							planeHeight = v;
							forceRerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Distortion',
						min: 0,
						max: 10,
						step: 0.1,
						value: distortion,
						onChange: (v) => {
							distortion = v;
							forceRerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scroll Ease',
						min: 0.001,
						max: 0.05,
						step: 0.001,
						value: scrollEase,
						onChange: (v) => {
							scrollEase = v;
							forceRerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Camera FOV',
						min: 20,
						max: 90,
						step: 1,
						value: cameraFov,
						valueUnit: '°',
						onChange: (v) => {
							cameraFov = v;
							forceRerender();
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Camera Z',
						min: 5,
						max: 50,
						step: 1,
						value: cameraZ,
						onChange: (v) => {
							cameraZ = v;
							forceRerender();
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
			componentName: 'FlyingPosters',
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