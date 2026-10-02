import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import CircularGallery from '$lib/components/library/Components/CircularGallery/CircularGallery.svelte';
import source from '$lib/components/library/Components/CircularGallery/CircularGallery.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:400px;padding:0;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Circular Gallery</h1> <!>`, 1);

export default function CircularGalleryDemo($$anchor) {
	const DEFAULTS = {
		bend: 1,
		borderRadius: 0.05,
		scrollSpeed: 2,
		scrollEase: 0.05
	};

	let bend = $.state($.proxy(DEFAULTS.bend));
	let borderRadius = $.state($.proxy(DEFAULTS.borderRadius));
	let scrollSpeed = $.state($.proxy(DEFAULTS.scrollSpeed));
	let scrollEase = $.state($.proxy(DEFAULTS.scrollEase));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(bend) !== DEFAULTS.bend || $.get(borderRadius) !== DEFAULTS.borderRadius || $.get(scrollSpeed) !== DEFAULTS.scrollSpeed || $.get(scrollEase) !== DEFAULTS.scrollEase);

	function reset() {
		$.set(bend, DEFAULTS.bend, true);
		$.set(borderRadius, DEFAULTS.borderRadius, true);
		$.set(scrollSpeed, DEFAULTS.scrollSpeed, true);
		$.set(scrollEase, DEFAULTS.scrollEase, true);
		$.update(key);
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

	var fragment = root_2();

	$.head('1cumo4b', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Circular Gallery - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				CircularGallery($$anchor, {
					get bend() {
						return $.get(bend);
					},

					get borderRadius() {
						return $.get(borderRadius);
					},

					get scrollSpeed() {
						return $.get(scrollSpeed);
					},

					get scrollEase() {
						return $.get(scrollEase);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'circular-gallery',
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
						title: 'Bend Level',
						min: -10,
						max: 10,
						step: 1,
						get value() {
							return $.get(bend);
						},

						onChange: (v) => {
							$.set(bend, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Border Radius',
						min: 0,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(borderRadius);
						},

						onChange: (v) => {
							$.set(borderRadius, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Scroll Speed',
						min: 0.5,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(scrollSpeed);
						},

						onChange: (v) => {
							$.set(scrollSpeed, v, true);
							$.update(key);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Scroll Ease',
						min: 0.01,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(scrollEase);
						},

						onChange: (v) => {
							$.set(scrollEase, v, true);
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
			componentName: 'CircularGallery',
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