import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Carousel from '$lib/components/library/Components/Carousel/Carousel.svelte';
import source from '$lib/components/library/Components/Carousel/Carousel.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;min-height:500px;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Carousel</h1> <!>`, 1);

export default function CarouselDemo($$anchor) {
	const DEFAULTS = {
		baseWidth: 300,
		autoplay: true,
		autoplayDelay: 3000,
		pauseOnHover: true,
		loop: true,
		round: false
	};

	let baseWidth = $.state($.proxy(DEFAULTS.baseWidth));
	let autoplay = $.state($.proxy(DEFAULTS.autoplay));
	let autoplayDelay = $.state($.proxy(DEFAULTS.autoplayDelay));
	let pauseOnHover = $.state($.proxy(DEFAULTS.pauseOnHover));
	let loop = $.state($.proxy(DEFAULTS.loop));
	let round = $.state($.proxy(DEFAULTS.round));
	let key = $.state(0);
	const hasChanges = $.derived(() => $.get(baseWidth) !== DEFAULTS.baseWidth || $.get(autoplay) !== DEFAULTS.autoplay || $.get(autoplayDelay) !== DEFAULTS.autoplayDelay || $.get(pauseOnHover) !== DEFAULTS.pauseOnHover || $.get(loop) !== DEFAULTS.loop || $.get(round) !== DEFAULTS.round);

	function reset() {
		$.set(baseWidth, DEFAULTS.baseWidth, true);
		$.set(autoplay, DEFAULTS.autoplay, true);
		$.set(autoplayDelay, DEFAULTS.autoplayDelay, true);
		$.set(pauseOnHover, DEFAULTS.pauseOnHover, true);
		$.set(loop, DEFAULTS.loop, true);
		$.set(round, DEFAULTS.round, true);
		$.update(key);
	}

	const usage = $.derived(() => `<Carousel baseWidth={${$.get(baseWidth)}} autoplay={${$.get(autoplay)}} autoplayDelay={${$.get(autoplayDelay)}} pauseOnHover={${$.get(pauseOnHover)}} loop={${$.get(loop)}} round={${$.get(round)}} />`);

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

	var fragment = root_2();

	$.head('14af3gg', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Carousel - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				Carousel($$anchor, {
					get baseWidth() {
						return $.get(baseWidth);
					},

					get autoplay() {
						return $.get(autoplay);
					},

					get autoplayDelay() {
						return $.get(autoplayDelay);
					},

					get pauseOnHover() {
						return $.get(pauseOnHover);
					},

					get loop() {
						return $.get(loop);
					},

					get round() {
						return $.get(round);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'carousel',
				get usage() {
					return $.get(usage);
				},

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
						title: 'Base Width',
						min: 200,
						max: 600,
						step: 10,
						get value() {
							return $.get(baseWidth);
						},

						onChange: (v) => {
							$.set(baseWidth, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSwitch(node_3, {
						title: 'Autoplay',
						get checked() {
							return $.get(autoplay);
						},

						onChange: (v) => {
							$.set(autoplay, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Autoplay Delay (ms)',
						min: 500,
						max: 8000,
						step: 100,
						get value() {
							return $.get(autoplayDelay);
						},

						onChange: (v) => {
							$.set(autoplayDelay, v, true);
							$.update(key);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Pause on Hover',
						get checked() {
							return $.get(pauseOnHover);
						},

						onChange: (v) => {
							$.set(pauseOnHover, v, true);
							$.update(key);
						}
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Loop',
						get checked() {
							return $.get(loop);
						},

						onChange: (v) => {
							$.set(loop, v, true);
							$.update(key);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Round',
						get checked() {
							return $.get(round);
						},

						onChange: (v) => {
							$.set(round, v, true);
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
			componentName: 'Carousel',
			get usage() {
				return $.get(usage);
			},

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