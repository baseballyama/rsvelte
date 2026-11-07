import * as $ from 'svelte/internal/server';
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

export default function BubbleMenuDemo($$renderer) {
	const DEFAULTS = {
		animationEase: 'back.out(1.5)',
		menuBg: '#ffffff',
		menuContentColor: '#222222',
		animationDuration: 0.5,
		staggerDelay: 0.12
	};

	let animationEase = DEFAULTS.animationEase;
	let menuBg = DEFAULTS.menuBg;
	let menuContentColor = DEFAULTS.menuContentColor;
	let animationDuration = DEFAULTS.animationDuration;
	let staggerDelay = DEFAULTS.staggerDelay;
	const hasChanges = $.derived(() => animationEase !== DEFAULTS.animationEase || menuBg !== DEFAULTS.menuBg || menuContentColor !== DEFAULTS.menuContentColor || animationDuration !== DEFAULTS.animationDuration || staggerDelay !== DEFAULTS.staggerDelay);

	function reset() {
		animationEase = DEFAULTS.animationEase;
		menuBg = DEFAULTS.menuBg;
		menuContentColor = DEFAULTS.menuContentColor;
		animationDuration = DEFAULTS.animationDuration;
		staggerDelay = DEFAULTS.staggerDelay;
	}

	const usage = $.derived(() => `<BubbleMenu logo={logo} menuBg="${menuBg}" menuContentColor="${menuContentColor}" animationEase="${animationEase}" animationDuration={${animationDuration}} staggerDelay={${staggerDelay}} />`);

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

	$.head('2kqqnf', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Bubble Menu - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Bubble Menu</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container demo-container-dots" style="position:relative;height:800px;overflow:hidden;">`);

			BubbleMenu($$renderer, {
				logo,
				menuBg,
				menuContentColor,
				animationEase,
				animationDuration,
				staggerDelay
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'bubble-menu', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Ease',
						value: animationEase,
						options: [
							{ label: 'back.out(1.5)', value: 'back.out(1.5)' },
							{ label: 'power3.out', value: 'power3.out' },
							{ label: 'power2.out', value: 'power2.out' },
							{ label: 'elastic.out(1,0.5)', value: 'elastic.out(1,0.5)' },
							{ label: 'bounce.out', value: 'bounce.out' }
						],
						onChange: (v) => animationEase = v
					});

					$$renderer.push(`<!----> `);
					PreviewColorPicker($$renderer, { title: 'Menu BG', value: menuBg, onChange: (v) => menuBg = v });
					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Content Color',
						value: menuContentColor,
						onChange: (v) => menuContentColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Anim Duration',
						min: 0.1,
						max: 2,
						step: 0.05,
						value: animationDuration,
						onChange: (v) => animationDuration = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Stagger',
						min: 0,
						max: 0.5,
						step: 0.01,
						value: staggerDelay,
						onChange: (v) => staggerDelay = v
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
			componentName: 'BubbleMenu',
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