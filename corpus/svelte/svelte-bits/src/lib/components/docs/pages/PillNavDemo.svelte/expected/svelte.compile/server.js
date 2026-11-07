import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import PillNav from '$lib/components/library/Components/PillNav/PillNav.svelte';
import source from '$lib/components/library/Components/PillNav/PillNav.svelte?raw';
import logoDark from '$lib/assets/logo/svelte-bits-icon-logo-black.svg';
import logoLight from '$lib/assets/logo/svelte-bits-icon-logo.svg';

export default function PillNavDemo($$renderer) {
	const DEFAULTS = { theme: 'light', initialLoadAnimation: false };
	let theme = 'light';
	let initialLoadAnimation = DEFAULTS.initialLoadAnimation;
	const hasChanges = $.derived(() => theme !== DEFAULTS.theme || initialLoadAnimation !== DEFAULTS.initialLoadAnimation);

	function reset() {
		theme = 'light';
		initialLoadAnimation = DEFAULTS.initialLoadAnimation;
	}

	const themeConfigs = {
		light: {
			logo: logoLight,
			baseColor: '#000',
			pillColor: '#f0f0f0',
			hoveredPillTextColor: '#fff',
			pillTextColor: '#000',
			backgroundColor: '#f0f0f0'
		},
		dark: {
			logo: logoDark,
			baseColor: '#fff',
			pillColor: '#120F17',
			hoveredPillTextColor: '#000',
			pillTextColor: '#fff',
			backgroundColor: '#120F17'
		},
		color: {
			logo: logoDark,
			baseColor: '#FF8A4C',
			pillColor: '#120F17',
			hoveredPillTextColor: '#120F17',
			pillTextColor: '#fff',
			backgroundColor: '#120F17'
		}
	};

	const current = $.derived(() => themeConfigs[theme]);

	// Force remount on theme change so layout/animation re-runs.
	const navKey = $.derived(() => theme + '-' + initialLoadAnimation);

	const themeOptions = [
		{ value: 'light', label: 'Light Mode' },
		{ value: 'dark', label: 'Dark Mode' },
		{ value: 'color', label: 'Colorful' }
	];

	const usage = `<PillNav logo="/logo.svg" items={[{label:'Home',href:'/'}]} activeHref="/" />`;

	const props = [
		{
			name: 'logo',
			type: 'string',
			default: '-',
			description: 'Logo image URL.'
		},

		{
			name: 'logoAlt',
			type: 'string',
			default: '"Logo"',
			description: 'Alt text.'
		},

		{
			name: 'items',
			type: 'PillNavItem[]',
			default: '-',
			description: 'Nav items {label, href, ariaLabel?}.'
		},

		{
			name: 'activeHref',
			type: 'string',
			default: '-',
			description: 'Currently active href.'
		},

		{
			name: 'ease',
			type: 'string',
			default: '"power3.easeOut"',
			description: 'GSAP ease.'
		},

		{
			name: 'baseColor',
			type: 'string',
			default: '"#fff"',
			description: 'Background color.'
		},

		{
			name: 'pillColor',
			type: 'string',
			default: '"#120F17"',
			description: 'Pill background.'
		},

		{
			name: 'hoveredPillTextColor',
			type: 'string',
			default: '"#120F17"',
			description: 'Pill hover text color.'
		},

		{
			name: 'pillTextColor',
			type: 'string',
			default: 'baseColor',
			description: 'Pill text color.'
		},

		{
			name: 'initialLoadAnimation',
			type: 'boolean',
			default: 'true',
			description: 'Animate logo + nav on mount.'
		},

		{
			name: 'onMobileMenuClick',
			type: '() => void',
			default: '-',
			description: 'Mobile menu callback.'
		}
	];

	$.head('19n83x4', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Pill Nav - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Pill Nav</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container demo-container-dots"${$.attr_style(`position:relative;height:300px;overflow:hidden;background:${$.stringify(current().backgroundColor)};`)}><!---->`);

			{
				PillNav($$renderer, {
					logo: current().logo,
					baseColor: current().baseColor,
					pillColor: current().pillColor,
					hoveredPillTextColor: current().hoveredPillTextColor,
					pillTextColor: current().pillTextColor,
					initialLoadAnimation,
					items: [
						{ label: 'Home', href: '#' },
						{ label: 'About', href: '#about' },
						{ label: 'Contact', href: '#contact' }
					],
					activeHref: '#'
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'pill-nav', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Example',
						options: themeOptions,
						value: theme,
						onChange: (v) => theme = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Initial Load Animation',
						checked: initialLoadAnimation,
						onChange: (v) => initialLoadAnimation = v
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
			componentName: 'PillNav',
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