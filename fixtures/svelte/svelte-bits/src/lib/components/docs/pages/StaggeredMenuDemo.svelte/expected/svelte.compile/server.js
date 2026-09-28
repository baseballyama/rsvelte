import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import StaggeredMenu from '$lib/components/library/Components/StaggeredMenu/StaggeredMenu.svelte';
import source from '$lib/components/library/Components/StaggeredMenu/StaggeredMenu.svelte?raw';
import logo from '$lib/assets/logo/svelte-bits-logo.svg';

export default function StaggeredMenuDemo($$renderer) {
	const DEFAULTS = {
		displaySocials: true,
		accentColor: '#FF8A4C',
		menuButtonColor: '#ffffff',
		position: 'right'
	};

	let displaySocials = DEFAULTS.displaySocials;
	let accentColor = DEFAULTS.accentColor;
	let menuButtonColor = DEFAULTS.menuButtonColor;
	let position = DEFAULTS.position;
	let menuKey = 0;
	const hasChanges = $.derived(() => displaySocials !== DEFAULTS.displaySocials || accentColor !== DEFAULTS.accentColor || menuButtonColor !== DEFAULTS.menuButtonColor || position !== DEFAULTS.position);

	function reset() {
		displaySocials = DEFAULTS.displaySocials;
		accentColor = DEFAULTS.accentColor;
		menuButtonColor = DEFAULTS.menuButtonColor;
		position = DEFAULTS.position;
		menuKey++;
	}

	const items = [
		{
			label: 'Home',
			ariaLabel: 'Go to Home section',
			link: '#home'
		},

		{
			label: 'About',
			ariaLabel: 'Go to About section',
			link: '#about'
		},

		{
			label: 'Projects',
			ariaLabel: 'Go to Projects section',
			link: '#projects'
		},

		{
			label: 'Contact',
			ariaLabel: 'Go to Contact section',
			link: '#contact'
		}
	];

	const socialItems = [
		{ label: 'GitHub', link: 'https://github.com/' },
		{ label: 'Twitter', link: 'https://twitter.com/' },
		{ label: 'LinkedIn', link: 'https://linkedin.com/' }
	];

	const usage = `<StaggeredMenu items={items} socialItems={socials} position="right" accentColor="#FF8A4C" />`;

	const props = [
		{
			name: 'position',
			type: '"left" | "right"',
			default: '"right"',
			description: 'Anchor side.'
		},

		{
			name: 'colors',
			type: 'string[]',
			default: '["#FFC18A","#FF8A4C"]',
			description: 'Underlay layer colors.'
		},

		{
			name: 'items',
			type: 'StaggeredMenuItem[]',
			default: '[]',
			description: 'Menu items.'
		},

		{
			name: 'socialItems',
			type: 'StaggeredMenuSocialItem[]',
			default: '[]',
			description: 'Social links.'
		},

		{
			name: 'displaySocials',
			type: 'boolean',
			default: 'true',
			description: 'Show social links.'
		},

		{
			name: 'displayItemNumbering',
			type: 'boolean',
			default: 'true',
			description: 'Show item numbers.'
		},

		{
			name: 'logoUrl',
			type: 'string',
			default: '""',
			description: 'Logo image URL.'
		},

		{
			name: 'menuButtonColor',
			type: 'string',
			default: '"#fff"',
			description: 'Toggle button color when closed.'
		},

		{
			name: 'openMenuButtonColor',
			type: 'string',
			default: '"#fff"',
			description: 'Toggle button color when open.'
		},

		{
			name: 'accentColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Hover/numbering accent.'
		},

		{
			name: 'changeMenuColorOnOpen',
			type: 'boolean',
			default: 'true',
			description: 'Animate button color on toggle.'
		},

		{
			name: 'closeOnClickAway',
			type: 'boolean',
			default: 'true',
			description: 'Close on outside click.'
		},

		{
			name: 'onMenuOpen',
			type: '() => void',
			default: '-',
			description: 'Open callback.'
		},

		{
			name: 'onMenuClose',
			type: '() => void',
			default: '-',
			description: 'Close callback.'
		}
	];

	$.head('1kxi7nz', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Staggered Menu - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Staggered Menu</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container demo-container-dots" style="position:relative;height:800px;overflow:hidden;padding:0;background:#1a1a1a;"><!---->`);

			{
				StaggeredMenu($$renderer, {
					logoUrl: logo,
					items,
					socialItems,
					openMenuButtonColor: position === 'left' ? '#fff' : '#000',
					displaySocials,
					accentColor,
					menuButtonColor,
					position
				});
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'staggered-menu', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Position',
						value: position,
						options: [
							{ value: 'right', label: 'Right' },
							{ value: 'left', label: 'Left' }
						],

						onChange: (v) => {
							position = v;
							menuKey++;
						}
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Accent Color',
						color: accentColor,
						onChange: (v) => accentColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Menu Button Color',
						color: menuButtonColor,
						onChange: (v) => menuButtonColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Display Socials',
						checked: displaySocials,
						onChange: (v) => displaySocials = v
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
			componentName: 'StaggeredMenu',
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