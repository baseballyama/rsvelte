import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import DomeGallery from '$lib/components/library/Components/DomeGallery/DomeGallery.svelte';
import source from '$lib/components/library/Components/DomeGallery/DomeGallery.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:600px;padding:0;overflow:hidden;background:#0a0806;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Dome Gallery</h1> <!>`, 1);

export default function DomeGalleryDemo($$anchor) {
	const DEFAULTS = {
		fit: 0.8,
		minRadius: 600,
		maxVerticalRotationDeg: 0,
		segments: 34,
		dragDampening: 2,
		grayscale: true
	};

	let fit = $.state($.proxy(DEFAULTS.fit));
	let minRadius = $.state($.proxy(DEFAULTS.minRadius));
	let maxVerticalRotationDeg = $.state($.proxy(DEFAULTS.maxVerticalRotationDeg));
	let segments = $.state($.proxy(DEFAULTS.segments));
	let dragDampening = $.state($.proxy(DEFAULTS.dragDampening));
	let grayscale = $.state($.proxy(DEFAULTS.grayscale));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(fit) !== DEFAULTS.fit || $.get(minRadius) !== DEFAULTS.minRadius || $.get(maxVerticalRotationDeg) !== DEFAULTS.maxVerticalRotationDeg || $.get(segments) !== DEFAULTS.segments || $.get(dragDampening) !== DEFAULTS.dragDampening || $.get(grayscale) !== DEFAULTS.grayscale);

	function reset() {
		$.set(fit, DEFAULTS.fit, true);
		$.set(minRadius, DEFAULTS.minRadius, true);
		$.set(maxVerticalRotationDeg, DEFAULTS.maxVerticalRotationDeg, true);
		$.set(segments, DEFAULTS.segments, true);
		$.set(dragDampening, DEFAULTS.dragDampening, true);
		$.set(grayscale, DEFAULTS.grayscale, true);
		$.update(key);
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

	var fragment = root_2();

	$.head('4b7kf9', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Dome Gallery - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				DomeGallery($$anchor, {
					get fit() {
						return $.get(fit);
					},

					get minRadius() {
						return $.get(minRadius);
					},

					get maxVerticalRotationDeg() {
						return $.get(maxVerticalRotationDeg);
					},

					get segments() {
						return $.get(segments);
					},

					get dragDampening() {
						return $.get(dragDampening);
					},

					get grayscale() {
						return $.get(grayscale);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'dome-gallery',
				usage,
				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewSlider(node_2, {
						title: 'Fit',
						min: 0.3,
						max: 1.5,
						step: 0.05,
						get value() {
							return $.get(fit);
						},

						onChange: (v) => {
							$.set(fit, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Min Radius',
						min: 200,
						max: 1200,
						step: 50,
						get value() {
							return $.get(minRadius);
						},

						onChange: (v) => {
							$.set(minRadius, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Max Vertical Rotation',
						min: 0,
						max: 45,
						step: 1,
						get value() {
							return $.get(maxVerticalRotationDeg);
						},

						onChange: (v) => {
							$.set(maxVerticalRotationDeg, v, true);
							$.update(key);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Segments',
						min: 20,
						max: 50,
						step: 1,
						get value() {
							return $.get(segments);
						},

						onChange: (v) => {
							$.set(segments, v, true);
							$.update(key);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Drag Dampening',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(dragDampening);
						},

						onChange: (v) => {
							$.set(dragDampening, v, true);
							$.update(key);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Grayscale',
						get value() {
							return $.get(grayscale);
						},

						onChange: (v) => {
							$.set(grayscale, v, true);
							$.update(key);
						}
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'DomeGallery',
			usage,
			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment);
}