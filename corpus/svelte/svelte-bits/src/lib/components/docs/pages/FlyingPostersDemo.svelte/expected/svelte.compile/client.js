import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import FlyingPosters from '$lib/components/library/Components/FlyingPosters/FlyingPosters.svelte';
import source from '$lib/components/library/Components/FlyingPosters/FlyingPosters.svelte?raw';

var root = $.from_html(`<div class="demo-container relative h-[500px] overflow-hidden p-0"><!> <p class="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 text-[clamp(2rem,6vw,6rem)] font-black text-[#333]">Scroll.</p></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Flying Posters</h1> <!>`, 1);

export default function FlyingPostersDemo($$anchor) {
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

	let planeWidth = $.state($.proxy(DEFAULTS.planeWidth));
	let planeHeight = $.state($.proxy(DEFAULTS.planeHeight));
	let distortion = $.state($.proxy(DEFAULTS.distortion));
	let scrollEase = $.state($.proxy(DEFAULTS.scrollEase));
	let cameraFov = $.state($.proxy(DEFAULTS.cameraFov));
	let cameraZ = $.state($.proxy(DEFAULTS.cameraZ));
	let renderKey = $.state(0);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	function forceRerender() {
		$.set(renderKey, $.get(renderKey) + 1);
	}

	const hasChanges = $.derived(() => $.get(planeWidth) !== DEFAULTS.planeWidth || $.get(planeHeight) !== DEFAULTS.planeHeight || $.get(distortion) !== DEFAULTS.distortion || $.get(scrollEase) !== DEFAULTS.scrollEase || $.get(cameraFov) !== DEFAULTS.cameraFov || $.get(cameraZ) !== DEFAULTS.cameraZ);

	function reset() {
		$.set(planeWidth, DEFAULTS.planeWidth, true);
		$.set(planeHeight, DEFAULTS.planeHeight, true);
		$.set(distortion, DEFAULTS.distortion, true);
		$.set(scrollEase, DEFAULTS.scrollEase, true);
		$.set(cameraFov, DEFAULTS.cameraFov, true);
		$.set(cameraZ, DEFAULTS.cameraZ, true);
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

	var fragment = root_2();

	$.head('1pkapep', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Flying Posters - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(renderKey), ($$anchor) => {
				FlyingPosters($$anchor, {
					get items() {
						return items;
					},

					get planeWidth() {
						return $.get(planeWidth);
					},

					get planeHeight() {
						return $.get(planeHeight);
					},

					get distortion() {
						return $.get(distortion);
					},

					get scrollEase() {
						return $.get(scrollEase);
					},

					get cameraFov() {
						return $.get(cameraFov);
					},

					get cameraZ() {
						return $.get(cameraZ);
					}
				});
			});

			$.next(2);
			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'flying-posters',
				usage: $.get(usage),
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
						title: 'Plane Width',
						min: 300,
						max: 400,
						step: 10,
						get value() {
							return $.get(planeWidth);
						},
						valueUnit: 'px',
						onChange: (v) => {
							$.set(planeWidth, v, true);
							forceRerender();
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Plane Height',
						min: 200,
						max: 350,
						step: 10,
						get value() {
							return $.get(planeHeight);
						},
						valueUnit: 'px',
						onChange: (v) => {
							$.set(planeHeight, v, true);
							forceRerender();
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Distortion',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(distortion);
						},

						onChange: (v) => {
							$.set(distortion, v, true);
							forceRerender();
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Scroll Ease',
						min: 0.001,
						max: 0.05,
						step: 0.001,
						get value() {
							return $.get(scrollEase);
						},

						onChange: (v) => {
							$.set(scrollEase, v, true);
							forceRerender();
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Camera FOV',
						min: 20,
						max: 90,
						step: 1,
						get value() {
							return $.get(cameraFov);
						},
						valueUnit: '°',
						onChange: (v) => {
							$.set(cameraFov, v, true);
							forceRerender();
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Camera Z',
						min: 5,
						max: 50,
						step: 1,
						get value() {
							return $.get(cameraZ);
						},

						onChange: (v) => {
							$.set(cameraZ, v, true);
							forceRerender();
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
			componentName: 'FlyingPosters',
			usage: $.get(usage),
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