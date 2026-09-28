import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="demo-container demo-container-dots"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Pill Nav</h1> <!>`, 1);

export default function PillNavDemo($$anchor) {
	const DEFAULTS = { theme: 'light', initialLoadAnimation: false };
	let theme = $.state('light');
	let initialLoadAnimation = $.state($.proxy(DEFAULTS.initialLoadAnimation));
	const hasChanges = $.derived(() => $.get(theme) !== DEFAULTS.theme || $.get(initialLoadAnimation) !== DEFAULTS.initialLoadAnimation);

	function reset() {
		$.set(theme, 'light');
		$.set(initialLoadAnimation, DEFAULTS.initialLoadAnimation, true);
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

	const current = $.derived(() => themeConfigs[$.get(theme)]);

	// Force remount on theme change so layout/animation re-runs.
	const navKey = $.derived(() => $.get(theme) + '-' + $.get(initialLoadAnimation));

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

	var fragment = root_2();

	$.head('19n83x4', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Pill Nav - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(navKey), ($$anchor) => {
				PillNav($$anchor, {
					get logo() {
						return $.get(current).logo;
					},

					get baseColor() {
						return $.get(current).baseColor;
					},

					get pillColor() {
						return $.get(current).pillColor;
					},

					get hoveredPillTextColor() {
						return $.get(current).hoveredPillTextColor;
					},

					get pillTextColor() {
						return $.get(current).pillTextColor;
					},

					get initialLoadAnimation() {
						return $.get(initialLoadAnimation);
					},

					items: [
						{ label: 'Home', href: '#' },
						{ label: 'About', href: '#about' },
						{ label: 'Contact', href: '#contact' }
					],
					activeHref: '#'
				});
			});

			$.reset(div);
			$.template_effect(() => $.set_style(div, `position:relative;height:300px;overflow:hidden;background:${$.get(current).backgroundColor ?? ''};`));
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'pill-nav',
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

					PreviewSelect(node_2, {
						title: 'Example',
						get options() {
							return themeOptions;
						},

						get value() {
							return $.get(theme);
						},
						onChange: (v) => $.set(theme, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSwitch(node_3, {
						title: 'Initial Load Animation',
						get checked() {
							return $.get(initialLoadAnimation);
						},
						onChange: (v) => $.set(initialLoadAnimation, v, true)
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
			componentName: 'PillNav',
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