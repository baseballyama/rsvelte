import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import CardNav from '$lib/components/library/Components/CardNav/CardNav.svelte';
import source from '$lib/components/library/Components/CardNav/CardNav.svelte?raw';
import logoLight from '$lib/assets/logo/svelte-bits-icon-logo-black.svg';
import logoDark from '$lib/assets/logo/svelte-bits-icon-logo.svg';

export default function CardNavDemo($$renderer) {
	const DEFAULTS = { theme: 'light', ease: 'power3.out' };
	let theme = DEFAULTS.theme;
	let ease = DEFAULTS.ease;
	let key = 0;

	const items = [
		{
			label: 'About',
			bgColor: '#1B1722',
			textColor: '#fff',
			links: [
				{ label: 'Company', href: '#', ariaLabel: 'About Company' },
				{ label: 'Careers', href: '#', ariaLabel: 'About Careers' }
			]
		},

		{
			label: 'Projects',
			bgColor: '#222222',
			textColor: '#fff',
			links: [
				{ label: 'Featured', href: '#', ariaLabel: 'Featured Projects' },
				{
					label: 'Case Studies',
					href: '#',
					ariaLabel: 'Project Case Studies'
				}
			]
		},

		{
			label: 'Contact',
			bgColor: '#222222',
			textColor: '#fff',
			links: [
				{ label: 'Email', href: '#', ariaLabel: 'Email us' },
				{ label: 'Twitter', href: '#', ariaLabel: 'Twitter' },
				{ label: 'LinkedIn', href: '#', ariaLabel: 'LinkedIn' }
			]
		}
	];

	const themeConfigs = {
		light: {
			logo: logoLight,
			baseColor: '#fff',
			menuColor: '#000',
			buttonBgColor: '#111',
			buttonTextColor: '#fff',
			backgroundColor: '#f5f5f5'
		},
		dark: {
			logo: logoDark,
			baseColor: '#120F17',
			menuColor: '#fff',
			buttonBgColor: '#FF8A4C',
			buttonTextColor: '#fff',
			backgroundColor: '#120F17'
		},
		color: {
			logo: logoDark,
			baseColor: '#FF8A4C',
			menuColor: '#fff',
			buttonBgColor: '#fff',
			buttonTextColor: '#FF8A4C',
			backgroundColor: '#120F17'
		}
	};

	const currentTheme = $.derived(() => themeConfigs[theme]);
	const hasChanges = $.derived(() => theme !== DEFAULTS.theme || ease !== DEFAULTS.ease);

	function reset() {
		theme = DEFAULTS.theme;
		ease = DEFAULTS.ease;
		key++;
	}

	const usage = $.derived(() => `<CardNav logo={logo} items={items} ease="${ease}" baseColor="${currentTheme().baseColor}" />`);

	const props = [
		{
			name: 'logo',
			type: 'string',
			default: '-',
			description: 'URL for the logo image.'
		},

		{
			name: 'logoAlt',
			type: 'string',
			default: '"Logo"',
			description: 'Alt text for the logo.'
		},

		{
			name: 'items',
			type: 'CardNavItem[]',
			default: '-',
			description: 'Array of nav items.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the container.'
		},

		{
			name: 'ease',
			type: 'string',
			default: '"power3.out"',
			description: 'GSAP easing function.'
		},

		{
			name: 'baseColor',
			type: 'string',
			default: '"#fff"',
			description: 'Background color of the nav.'
		},

		{
			name: 'menuColor',
			type: 'string',
			default: '-',
			description: 'Color for the hamburger lines.'
		},

		{
			name: 'buttonBgColor',
			type: 'string',
			default: '-',
			description: 'CTA button bg color.'
		},

		{
			name: 'buttonTextColor',
			type: 'string',
			default: '-',
			description: 'CTA button text color.'
		}
	];

	$.head('1r4546x', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Card Nav - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Card Nav</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container demo-container-dots"${$.attr_style(`position:relative;height:550px;overflow:hidden;background:${$.stringify(currentTheme().backgroundColor)};`)}><!---->`);

			{
				CardNav($$renderer, {
					logo: currentTheme().logo,
					items,
					baseColor: currentTheme().baseColor,
					menuColor: currentTheme().menuColor,
					buttonBgColor: currentTheme().buttonBgColor,
					buttonTextColor: currentTheme().buttonTextColor,
					ease
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'card-nav', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Example',
						value: theme,
						options: [
							{ label: 'Light Mode', value: 'light' },
							{ label: 'Dark Mode', value: 'dark' },
							{ label: 'Colorful', value: 'color' }
						],

						onChange: (v) => {
							theme = v;
							key++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Ease',
						value: ease,
						options: [
							{ label: 'power3.out', value: 'power3.out' },
							{ label: 'back.out(1.7)', value: 'back.out(1.7)' },
							{ label: 'elastic.out(1, 0.8)', value: 'elastic.out(1, 0.8)' },
							{ label: 'circ.out', value: 'circ.out' }
						],

						onChange: (v) => {
							ease = v;
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
			componentName: 'CardNav',
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