import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BubbleMenu from '$lib/components/library/Components/BubbleMenu/BubbleMenu.svelte';
import source from '$lib/components/library/Components/BubbleMenu/BubbleMenu.svelte?raw';
import logo from '$lib/assets/logo/svelte-bits-logo-black.svg';

var root = $.from_html(`<div class="demo-container demo-container-dots" style="position:relative;height:800px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Bubble Menu</h1> <!>`, 1);

export default function BubbleMenuDemo($$anchor) {
	const DEFAULTS = {
		animationEase: 'back.out(1.5)',
		menuBg: '#ffffff',
		menuContentColor: '#222222',
		animationDuration: 0.5,
		staggerDelay: 0.12
	};

	let animationEase = $.state($.proxy(DEFAULTS.animationEase));
	let menuBg = $.state($.proxy(DEFAULTS.menuBg));
	let menuContentColor = $.state($.proxy(DEFAULTS.menuContentColor));
	let animationDuration = $.state($.proxy(DEFAULTS.animationDuration));
	let staggerDelay = $.state($.proxy(DEFAULTS.staggerDelay));
	const hasChanges = $.derived(() => $.get(animationEase) !== DEFAULTS.animationEase || $.get(menuBg) !== DEFAULTS.menuBg || $.get(menuContentColor) !== DEFAULTS.menuContentColor || $.get(animationDuration) !== DEFAULTS.animationDuration || $.get(staggerDelay) !== DEFAULTS.staggerDelay);

	function reset() {
		$.set(animationEase, DEFAULTS.animationEase, true);
		$.set(menuBg, DEFAULTS.menuBg, true);
		$.set(menuContentColor, DEFAULTS.menuContentColor, true);
		$.set(animationDuration, DEFAULTS.animationDuration, true);
		$.set(staggerDelay, DEFAULTS.staggerDelay, true);
	}

	const usage = $.derived(() => `<BubbleMenu logo={logo} menuBg="${$.get(menuBg)}" menuContentColor="${$.get(menuContentColor)}" animationEase="${$.get(animationEase)}" animationDuration={${$.get(animationDuration)}} staggerDelay={${$.get(staggerDelay)}} />`);

	const props = [
		{
			name: 'logo',
			type: 'string | Snippet',
			default: '-',
			description: 'Logo content for the central bubble.'
		},

		{
			name: 'onMenuClick',
			type: '(open: boolean) => void',
			default: '-',
			description: 'Callback fired whenever the menu toggle state changes.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional class names for the root nav.'
		},

		{
			name: 'style',
			type: 'string',
			default: '""',
			description: 'Inline styles for the root nav.'
		},

		{
			name: 'menuAriaLabel',
			type: 'string',
			default: '"Toggle menu"',
			description: 'Aria-label for toggle button.'
		},

		{
			name: 'menuBg',
			type: 'string',
			default: '"#fff"',
			description: 'Bubble & pill base background.'
		},

		{
			name: 'menuContentColor',
			type: 'string',
			default: '"#111"',
			description: 'Color for menu icon lines & pill text.'
		},

		{
			name: 'useFixedPosition',
			type: 'boolean',
			default: 'false',
			description: 'Use fixed positioning instead of absolute.'
		},

		{
			name: 'items',
			type: 'BubbleMenuItem[]',
			default: 'DEFAULT_ITEMS',
			description: 'Custom menu items.'
		},

		{
			name: 'animationEase',
			type: 'string',
			default: '"back.out(1.5)"',
			description: 'GSAP ease for entry animation.'
		},

		{
			name: 'animationDuration',
			type: 'number',
			default: '0.5',
			description: 'Duration of each bubble animation.'
		},

		{
			name: 'staggerDelay',
			type: 'number',
			default: '0.12',
			description: 'Base stagger between bubble animations.'
		}
	];

	var fragment = root_2();

	$.head('2kqqnf', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Bubble Menu - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			BubbleMenu(node_1, {
				get logo() {
					return logo;
				},

				get menuBg() {
					return $.get(menuBg);
				},

				get menuContentColor() {
					return $.get(menuContentColor);
				},

				get animationEase() {
					return $.get(animationEase);
				},

				get animationDuration() {
					return $.get(animationDuration);
				},

				get staggerDelay() {
					return $.get(staggerDelay);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'bubble-menu',
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
					var fragment_3 = root_1();
					var node_2 = $.first_child(fragment_3);

					PreviewSelect(node_2, {
						title: 'Ease',
						get value() {
							return $.get(animationEase);
						},

						options: [
							{ label: 'back.out(1.5)', value: 'back.out(1.5)' },
							{ label: 'power3.out', value: 'power3.out' },
							{ label: 'power2.out', value: 'power2.out' },
							{ label: 'elastic.out(1,0.5)', value: 'elastic.out(1,0.5)' },
							{ label: 'bounce.out', value: 'bounce.out' }
						],
						onChange: (v) => $.set(animationEase, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewColorPicker(node_3, {
						title: 'Menu BG',
						get value() {
							return $.get(menuBg);
						},
						onChange: (v) => $.set(menuBg, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Content Color',
						get value() {
							return $.get(menuContentColor);
						},
						onChange: (v) => $.set(menuContentColor, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Anim Duration',
						min: 0.1,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(animationDuration);
						},
						onChange: (v) => $.set(animationDuration, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Stagger',
						min: 0,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(staggerDelay);
						},
						onChange: (v) => $.set(staggerDelay, v, true)
					});

					$.append($$anchor, fragment_3);
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
			componentName: 'BubbleMenu',
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