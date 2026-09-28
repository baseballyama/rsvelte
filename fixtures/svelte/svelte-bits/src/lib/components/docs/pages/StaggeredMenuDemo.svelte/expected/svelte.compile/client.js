import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="demo-container demo-container-dots" style="position:relative;height:800px;overflow:hidden;padding:0;background:#1a1a1a;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Staggered Menu</h1> <!>`, 1);

export default function StaggeredMenuDemo($$anchor) {
	const DEFAULTS = {
		displaySocials: true,
		accentColor: '#FF8A4C',
		menuButtonColor: '#ffffff',
		position: 'right'
	};

	let displaySocials = $.state($.proxy(DEFAULTS.displaySocials));
	let accentColor = $.state($.proxy(DEFAULTS.accentColor));
	let menuButtonColor = $.state($.proxy(DEFAULTS.menuButtonColor));
	let position = $.state($.proxy(DEFAULTS.position));
	let menuKey = $.state(0);
	const hasChanges = $.derived(() => $.get(displaySocials) !== DEFAULTS.displaySocials || $.get(accentColor) !== DEFAULTS.accentColor || $.get(menuButtonColor) !== DEFAULTS.menuButtonColor || $.get(position) !== DEFAULTS.position);

	function reset() {
		$.set(displaySocials, DEFAULTS.displaySocials, true);
		$.set(accentColor, DEFAULTS.accentColor, true);
		$.set(menuButtonColor, DEFAULTS.menuButtonColor, true);
		$.set(position, DEFAULTS.position, true);
		$.update(menuKey);
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

	var fragment = root_2();

	$.head('1kxi7nz', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Staggered Menu - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(menuKey), ($$anchor) => {
				{
					let $0 = $.derived(() => $.get(position) === 'left' ? '#fff' : '#000');

					StaggeredMenu($$anchor, {
						get logoUrl() {
							return logo;
						},

						get items() {
							return items;
						},

						get socialItems() {
							return socialItems;
						},

						get openMenuButtonColor() {
							return $.get($0);
						},

						get displaySocials() {
							return $.get(displaySocials);
						},

						get accentColor() {
							return $.get(accentColor);
						},

						get menuButtonColor() {
							return $.get(menuButtonColor);
						},

						get position() {
							return $.get(position);
						}
					});
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'staggered-menu',
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
						title: 'Position',
						get value() {
							return $.get(position);
						},

						options: [
							{ value: 'right', label: 'Right' },
							{ value: 'left', label: 'Left' }
						],

						onChange: (v) => {
							$.set(position, v, true);
							$.update(menuKey);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewColorPicker(node_3, {
						title: 'Accent Color',
						get color() {
							return $.get(accentColor);
						},
						onChange: (v) => $.set(accentColor, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Menu Button Color',
						get color() {
							return $.get(menuButtonColor);
						},
						onChange: (v) => $.set(menuButtonColor, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSwitch(node_5, {
						title: 'Display Socials',
						get checked() {
							return $.get(displaySocials);
						},
						onChange: (v) => $.set(displaySocials, v, true)
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
			componentName: 'StaggeredMenu',
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