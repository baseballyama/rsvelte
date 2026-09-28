import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BounceCards from '$lib/components/library/Components/BounceCards/BounceCards.svelte';
import source from '$lib/components/library/Components/BounceCards/BounceCards.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Bounce Cards</h1> <!>`, 1);

export default function BounceCardsDemo($$anchor) {
	const DEFAULTS = {
		enableHover: false,
		animationDelay: 1,
		animationStagger: 0.08
	};

	let enableHover = $.state($.proxy(DEFAULTS.enableHover));
	let animationDelay = $.state($.proxy(DEFAULTS.animationDelay));
	let animationStagger = $.state($.proxy(DEFAULTS.animationStagger));
	let key = $.state(0);

	const images = [
		'https://picsum.photos/400/400?grayscale',
		'https://picsum.photos/500/500?grayscale',
		'https://picsum.photos/600/600?grayscale',
		'https://picsum.photos/700/700?grayscale',
		'https://picsum.photos/300/300?grayscale'
	];

	const transformStyles = [
		'rotate(5deg) translate(-150px)',
		'rotate(0deg) translate(-70px)',
		'rotate(-5deg)',
		'rotate(5deg) translate(70px)',
		'rotate(-5deg) translate(150px)'
	];

	const hasChanges = $.derived(() => $.get(enableHover) !== DEFAULTS.enableHover || $.get(animationDelay) !== DEFAULTS.animationDelay || $.get(animationStagger) !== DEFAULTS.animationStagger);

	function reset() {
		$.set(enableHover, DEFAULTS.enableHover, true);
		$.set(animationDelay, DEFAULTS.animationDelay, true);
		$.set(animationStagger, DEFAULTS.animationStagger, true);
		$.update(key);
	}

	const usage = $.derived(() => `<BounceCards images={images} animationDelay={${$.get(animationDelay)}} animationStagger={${$.get(animationStagger)}} enableHover={${$.get(enableHover)}} />`);

	const props = [
		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional CSS classes for the container.'
		},

		{
			name: 'images',
			type: 'string[]',
			default: '[]',
			description: 'Array of image URLs to display.'
		},

		{
			name: 'containerWidth',
			type: 'number',
			default: '400',
			description: 'Width of the container (px).'
		},

		{
			name: 'containerHeight',
			type: 'number',
			default: '400',
			description: 'Height of the container (px).'
		},

		{
			name: 'animationDelay',
			type: 'number',
			default: '0.5',
			description: 'Delay (in seconds) before the animation starts.'
		},

		{
			name: 'animationStagger',
			type: 'number',
			default: '0.06',
			description: "Time between each card's animation."
		},

		{
			name: 'easeType',
			type: 'string',
			default: '"elastic.out(1, 0.8)"',
			description: 'Easing function for the bounce.'
		},

		{
			name: 'transformStyles',
			type: 'string[]',
			default: '[...]',
			description: 'Custom transforms for each card position.'
		},

		{
			name: 'enableHover',
			type: 'boolean',
			default: 'false',
			description: 'Enable hover-to-spread behaviour.'
		}
	];

	var fragment = root_2();

	$.head('1d9cg05', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Bounce Cards - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key), ($$anchor) => {
				BounceCards($$anchor, {
					get images() {
						return images;
					},

					get transformStyles() {
						return transformStyles;
					},

					get enableHover() {
						return $.get(enableHover);
					},

					get animationDelay() {
						return $.get(animationDelay);
					},

					get animationStagger() {
						return $.get(animationStagger);
					},
					containerWidth: 500,
					containerHeight: 250
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'bounce-cards',
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

					PreviewSwitch(node_2, {
						title: 'Enable Hover',
						get checked() {
							return $.get(enableHover);
						},

						onChange: (v) => {
							$.set(enableHover, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Animation Delay',
						min: 0,
						max: 2,
						step: 0.1,
						get value() {
							return $.get(animationDelay);
						},

						onChange: (v) => {
							$.set(animationDelay, v, true);
							$.update(key);
						}
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Animation Stagger',
						min: 0,
						max: 0.3,
						step: 0.01,
						get value() {
							return $.get(animationStagger);
						},

						onChange: (v) => {
							$.set(animationStagger, v, true);
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
			componentName: 'BounceCards',
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