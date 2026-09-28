import * as $ from 'svelte/internal/server';
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

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { children } = $$props;
		const iframe = $.derived(() => $.store_get($$store_subs ??= {}, '$page', page).url.pathname.includes('/iframe'));
		let drawer = void 0;
		let mainContent = void 0;
		let miniWindow = false;
		let drawerOpen = false;
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

		let themeMenu = void 0;
		let lightTheme = null;
		let theme = null;

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

		const activeSection = $.derived(() => sections.find((section) => 'route' in section && routesEqual(section.route ?? '', $.store_get($$store_subs ??= {}, '$page', page).url.pathname)));
		let previousPagePath = undefined;

		onMount(() => setTimeout(setMiniWindow, 0));

		onMount(() => {
			if (mainContent) {
				mainContentGesture = new TinyGesture(mainContent, { mouseSupport: false });

				let touchStartX = 0;

				mainContentGesture.on('panstart', () => {
					touchStartX = mainContentGesture.touchStartX;
				});

				mainContentGesture.on('swiperight', () => {
					if (touchStartX <= 40) {
						drawerOpen = true;
					}
				});
			}

			if (drawer) {
				drawerGesture = new TinyGesture(drawer.getElement(), { mouseSupport: false });

				drawerGesture.on('swipeleft', () => {
					drawerOpen = false;
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
				miniWindow = window.innerWidth < 720;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('t11jdj', $$renderer, ($$renderer) => {
				$$renderer.push(`<link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/smui.css`)}/> <link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/site.css`)}/> ${$.html(materialDarker)} <!--[-->`);

				const each_array = $.ensure_array_like(themes);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let theme = each_array[$$index];

					$$renderer.push(`<link rel="preload"${$.attr('href', `${$.stringify(assets)}/smui-${$.stringify(theme.value)}.css`)} as="style"/> <link rel="preload"${$.attr('href', `${$.stringify(assets)}/smui-${$.stringify(theme.value)}-dark.css`)} as="style"/>`);
				}

				$$renderer.push(`<!--]--> `);

				if (theme) {
					$$renderer.push(`<!--[0--><link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/smui-${$.stringify(theme)}.css`)}/> <link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/site-${$.stringify(theme)}.css`)}/> `);

					if (lightTheme === false) {
						$$renderer.push(`<!--[0--><link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/smui-${$.stringify(theme)}-dark.css`)} media="screen"/> <link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/site-${$.stringify(theme)}-dark.css`)} media="screen"/>`);
					} else if (lightTheme !== true) {
						$$renderer.push(`<!--[1--><link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/smui-${$.stringify(theme)}-dark.css`)} media="screen and (prefers-color-scheme: dark)"/> <link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/site-${$.stringify(theme)}-dark.css`)} media="screen and (prefers-color-scheme: dark)"/>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else if (lightTheme === false) {
					$$renderer.push(`<!--[1--><link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/smui-dark.css`)} media="screen"/> <link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/site-dark.css`)} media="screen"/>`);
				} else if (lightTheme !== true) {
					$$renderer.push(`<!--[2--><link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/smui-dark.css`)} media="screen and (prefers-color-scheme: dark)"/> <link rel="stylesheet"${$.attr('href', `${$.stringify(assets)}/site-dark.css`)} media="screen and (prefers-color-scheme: dark)"/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (!iframe()) {
					$$renderer.push(`<!--[0--><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/itmatters@2.0.1/index.css"/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			});

			if (iframe()) {
				$$renderer.push('<!--[0-->');
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');

				TopAppBar($$renderer, {
					variant: 'static',
					class: 'demo-top-app-bar',
					color: 'primary',
					children: ($$renderer) => {
						Row($$renderer, {
							children: ($$renderer) => {
								Section($$renderer, {
									children: ($$renderer) => {
										if (miniWindow) {
											$$renderer.push('<!--[0-->');

											IconButton($$renderer, {
												onclick: () => drawerOpen = !drawerOpen,
												children: ($$renderer) => {
													Icon($$renderer, {
														class: 'material-icons',
														children: ($$renderer) => {
															$$renderer.push(`<!---->menu`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});
										} else {
											$$renderer.push('<!--[-1-->');
										}

										$$renderer.push(`<!--]--> `);

										Title($$renderer, {
											tag: 'a',
											href: '/',
											class: 'mdc-theme--on-surface',
											style: `color: inherit; ${miniWindow ? 'padding-left: 0;' : ''}`,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(miniWindow ? 'SMUI' : 'Svelte Material UI')}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Section($$renderer, {
									align: 'end',
									toolbar: true,
									style: 'color: var(--mdc-on-surface, #000);',
									children: ($$renderer) => {
										const each_array_1 = $.ensure_array_like(activeSection() && activeSection().repos || []);

										if (each_array_1.length !== 0) {
											$$renderer.push('<!--[-->');

											for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
												let repo = each_array_1[$$index_1];

												IconButton($$renderer, {
													href: repo,
													target: '_blank',
													title: `View Docs: ${$.stringify(repo.split('/').slice(-1)[0])}`,
													children: ($$renderer) => {
														Icon($$renderer, {
															tag: 'svg',
															viewBox: '0 0 24 24',
															children: ($$renderer) => {
																$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiFileDocument)} class="svelte-t11jdj"></path>`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});
											}
										} else {
											$$renderer.push('<!--[!-->');

											IconButton($$renderer, {
												href: 'https://github.com/hperrin/svelte-material-ui',
												title: 'SMUI on GitHub',
												children: ($$renderer) => {
													Icon($$renderer, {
														tag: 'svg',
														viewBox: '0 0 24 24',
														children: ($$renderer) => {
															$$renderer.push(`<path fill="currentColor"${$.attr('d', siGithub.path)} class="svelte-t11jdj"></path>`);
														},
														$$slots: { default: true }
													});
												},
												$$slots: { default: true }
											});
										}

										$$renderer.push(`<!--]--> <div style="display: inline-block;" class="svelte-t11jdj">`);

										IconButton($$renderer, {
											onclick: () => themeMenu?.setOpen(true),
											title: 'Pick a theme or toggle dark mode.',
											children: ($$renderer) => {
												Icon($$renderer, {
													tag: 'svg',
													viewBox: '0 0 24 24',
													children: ($$renderer) => {
														$$renderer.push(`<path fill="currentColor"${$.attr('d', mdiPalette)} class="svelte-t11jdj"></path>`);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										Menu($$renderer, {
											children: ($$renderer) => {
												List($$renderer, {
													children: ($$renderer) => {
														SelectionGroup($$renderer, {
															children: ($$renderer) => {
																Item($$renderer, {
																	onSMUIAction: () => lightTheme = null,
																	selected: lightTheme == null,
																	children: ($$renderer) => {
																		SelectionGroupIcon($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<i class="material-icons svelte-t11jdj">check</i>`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> `);

																		Text($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Follow System`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!---->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> <!--[-->`);

																const each_array_2 = $.ensure_array_like([
																	{ label: 'Light', value: true },
																	{ label: 'Dark', value: false }
																]);

																for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																	let item = each_array_2[$$index_2];

																	Item($$renderer, {
																		onSMUIAction: () => lightTheme = item.value,
																		selected: lightTheme === item.value,
																		children: ($$renderer) => {
																			SelectionGroupIcon($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<i class="material-icons svelte-t11jdj">check</i>`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----> `);

																			Text($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(item.label)}`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!---->`);
																		},
																		$$slots: { default: true }
																	});
																}

																$$renderer.push(`<!--]-->`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);
														Separator($$renderer, {});
														$$renderer.push(`<!----> `);

														SelectionGroup($$renderer, {
															children: ($$renderer) => {
																Item($$renderer, {
																	onSMUIAction: () => theme = null,
																	selected: theme == null,
																	children: ($$renderer) => {
																		SelectionGroupIcon($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<i class="material-icons svelte-t11jdj">check</i>`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!----> `);

																		Text($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Svelte`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push(`<!---->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> <!--[-->`);

																const each_array_3 = $.ensure_array_like(themes);

																for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																	let item = each_array_3[$$index_3];

																	Item($$renderer, {
																		onSMUIAction: () => theme = item.value,
																		selected: theme === item.value,
																		children: ($$renderer) => {
																			SelectionGroupIcon($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<i class="material-icons svelte-t11jdj">check</i>`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!----> `);

																			Text($$renderer, {
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape(item.label)}`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push(`<!---->`);
																		},
																		$$slots: { default: true }
																	});
																}

																$$renderer.push(`<!--]-->`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);
														Separator($$renderer, {});
														$$renderer.push(`<!----> `);

														Item($$renderer, {
															tag: 'a',
															href: '/THEMING.md',
															style: 'color: inherit;',
															children: ($$renderer) => {
																Text($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Learn about theming`);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Item($$renderer, {
															tag: 'a',
															href: 'https://github.com/hperrin/svelte-material-ui/tree/master/packages/site/src/theme',
															target: '_blank',
															rel: 'noreferrer noorigin',
															style: 'color: inherit;',
															children: ($$renderer) => {
																Text($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->See the theme source`);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="drawer-container svelte-t11jdj">`);

				Drawer($$renderer, {
					variant: miniWindow ? 'modal' : undefined,
					class: `demo-drawer mdc-theme--secondary-bg ${miniWindow ? 'demo-drawer-adjust' : 'hide-initial-small'}`,
					get open() {
						return drawerOpen;
					},

					set open($$value) {
						drawerOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						Content($$renderer, {
							style: 'padding-bottom: 44px;',
							children: ($$renderer) => {
								List($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array_4 = $.ensure_array_like(sections);

										for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
											let section = each_array_4[$$index_4];

											if ('separator' in section) {
												$$renderer.push('<!--[0-->');
												Separator($$renderer, {});
											} else {
												$$renderer.push('<!--[-1-->');

												Item($$renderer, {
													nonInteractive: !('route' in section || 'shortcut' in section),
													href: 'route' in section
														? section.route
														: 'shortcut' in section ? section.shortcut : undefined,
													activated: section.route === activeSection()?.route,
													style: section.indent ? 'margin-left: ' + section.indent * 25 + 'px;' : '',
													children: ($$renderer) => {
														Text($$renderer, {
															class: 'mdc-theme--on-secondary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(section.name)}`);
															},
															$$slots: { default: true }
														});
													},
													$$slots: { default: true }
												});
											}

											$$renderer.push(`<!--]-->`);
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (miniWindow) {
					$$renderer.push('<!--[0-->');
					Scrim($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				AppContent($$renderer, {
					class: 'demo-app-content',
					children: ($$renderer) => {
						$$renderer.push(`<main class="demo-main-content svelte-t11jdj">`);
						children?.($$renderer);
						$$renderer.push(`<!----></main>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}