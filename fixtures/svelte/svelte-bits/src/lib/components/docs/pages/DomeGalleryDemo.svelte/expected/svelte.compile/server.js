import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import DomeGallery from '$lib/components/library/Components/DomeGallery/DomeGallery.svelte';
import source from '$lib/components/library/Components/DomeGallery/DomeGallery.svelte?raw';

export default function DomeGalleryDemo($$renderer) {
	const DEFAULTS = {
		fit: 0.8,
		minRadius: 600,
		maxVerticalRotationDeg: 0,
		segments: 34,
		dragDampening: 2,
		grayscale: true
	};

	let fit = DEFAULTS.fit;
	let minRadius = DEFAULTS.minRadius;
	let maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg;
	let segments = DEFAULTS.segments;
	let dragDampening = DEFAULTS.dragDampening;
	let grayscale = DEFAULTS.grayscale;
	let key = 0;
	const hasChanges = $.derived(() => fit !== DEFAULTS.fit || minRadius !== DEFAULTS.minRadius || maxVerticalRotationDeg !== DEFAULTS.maxVerticalRotationDeg || segments !== DEFAULTS.segments || dragDampening !== DEFAULTS.dragDampening || grayscale !== DEFAULTS.grayscale);

	function reset() {
		fit = DEFAULTS.fit;
		minRadius = DEFAULTS.minRadius;
		maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg;
		segments = DEFAULTS.segments;
		dragDampening = DEFAULTS.dragDampening;
		grayscale = DEFAULTS.grayscale;
		key++;
	}

	const usage = `<DomeGallery fit={0.8} grayscale />`;

	const props = [
		{
			name: 'images',
			type: '(string | { src; alt? })[]',
			default: 'DEFAULT_IMAGES',
			description: 'Images to display on the dome.'
		},

		{
			name: 'fit',
			type: 'number',
			default: '0.5',
			description: 'Dome size factor relative to container.'
		},

		{
			name: 'fitBasis',
			type: "'auto' | 'min' | 'max' | 'width' | 'height'",
			default: "'auto'",
			description: 'Dome size basis.'
		},

		{
			name: 'minRadius',
			type: 'number',
			default: '600',
			description: 'Minimum dome radius (px).'
		},

		{
			name: 'maxRadius',
			type: 'number',
			default: 'Infinity',
			description: 'Maximum dome radius (px).'
		},

		{
			name: 'padFactor',
			type: 'number',
			default: '0.25',
			description: 'Viewer padding factor.'
		},

		{
			name: 'overlayBlurColor',
			type: 'string',
			default: "'#14110E'",
			description: 'Outer overlay color.'
		},

		{
			name: 'maxVerticalRotationDeg',
			type: 'number',
			default: '5',
			description: 'Vertical drag clamp.'
		},

		{
			name: 'dragSensitivity',
			type: 'number',
			default: '20',
			description: 'Drag sensitivity.'
		},

		{
			name: 'enlargeTransitionMs',
			type: 'number',
			default: '300',
			description: 'Enlarge animation duration.'
		},

		{
			name: 'segments',
			type: 'number',
			default: '35',
			description: 'Dome segments per axis.'
		},

		{
			name: 'dragDampening',
			type: 'number',
			default: '2',
			description: 'Drag inertia damping (0-1).'
		},

		{
			name: 'openedImageWidth',
			type: 'string',
			default: "'400px'",
			description: 'Enlarged image width.'
		},

		{
			name: 'openedImageHeight',
			type: 'string',
			default: "'400px'",
			description: 'Enlarged image height.'
		},

		{
			name: 'imageBorderRadius',
			type: 'string',
			default: "'30px'",
			description: 'Tile corner radius.'
		},

		{
			name: 'openedImageBorderRadius',
			type: 'string',
			default: "'30px'",
			description: 'Enlarged corner radius.'
		},

		{
			name: 'grayscale',
			type: 'boolean',
			default: 'true',
			description: 'Apply grayscale filter.'
		}
	];

	$.head('4b7kf9', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Dome Gallery - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Dome Gallery</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:600px;padding:0;overflow:hidden;background:#0a0806;"><!---->`);

			{
				DomeGallery($$renderer, {
					fit,
					minRadius,
					maxVerticalRotationDeg,
					segments,
					dragDampening,
					grayscale
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'dome-gallery', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Fit',
						min: 0.3,
						max: 1.5,
						step: 0.05,
						value: fit,
						onChange: (v) => {
							fit = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Min Radius',
						min: 200,
						max: 1200,
						step: 50,
						value: minRadius,
						onChange: (v) => {
							minRadius = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Max Vertical Rotation',
						min: 0,
						max: 45,
						step: 1,
						value: maxVerticalRotationDeg,
						onChange: (v) => {
							maxVerticalRotationDeg = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Segments',
						min: 20,
						max: 50,
						step: 1,
						value: segments,
						onChange: (v) => {
							segments = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Drag Dampening',
						min: 0,
						max: 1,
						step: 0.05,
						value: dragDampening,
						onChange: (v) => {
							dragDampening = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Grayscale',
						value: grayscale,
						onChange: (v) => {
							grayscale = v;
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
			componentName: 'DomeGallery',
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