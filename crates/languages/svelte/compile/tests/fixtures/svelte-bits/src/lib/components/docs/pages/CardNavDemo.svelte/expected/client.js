import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import CardNav from '$lib/components/library/Components/CardNav/CardNav.svelte';
import source from '$lib/components/library/Components/CardNav/CardNav.svelte?raw';
import logoLight from '$lib/assets/logo/svelte-bits-icon-logo-black.svg';
import logoDark from '$lib/assets/logo/svelte-bits-icon-logo.svg';

var root = $.from_html(`<div class="demo-container demo-container-dots"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Card Nav</h1> <!>`, 1);

export default function CardNavDemo($$anchor) {
	const DEFAULTS = { theme: 'light', ease: 'power3.out' };
	let theme = $.state($.proxy(DEFAULTS.theme));
	let ease = $.state($.proxy(DEFAULTS.ease));
	let key = $.state(0);

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

	const currentTheme = $.derived(() => themeConfigs[$.get(theme)]);
	const hasChanges = $.derived(() => $.get(theme) !== DEFAULTS.theme || $.get(ease) !== DEFAULTS.ease);

	function reset() {
		$.set(theme, DEFAULTS.theme, true);
		$.set(ease, DEFAULTS.ease, true);
		$.update(key);
	}

	const usage = $.derived(() => `<CardNav logo={logo} items={items} ease="${$.get(ease)}" baseColor="${$.get(currentTheme).baseColor}" />`);

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

	var fragment = root_2();

	$.head('1r4546x', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Card Nav - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(key) + $.get(theme), ($$anchor) => {
				CardNav($$anchor, {
					get logo() {
						return $.get(currentTheme).logo;
					},

					get items() {
						return items;
					},

					get baseColor() {
						return $.get(currentTheme).baseColor;
					},

					get menuColor() {
						return $.get(currentTheme).menuColor;
					},

					get buttonBgColor() {
						return $.get(currentTheme).buttonBgColor;
					},

					get buttonTextColor() {
						return $.get(currentTheme).buttonTextColor;
					},

					get ease() {
						return $.get(ease);
					}
				});
			});

			$.reset(div);
			$.template_effect(() => $.set_style(div, `position:relative;height:550px;overflow:hidden;background:${$.get(currentTheme).backgroundColor ?? ''};`));
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'card-nav',
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

					PreviewSelect(node_2, {
						title: 'Example',
						get value() {
							return $.get(theme);
						},

						options: [
							{ label: 'Light Mode', value: 'light' },
							{ label: 'Dark Mode', value: 'dark' },
							{ label: 'Colorful', value: 'color' }
						],

						onChange: (v) => {
							$.set(theme, v, true);
							$.update(key);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSelect(node_3, {
						title: 'Ease',
						get value() {
							return $.get(ease);
						},

						options: [
							{ label: 'power3.out', value: 'power3.out' },
							{ label: 'back.out(1.7)', value: 'back.out(1.7)' },
							{ label: 'elastic.out(1, 0.8)', value: 'elastic.out(1, 0.8)' },
							{ label: 'circ.out', value: 'circ.out' }
						],

						onChange: (v) => {
							$.set(ease, v, true);
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
			componentName: 'CardNav',
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