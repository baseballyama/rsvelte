import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { mdiFileDocument, mdiPalette } from '@mdi/js';
import { siGithub } from 'simple-icons';
import TinyGesture from 'tinygesture';
import materialDarker from 'svelte-highlight/styles/material-darker';
import { assets } from '$app/paths';
import { page } from '$app/stores';
import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
import Drawer, { Content, Scrim, AppContent } from '@smui/drawer';
import IconButton from '@smui/icon-button';
import Menu, { SelectionGroup, SelectionGroupIcon } from '@smui/menu';
import List, { Item, Text, Separator } from '@smui/list';
import { Icon } from '@smui/common';

var root = $.from_html(`<link rel="preload" as="style"/> <link rel="preload" as="style"/>`, 1);
var root_1 = $.from_html(`<link rel="stylesheet" media="screen"/> <link rel="stylesheet" media="screen"/>`, 1);
var root_2 = $.from_html(`<link rel="stylesheet" media="screen and (prefers-color-scheme: dark)"/> <link rel="stylesheet" media="screen and (prefers-color-scheme: dark)"/>`, 1);
var root_3 = $.from_html(`<link rel="stylesheet"/> <link rel="stylesheet"/> <!>`, 1);
var root_4 = $.from_html(`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/itmatters@2.0.1/index.css"/>`);
var root_5 = $.from_html(`<link rel="stylesheet"/> <link rel="stylesheet"/> <!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_svg(`<path fill="currentColor" class="svelte-t11jdj"></path>`);
var root_8 = $.from_html(`<i class="material-icons svelte-t11jdj">check</i>`);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_10 = $.from_html(`<!> <div style="display: inline-block;" class="svelte-t11jdj"><!> <!></div>`, 1);
var root_11 = $.from_html(`<main class="demo-main-content svelte-t11jdj"><!></main>`);
var root_12 = $.from_html(`<!> <div class="drawer-container svelte-t11jdj"><!> <!> <!></div>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const iframe = $.derived(() => $page().url.pathname.includes('/iframe'));
	let drawer = $.state(void 0);
	let mainContent = $.state(void 0);
	let miniWindow = $.state(false);
	let drawerOpen = $.state(false);
	let drawerGesture;
	let mainContentGesture;

	const themes = [
		{ label: 'Material', value: 'material' },
		{ label: 'Fixation', value: 'fixation' },
		{ label: 'Muted', value: 'muted' },
		{ label: 'Bubblegum', value: 'bubblegum' },
		{ label: 'Metro', value: 'metro' },
		{ label: 'Unity', value: 'unity' }
	];

	let themeMenu = $.state(void 0);
	let lightTheme = $.state(null);
	let theme = $.state(null);

	const sections = [
		{ name: 'Installation', route: '/INSTALL.md', indent: 0 },
		{ name: 'SvelteKit', route: '/SVELTEKIT.md', indent: 1 },
		{ name: 'Theming', route: '/THEMING.md', indent: 0 },
		{ name: 'Migrating', route: '/MIGRATING.md', indent: 0 },
		{ name: 'sep1', separator: true },
		{ name: 'Quick Guide', route: '/demo/quick-guide/', indent: 0 },
		{ name: 'sep2', separator: true },
		{
			name: 'Accordion',
			route: '/demo/accordion/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/accordion'
			]
		},
		{ name: 'Action Buttons', indent: 0 },
		{
			name: 'Button',
			route: '/demo/button/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/button'
			]
		},

		{
			name: 'Floating Action Button',
			route: '/demo/fab/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/fab'
			]
		},

		{
			name: 'Icon Button',
			route: '/demo/icon-button/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/icon-button'
			]
		},
		{ name: 'App Bars', indent: 0 },
		{
			name: 'Bottom App Bar',
			route: '/demo/bottom-app-bar/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/bottom-app-bar'
			]
		},

		{
			name: 'Top App Bar',
			route: '/demo/top-app-bar/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/top-app-bar'
			]
		},

		{
			name: 'Badge',
			route: '/demo/badge/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/badge'
			]
		},

		{
			name: 'Banner',
			route: '/demo/banner/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/banner'
			]
		},

		{
			name: 'Cards',
			route: '/demo/card/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/card'
			]
		},

		{
			name: 'Common',
			route: '/demo/common/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/common'
			]
		},

		{
			name: 'Data Table',
			route: '/demo/data-table/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/data-table'
			]
		},

		{
			name: 'Dialog',
			route: '/demo/dialog/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/dialog'
			]
		},

		{
			name: 'Drawer',
			route: '/demo/drawer/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/drawer'
			]
		},
		{ name: 'Elevation', route: '/demo/elevation/', indent: 0 },
		{
			name: 'Image List',
			route: '/demo/image-list/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/image-list'
			]
		},
		{ name: 'Inputs and Controls', indent: 0 },
		{
			name: 'Autocomplete',
			route: '/demo/autocomplete/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/autocomplete'
			]
		},

		{
			name: 'Checkbox',
			route: '/demo/checkbox/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/checkbox'
			]
		},

		{
			name: 'Chips',
			route: '/demo/chips/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/chips'
			]
		},

		{
			name: 'Chip Input',
			route: '/demo/chip-input/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/chip-input'
			]
		},

		{
			name: 'Form Field',
			route: '/demo/form-field/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/form-field'
			]
		},

		{
			name: 'Radio Button',
			route: '/demo/radio/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/radio'
			]
		},

		{
			name: 'Segmented Button',
			route: '/demo/segmented-button/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/segmented-button'
			]
		},

		{
			name: 'Select Menu',
			route: '/demo/select/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/select'
			]
		},

		{
			name: 'Slider',
			route: '/demo/slider/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/slider'
			]
		},

		{
			name: 'Switch',
			route: '/demo/switch/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/switch'
			]
		},

		{
			name: 'Text Field',
			route: '/demo/textfield/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/textfield'
			]
		},

		{
			name: 'Layout Grid',
			route: '/demo/layout-grid/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/layout-grid'
			]
		},

		{
			name: 'List',
			route: '/demo/list/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/list'
			]
		},

		{
			name: 'Menu Surface',
			route: '/demo/menu-surface/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/menu-surface'
			]
		},

		{
			name: 'Menu',
			route: '/demo/menu/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/menu'
			]
		},

		{
			name: 'Paper',
			route: '/demo/paper/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/paper'
			]
		},
		{ name: 'Progress Indicators', indent: 0 },
		{
			name: 'Circular Progress',
			route: '/demo/circular-progress/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/circular-progress'
			]
		},

		{
			name: 'Linear Progress',
			route: '/demo/linear-progress/',
			indent: 1,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/linear-progress'
			]
		},

		{
			name: 'Ripple',
			route: '/demo/ripple/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/ripple'
			]
		},

		{
			name: 'Snackbar',
			route: '/demo/snackbar/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/snackbar',
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/snackbar/kitchen'
			]
		},

		{
			name: 'Tabs',
			route: '/demo/tabs/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/tab',
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/tab-bar'
			]
		},

		{
			name: 'Tooltip',
			route: '/demo/tooltip/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/tooltip'
			]
		},

		{
			name: 'Touch Target',
			route: '/demo/touch-target/',
			indent: 0,
			repos: [
				'https://github.com/hperrin/svelte-material-ui/tree/master/packages/touch-target'
			]
		},
		{ name: 'Typography', route: '/demo/typography/', indent: 0 }
	];

	const activeSection = $.derived(() => sections.find((section) => 'route' in section && routesEqual(section.route ?? '', $page().url.pathname)));
	let previousPagePath = undefined;

	$.user_effect(() => {
		if ($.get(mainContent) && previousPagePath !== $page().url.pathname) {
			$.set(drawerOpen, false);

			const hashEl = window.location.hash && document.querySelector(window.location.hash);
			const top = hashEl && hashEl.offsetTop || 0;

			$.get(mainContent).scrollTop = top;
			previousPagePath = $page().url.pathname;
		}
	});

	onMount(() => setTimeout(setMiniWindow, 0));

	onMount(() => {
		if ($.get(mainContent)) {
			mainContentGesture = new TinyGesture($.get(mainContent), { mouseSupport: false });

			let touchStartX = 0;

			mainContentGesture.on('panstart', () => {
				touchStartX = mainContentGesture.touchStartX;
			});

			mainContentGesture.on('swiperight', () => {
				if (touchStartX <= 40) {
					$.set(drawerOpen, true);
				}
			});
		}

		if ($.get(drawer)) {
			drawerGesture = new TinyGesture($.get(drawer).getElement(), { mouseSupport: false });

			drawerGesture.on('swipeleft', () => {
				$.set(drawerOpen, false);
			});
		}

		return () => {
			if (mainContentGesture) {
				mainContentGesture.destroy();
			}

			if (drawerGesture) {
				drawerGesture.destroy();
			}
		};
	});

	function routesEqual(a, b) {
		return (a.endsWith('/') ? a.slice(0, -1) : a) === (b.endsWith('/') ? b.slice(0, -1) : b);
	}

	function setMiniWindow() {
		if (typeof window !== 'undefined') {
			$.set(miniWindow, window.innerWidth < 720);
		}
	}

	var fragment_7 = $.comment();

	$.event('resize', $.window, setMiniWindow);

	$.head('t11jdj', ($$anchor) => {
		var fragment = root_5();
		var link = $.first_child(fragment);
		var link_1 = $.sibling(link, 2);
		var node = $.sibling(link_1, 2);

		$.html(node, () => materialDarker);

		var node_1 = $.sibling(node, 2);

		$.each(node_1, 17, () => themes, $.index, ($$anchor, theme, $$index, $$array) => {
			var fragment_1 = root();
			var link_2 = $.first_child(fragment_1);
			var link_3 = $.sibling(link_2, 2);

			$.template_effect(() => {
				$.set_attribute(link_2, 'href', `${assets ?? ''}/smui-${$.get(theme).value ?? ''}.css`);
				$.set_attribute(link_3, 'href', `${assets ?? ''}/smui-${$.get(theme).value ?? ''}-dark.css`);
			});

			$.append($$anchor, fragment_1);
		});

		var node_2 = $.sibling(node_1, 2);

		{
			var consequent_2 = ($$anchor) => {
				var fragment_2 = root_3();
				var link_4 = $.first_child(fragment_2);
				var link_5 = $.sibling(link_4, 2);
				var node_3 = $.sibling(link_5, 2);

				{
					var consequent = ($$anchor) => {
						var fragment_3 = root_1();
						var link_6 = $.first_child(fragment_3);
						var link_7 = $.sibling(link_6, 2);

						$.template_effect(() => {
							$.set_attribute(link_6, 'href', `${assets ?? ''}/smui-${$.get(theme) ?? ''}-dark.css`);
							$.set_attribute(link_7, 'href', `${assets ?? ''}/site-${$.get(theme) ?? ''}-dark.css`);
						});

						$.append($$anchor, fragment_3);
					};

					var consequent_1 = ($$anchor) => {
						var fragment_4 = root_2();
						var link_8 = $.first_child(fragment_4);
						var link_9 = $.sibling(link_8, 2);

						$.template_effect(() => {
							$.set_attribute(link_8, 'href', `${assets ?? ''}/smui-${$.get(theme) ?? ''}-dark.css`);
							$.set_attribute(link_9, 'href', `${assets ?? ''}/site-${$.get(theme) ?? ''}-dark.css`);
						});

						$.append($$anchor, fragment_4);
					};

					$.if(node_3, ($$render) => {
						if ($.get(lightTheme) === false) $$render(consequent); else if ($.get(lightTheme) !== true) $$render(consequent_1, 1);
					});
				}

				$.template_effect(() => {
					$.set_attribute(link_4, 'href', `${assets ?? ''}/smui-${$.get(theme) ?? ''}.css`);
					$.set_attribute(link_5, 'href', `${assets ?? ''}/site-${$.get(theme) ?? ''}.css`);
				});

				$.append($$anchor, fragment_2);
			};

			var consequent_3 = ($$anchor) => {
				var fragment_5 = root_1();
				var link_10 = $.first_child(fragment_5);
				var link_11 = $.sibling(link_10, 2);

				$.template_effect(() => {
					$.set_attribute(link_10, 'href', `${assets ?? ''}/smui-dark.css`);
					$.set_attribute(link_11, 'href', `${assets ?? ''}/site-dark.css`);
				});

				$.append($$anchor, fragment_5);
			};

			var consequent_4 = ($$anchor) => {
				var fragment_6 = root_2();
				var link_12 = $.first_child(fragment_6);
				var link_13 = $.sibling(link_12, 2);

				$.template_effect(() => {
					$.set_attribute(link_12, 'href', `${assets ?? ''}/smui-dark.css`);
					$.set_attribute(link_13, 'href', `${assets ?? ''}/site-dark.css`);
				});

				$.append($$anchor, fragment_6);
			};

			$.if(node_2, ($$render) => {
				if ($.get(theme)) $$render(consequent_2); else if ($.get(lightTheme) === false) $$render(consequent_3, 1); else if ($.get(lightTheme) !== true) $$render(consequent_4, 2);
			});
		}

		var node_4 = $.sibling(node_2, 2);

		{
			var consequent_5 = ($$anchor) => {
				var link_14 = root_4();

				$.append($$anchor, link_14);
			};

			$.if(node_4, ($$render) => {
				if (!$.get(iframe)) $$render(consequent_5);
			});
		}

		$.template_effect(() => {
			$.set_attribute(link, 'href', `${assets ?? ''}/smui.css`);
			$.set_attribute(link_1, 'href', `${assets ?? ''}/site.css`);
		});

		$.append($$anchor, fragment);
	});

	var node_5 = $.first_child(fragment_7);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_8 = $.comment();
			var node_6 = $.first_child(fragment_8);

			$.snippet(node_6, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_8);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_9 = root_12();
			var node_7 = $.first_child(fragment_9);

			TopAppBar(node_7, {
				variant: 'static',
				class: 'demo-top-app-bar',
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					Row($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root_6();
							var node_8 = $.first_child(fragment_11);

							Section(node_8, {
								children: ($$anchor, $$slotProps) => {
									var fragment_12 = root_6();
									var node_9 = $.first_child(fragment_12);

									{
										var consequent_7 = ($$anchor) => {
											IconButton($$anchor, {
												onclick: () => $.set(drawerOpen, !$.get(drawerOpen)),
												children: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														class: 'material-icons',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text('menu');

															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});
										};

										$.if(node_9, ($$render) => {
											if ($.get(miniWindow)) $$render(consequent_7);
										});
									}

									var node_10 = $.sibling(node_9, 2);

									{
										let $0 = $.derived(() => $.get(miniWindow) ? 'padding-left: 0;' : '');

										Title(node_10, {
											tag: 'a',
											href: '/',
											class: 'mdc-theme--on-surface',
											get style() {
												return `color: inherit; ${$.get($0) ?? ''}`;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, $.get(miniWindow) ? 'SMUI' : 'Svelte Material UI'));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									}

									$.append($$anchor, fragment_12);
								},
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_8, 2);

							Section(node_11, {
								align: 'end',
								toolbar: true,
								style: 'color: var(--mdc-on-surface, #000);',
								children: ($$anchor, $$slotProps) => {
									var fragment_16 = root_10();
									var node_12 = $.first_child(fragment_16);

									$.each(
										node_12,
										17,
										() => $.get(activeSection) && $.get(activeSection).repos || [],
										$.index,
										($$anchor, repo) => {
											{
												let $0 = $.derived(() => $.get(repo).split('/').slice(-1)[0]);

												IconButton($$anchor, {
													get href() {
														return $.get(repo);
													},
													target: '_blank',
													get title() {
														return `View Docs: ${$.get($0) ?? ''}`;
													},

													children: ($$anchor, $$slotProps) => {
														Icon($$anchor, {
															tag: 'svg',
															viewBox: '0 0 24 24',
															children: ($$anchor, $$slotProps) => {
																var path = root_7();

																$.template_effect(() => $.set_attribute(path, 'd', mdiFileDocument));
																$.append($$anchor, path);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});
											}
										},
										($$anchor) => {
											IconButton($$anchor, {
												href: 'https://github.com/hperrin/svelte-material-ui',
												title: 'SMUI on GitHub',
												children: ($$anchor, $$slotProps) => {
													Icon($$anchor, {
														tag: 'svg',
														viewBox: '0 0 24 24',
														children: ($$anchor, $$slotProps) => {
															var path_1 = root_7();

															$.template_effect(() => $.set_attribute(path_1, 'd', siGithub.path));
															$.append($$anchor, path_1);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});
										}
									);

									var div = $.sibling(node_12, 2);
									var node_13 = $.child(div);

									IconButton(node_13, {
										onclick: () => $.get(themeMenu)?.setOpen(true),
										title: 'Pick a theme or toggle dark mode.',
										children: ($$anchor, $$slotProps) => {
											Icon($$anchor, {
												tag: 'svg',
												viewBox: '0 0 24 24',
												children: ($$anchor, $$slotProps) => {
													var path_2 = root_7();

													$.template_effect(() => $.set_attribute(path_2, 'd', mdiPalette));
													$.append($$anchor, path_2);
												},
												$$slots: { default: true }
											});
										},
										$$slots: { default: true }
									});

									var node_14 = $.sibling(node_13, 2);

									$.bind_this(
										Menu(node_14, {
											children: ($$anchor, $$slotProps) => {
												List($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_23 = root_9();
														var node_15 = $.first_child(fragment_23);

														SelectionGroup(node_15, {
															children: ($$anchor, $$slotProps) => {
																var fragment_24 = root_6();
																var node_16 = $.first_child(fragment_24);

																{
																	let $0 = $.derived(() => $.get(lightTheme) == null);

																	Item(node_16, {
																		onSMUIAction: () => $.set(lightTheme, null),
																		get selected() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_25 = root_6();
																			var node_17 = $.first_child(fragment_25);

																			SelectionGroupIcon(node_17, {
																				children: ($$anchor, $$slotProps) => {
																					var i = root_8();

																					$.append($$anchor, i);
																				},
																				$$slots: { default: true }
																			});

																			var node_18 = $.sibling(node_17, 2);

																			Text(node_18, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_2 = $.text('Follow System');

																					$.append($$anchor, text_2);
																				},
																				$$slots: { default: true }
																			});

																			$.append($$anchor, fragment_25);
																		},
																		$$slots: { default: true }
																	});
																}

																var node_19 = $.sibling(node_16, 2);

																$.each(
																	node_19,
																	16,
																	() => [
																		{ label: 'Light', value: true },
																		{ label: 'Dark', value: false }
																	],
																	$.index,
																	($$anchor, item) => {
																		{
																			let $0 = $.derived(() => $.get(lightTheme) === item.value);

																			Item($$anchor, {
																				onSMUIAction: () => $.set(lightTheme, item.value, true),
																				get selected() {
																					return $.get($0);
																				},

																				children: ($$anchor, $$slotProps) => {
																					var fragment_27 = root_6();
																					var node_20 = $.first_child(fragment_27);

																					SelectionGroupIcon(node_20, {
																						children: ($$anchor, $$slotProps) => {
																							var i_1 = root_8();

																							$.append($$anchor, i_1);
																						},
																						$$slots: { default: true }
																					});

																					var node_21 = $.sibling(node_20, 2);

																					Text(node_21, {
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_3 = $.text();

																							$.template_effect(() => $.set_text(text_3, item.label));
																							$.append($$anchor, text_3);
																						},
																						$$slots: { default: true }
																					});

																					$.append($$anchor, fragment_27);
																				},
																				$$slots: { default: true }
																			});
																		}
																	}
																);

																$.append($$anchor, fragment_24);
															},
															$$slots: { default: true }
														});

														var node_22 = $.sibling(node_15, 2);

														Separator(node_22, {});

														var node_23 = $.sibling(node_22, 2);

														SelectionGroup(node_23, {
															children: ($$anchor, $$slotProps) => {
																var fragment_29 = root_6();
																var node_24 = $.first_child(fragment_29);

																{
																	let $0 = $.derived(() => $.get(theme) == null);

																	Item(node_24, {
																		onSMUIAction: () => $.set(theme, null),
																		get selected() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_30 = root_6();
																			var node_25 = $.first_child(fragment_30);

																			SelectionGroupIcon(node_25, {
																				children: ($$anchor, $$slotProps) => {
																					var i_2 = root_8();

																					$.append($$anchor, i_2);
																				},
																				$$slots: { default: true }
																			});

																			var node_26 = $.sibling(node_25, 2);

																			Text(node_26, {
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_4 = $.text('Svelte');

																					$.append($$anchor, text_4);
																				},
																				$$slots: { default: true }
																			});

																			$.append($$anchor, fragment_30);
																		},
																		$$slots: { default: true }
																	});
																}

																var node_27 = $.sibling(node_24, 2);

																$.each(node_27, 17, () => themes, $.index, ($$anchor, item) => {
																	{
																		let $0 = $.derived(() => $.get(theme) === $.get(item).value);

																		Item($$anchor, {
																			onSMUIAction: () => $.set(theme, $.get(item).value, true),
																			get selected() {
																				return $.get($0);
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_32 = root_6();
																				var node_28 = $.first_child(fragment_32);

																				SelectionGroupIcon(node_28, {
																					children: ($$anchor, $$slotProps) => {
																						var i_3 = root_8();

																						$.append($$anchor, i_3);
																					},
																					$$slots: { default: true }
																				});

																				var node_29 = $.sibling(node_28, 2);

																				Text(node_29, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_5 = $.text();

																						$.template_effect(() => $.set_text(text_5, $.get(item).label));
																						$.append($$anchor, text_5);
																					},
																					$$slots: { default: true }
																				});

																				$.append($$anchor, fragment_32);
																			},
																			$$slots: { default: true }
																		});
																	}
																});

																$.append($$anchor, fragment_29);
															},
															$$slots: { default: true }
														});

														var node_30 = $.sibling(node_23, 2);

														Separator(node_30, {});

														var node_31 = $.sibling(node_30, 2);

														Item(node_31, {
															tag: 'a',
															href: '/THEMING.md',
															style: 'color: inherit;',
															children: ($$anchor, $$slotProps) => {
																Text($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_6 = $.text('Learn about theming');

																		$.append($$anchor, text_6);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});

														var node_32 = $.sibling(node_31, 2);

														Item(node_32, {
															tag: 'a',
															href: 'https://github.com/hperrin/svelte-material-ui/tree/master/packages/site/src/theme',
															target: '_blank',
															rel: 'noreferrer noorigin',
															style: 'color: inherit;',
															children: ($$anchor, $$slotProps) => {
																Text($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text('See the theme source');

																		$.append($$anchor, text_7);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});

														$.append($$anchor, fragment_23);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										}),
										($$value) => $.set(themeMenu, $$value, true),
										() => $.get(themeMenu)
									);

									$.reset(div);
									$.append($$anchor, fragment_16);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var div_1 = $.sibling(node_7, 2);
			var node_33 = $.child(div_1);

			{
				let $0 = $.derived(() => $.get(miniWindow) ? 'modal' : undefined);
				let $1 = $.derived(() => $.get(miniWindow) ? 'demo-drawer-adjust' : 'hide-initial-small');

				$.bind_this(
					Drawer(node_33, {
						get variant() {
							return $.get($0);
						},

						get class() {
							return `demo-drawer mdc-theme--secondary-bg ${$.get($1) ?? ''}`;
						},

						get open() {
							return $.get(drawerOpen);
						},

						set open($$value) {
							$.set(drawerOpen, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							Content($$anchor, {
								style: 'padding-bottom: 44px;',
								children: ($$anchor, $$slotProps) => {
									List($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_38 = $.comment();
											var node_34 = $.first_child(fragment_38);

											$.each(node_34, 17, () => sections, (section) => section.name, ($$anchor, section) => {
												var fragment_39 = $.comment();
												var node_35 = $.first_child(fragment_39);

												{
													var consequent_8 = ($$anchor) => {
														Separator($$anchor, {});
													};

													var alternate = ($$anchor) => {
														{
															let $0 = $.derived(() => !('route' in $.get(section) || 'shortcut' in $.get(section)));

															let $1 = $.derived(() => 'route' in $.get(section)
																? $.get(section).route
																: 'shortcut' in $.get(section) ? $.get(section).shortcut : undefined);

															let $2 = $.derived(() => $.get(section).route === $.get(activeSection)?.route);

															let $3 = $.derived(() => $.get(section).indent
																? 'margin-left: ' + $.get(section).indent * 25 + 'px;'
																: '');

															Item($$anchor, {
																get nonInteractive() {
																	return $.get($0);
																},

																get href() {
																	return $.get($1);
																},

																get activated() {
																	return $.get($2);
																},

																get style() {
																	return $.get($3);
																},

																children: ($$anchor, $$slotProps) => {
																	Text($$anchor, {
																		class: 'mdc-theme--on-secondary',
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text();

																			$.template_effect(() => $.set_text(text_8, $.get(section).name));
																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																},
																$$slots: { default: true }
															});
														}
													};

													$.if(node_35, ($$render) => {
														if ('separator' in $.get(section)) $$render(consequent_8); else $$render(alternate, -1);
													});
												}

												$.append($$anchor, fragment_39);
											});

											$.append($$anchor, fragment_38);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					}),
					($$value) => $.set(drawer, $$value, true),
					() => $.get(drawer)
				);
			}

			var node_36 = $.sibling(node_33, 2);

			{
				var consequent_9 = ($$anchor) => {
					Scrim($$anchor, {});
				};

				$.if(node_36, ($$render) => {
					if ($.get(miniWindow)) $$render(consequent_9);
				});
			}

			var node_37 = $.sibling(node_36, 2);

			AppContent(node_37, {
				class: 'demo-app-content',
				children: ($$anchor, $$slotProps) => {
					var main = root_11();
					var node_38 = $.child(main);

					$.snippet(node_38, () => $$props.children ?? $.noop);
					$.reset(main);
					$.bind_this(main, ($$value) => $.set(mainContent, $$value), () => $.get(mainContent));
					$.append($$anchor, main);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, fragment_9);
		};

		$.if(node_5, ($$render) => {
			if ($.get(iframe)) $$render(consequent_6); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment_7);
	$.pop();
	$$cleanup();
}