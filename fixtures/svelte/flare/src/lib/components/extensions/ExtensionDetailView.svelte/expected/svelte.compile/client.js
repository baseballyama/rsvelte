import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button';
import Icon from '../Icon.svelte';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Separator } from '../ui/separator';
import * as Carousel from '$lib/components/ui/carousel/index.js';
import ActionBar from '$lib/components/nodes/shared/ActionBar.svelte';
import * as Popover from '$lib/components/ui/popover/index.js';
import * as Command from '$lib/components/ui/command/index.js';
import aiIcon from '$lib/assets/stars-square-1616x16@2x.png';
import KeyboardShortcut from '../KeyboardShortcut.svelte';
import { uiStore } from '$lib/ui.svelte';
import { viewManager } from '$lib/viewManager.svelte';

var root = $.from_html(`<!> <div class="text-muted-foreground flex items-center gap-1 text-sm"><div class="size-4"></div> <span>AI Extension</span></div>`, 1);
var root_1 = $.from_html(`<div class="ml-auto flex items-center rounded bg-[#4EF8A7]/15 px-2 text-[#4EF8A7]"><!> Installed</div>`);
var root_2 = $.from_html(`<button class="w-full cursor-pointer"><img class="h-[140px] rounded-lg bg-white/5 object-cover" loading="lazy"/></button>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<div class="flex items-start gap-3"><div><div class="mb-1 flex items-center gap-2 text-sm font-medium"><!> <span> </span></div> <p class="text-muted-foreground text-xs"> </p></div></div>`);
var root_5 = $.from_html(`Open README <!>`, 1);
var root_6 = $.from_html(`<div><h2 class="text-muted-foreground mb-1 text-xs font-medium uppercase">README</h2> <!></div>`);
var root_7 = $.from_html(`<a target="_blank" class="flex items-center gap-2" rel="noopener noreferrer"><!></a>`);
var root_8 = $.from_html(`<span class="rounded-full bg-blue-900/50 px-2 py-0.5 text-xs font-semibold text-blue-300"> </span>`);
var root_9 = $.from_html(`<div><h3 class="text-muted-foreground mb-1 text-xs font-medium uppercase">Categories</h3> <div class="flex flex-wrap gap-1.5"></div></div>`);
var root_10 = $.from_html(`View Code <!>`, 1);
var root_11 = $.from_html(`<div><h3 class="text-muted-foreground mb-1 text-xs font-medium uppercase">Source Code</h3> <!></div>`);
var root_12 = $.from_html(`Open Commands... <!>`, 1);
var root_13 = $.from_html(`<div class="flex items-center gap-2"><!> <span> </span></div>`);
var root_14 = $.from_html(`<!> <!>`, 1);
var root_15 = $.from_html(` <!>`, 1);
var root_16 = $.from_html(`<div class="flex grow flex-col gap-6 overflow-x-hidden overflow-y-auto p-6"><div class="flex items-center gap-6"><!> <div><h1 class="text-lg font-bold"> </h1> <div class="mt-2 flex items-center gap-2"><div class="flex items-center gap-1 text-sm"><!> <span> </span></div> <!> <div class="flex items-center gap-1 text-sm"><!> <span> </span></div> <!></div></div> <!></div> <!> <!> <!> <div class="grid grid-cols-[2fr_auto_1fr] gap-x-4"><div class="flex flex-col gap-4"><div><h2 class="text-muted-foreground mb-1 text-xs font-medium uppercase">Description</h2> <p> </p></div> <!> <div><h2 class="text-muted-foreground mb-2 text-xs font-medium uppercase">Commands</h2> <div class="flex flex-col gap-4"></div></div></div> <!> <div class="space-y-8"><!> <div><h3 class="text-muted-foreground mb-1 text-xs font-medium uppercase">Last updated</h3> <p> </p></div> <div><h3 class="text-muted-foreground mb-1 text-xs font-medium uppercase">Contributors</h3> <div class="flex flex-wrap gap-2"></div></div> <!> <!></div></div></div> <!>`, 1);

export default function ExtensionDetailView($$anchor, $$props) {
	$.push($$props, true);

	let openCommandsPopover = $.state(false);

	function formatTimeAgo(timestamp) {
		const date = new Date(timestamp * 1000);
		const now = new Date();
		const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		let interval = seconds / 31536000;

		if (interval > 1) {
			const years = Math.floor(interval);

			return `${years} year${years > 1 ? 's' : ''} ago`;
		}

		interval = seconds / 2592000;

		if (interval > 1) {
			const months = Math.floor(interval);

			return `${months} month${months > 1 ? 's' : ''} ago`;
		}

		interval = seconds / 604800;

		if (interval > 1) {
			const weeks = Math.floor(interval);

			return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
		}

		interval = seconds / 86400;

		if (interval > 1) {
			const days = Math.floor(interval);

			return `${days} day${days > 1 ? 's' : ''} ago`;
		}

		interval = seconds / 3600;

		if (interval > 1) {
			const hours = Math.floor(interval);

			return `${hours} hour${hours > 1 ? 's' : ''} ago`;
		}

		interval = seconds / 60;

		if (interval > 1) {
			const minutes = Math.floor(interval);

			return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
		}

		return `${Math.floor(seconds)} second${seconds !== 1 ? 's' : ''} ago`;
	}

	const isInstalled = $.derived(() => uiStore.pluginList.some((p) => p.author === $$props.extension.author.handle && p.pluginName === $$props.extension.name));

	const installedCommandsInfo = $.derived(() => $.get(isInstalled)
		? uiStore.pluginList.filter((p) => p.author === $$props.extension.author.handle && p.pluginName === $$props.extension.name)
		: []);

	const screenshots = $.derived(() => {
		if ($$props.extension.metadata && $$props.extension.metadata.length > 0) {
			return $$props.extension.metadata;
		}

		if ($$props.extension.metadata_count > 0) {
			return Array.from({ length: $$props.extension.metadata_count }, (_, i) => `${$$props.extension.readme_assets_path}metadata/${$$props.extension.name}-${i + 1}.png`);
		}

		return [];
	});

	function handleOpenCommand(command) {
		const pluginInfo = $.get(installedCommandsInfo).find((p) => p.commandName === command.name);

		if (pluginInfo) {
			viewManager.runPlugin(pluginInfo);
		} else {
			console.error('Could not find installed plugin info for command', command);
		}
	}

	const actions = $.derived(() => {
		if ($.get(isInstalled)) return [
			{ title: 'Show Commands', handler: () => {} },
			{ title: 'Uninstall Extension', handler: () => {} }
		];

		return [
			{
				title: $$props.isInstalling ? 'Installing...' : 'Install Extension',
				handler: $$props.onInstall,
				disabled: $$props.isInstalling
			}
		];
	});

	var fragment = root_16();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		let $0 = $.derived(() => $$props.extension.icons.light
			? {
				source: $$props.extension.icons.light,
				mask: 'roundedRectangle'
			}
			: undefined);

		Icon(node, {
			get icon() {
				return $.get($0);
			},
			class: 'size-16'
		});
	}

	var div_2 = $.sibling(node, 2);
	var h1 = $.child(div_2);
	var text = $.only_child(h1, true);
	var div_3 = $.sibling(h1, 2);
	var div_4 = $.child(div_3);
	var node_1 = $.child(div_4);

	{
		let $0 = $.derived(() => $$props.extension.author.avatar
			? { source: $$props.extension.author.avatar, mask: 'circle' }
			: undefined);

		Icon(node_1, {
			get icon() {
				return $.get($0);
			},
			class: 'size-[18px]'
		});
	}

	var span = $.sibling(node_1, 2);
	var text_1 = $.only_child(span, true);

	$.reset(div_4);

	var node_2 = $.sibling(div_4, 2);

	Separator(node_2, { orientation: 'vertical', class: '!h-4' });

	var div_5 = $.sibling(node_2, 2);
	var node_3 = $.child(div_5);

	Icon(node_3, {
		icon: 'arrow-down-circle-16',
		class: 'text-muted-foreground fill-none'
	});

	var span_1 = $.sibling(node_3, 2);
	var text_2 = $.only_child(span_1);

	$.reset(div_5);

	var node_4 = $.sibling(div_5, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_5 = $.first_child(fragment_1);

			Separator(node_5, { orientation: 'vertical', class: '!h-4' });

			var div_6 = $.sibling(node_5, 2);
			var div_7 = $.child(div_6);

			$.next(2);
			$.reset(div_6);
			$.template_effect(() => $.set_style(div_7, `mask: url(${aiIcon ?? ''}) no-repeat center; mask-size: contain; background-color: currentColor;`));
			$.append($$anchor, fragment_1);
		};

		var d = $.derived(() => $$props.extension.categories?.includes('AI Extensions'));

		$.if(node_4, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	$.reset(div_3);
	$.reset(div_2);

	var node_6 = $.sibling(div_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_8 = root_1();
			var node_7 = $.child(div_8);

			Icon(node_7, {
				icon: { source: 'check-circle-16', tintColor: 'raycast-green' },
				class: 'mr-1 size-[18px]'
			});

			$.next();
			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		$.if(node_6, ($$render) => {
			if ($.get(isInstalled)) $$render(consequent_1);
		});
	}

	$.reset(div_1);

	var node_8 = $.sibling(div_1, 2);

	Separator(node_8, {});

	var node_9 = $.sibling(node_8, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_10 = $.first_child(fragment_2);

			$.component(node_10, () => Carousel.Root, ($$anchor, Carousel_Root) => {
				Carousel_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_3();
						var node_11 = $.first_child(fragment_3);

						$.component(node_11, () => Carousel.Content, ($$anchor, Carousel_Content) => {
							Carousel_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_12 = $.first_child(fragment_4);

									$.each(node_12, 18, () => $.get(screenshots), (imageUrl) => imageUrl, ($$anchor, imageUrl, i) => {
										var fragment_5 = $.comment();
										var node_13 = $.first_child(fragment_5);

										$.component(node_13, () => Carousel.Item, ($$anchor, Carousel_Item) => {
											Carousel_Item($$anchor, {
												class: 'grow-0 basis-auto',
												children: ($$anchor, $$slotProps) => {
													var button = root_2();
													var img = $.only_child(button);

													$.template_effect(() => {
														$.set_attribute(img, 'src', imageUrl);
														$.set_attribute(img, 'alt', `Screenshot ${$.get(i) + 1} for ${$$props.extension.title}`);
													});

													$.delegated('click', button, () => $$props.onOpenLightbox(imageUrl));
													$.append($$anchor, button);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_14 = $.sibling(node_11, 2);

						$.component(node_14, () => Carousel.Previous, ($$anchor, Carousel_Previous) => {
							Carousel_Previous($$anchor, { class: '-left-4', variant: 'default' });
						});

						var node_15 = $.sibling(node_14, 2);

						$.component(node_15, () => Carousel.Next, ($$anchor, Carousel_Next) => {
							Carousel_Next($$anchor, { class: '-right-4', variant: 'default' });
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node_9, ($$render) => {
			if ($.get(screenshots).length > 0) $$render(consequent_2);
		});
	}

	var node_16 = $.sibling(node_9, 2);

	Separator(node_16, { class: '-mx-6 !w-auto' });

	var div_9 = $.sibling(node_16, 2);
	var div_10 = $.child(div_9);
	var div_11 = $.child(div_10);
	var p_1 = $.sibling($.child(div_11), 2);
	var text_3 = $.only_child(p_1, true);

	$.reset(div_11);

	var node_17 = $.sibling(div_11, 2);

	Separator(node_17, {});

	var div_12 = $.sibling(node_17, 2);
	var div_13 = $.sibling($.child(div_12), 2);

	$.each(div_13, 21, () => $$props.extension.commands, (command) => command.id, ($$anchor, command) => {
		const commandIcon = $.derived(() => $.get(command).icons.light
			? { source: $.get(command).icons.light, mask: 'roundedRectangle' }
			: undefined);

		const extensionIcon = $.derived(() => $$props.extension.icons.light
			? {
				source: $$props.extension.icons.light,
				mask: 'roundedRectangle'
			}
			: undefined);

		var div_14 = root_4();
		var div_15 = $.child(div_14);
		var div_16 = $.child(div_15);
		var node_18 = $.child(div_16);

		{
			let $0 = $.derived(() => $.get(commandIcon) ?? $.get(extensionIcon) ?? undefined);

			Icon(node_18, {
				get icon() {
					return $.get($0);
				},
				class: 'size-[22px]'
			});
		}

		var span_2 = $.sibling(node_18, 2);
		var text_4 = $.only_child(span_2, true);

		$.reset(div_16);

		var p_2 = $.sibling(div_16, 2);
		var text_5 = $.only_child(p_2, true);

		$.reset(div_15);
		$.reset(div_14);

		$.template_effect(() => {
			$.set_text(text_4, $.get(command).title);
			$.set_text(text_5, $.get(command).description);
		});

		$.append($$anchor, div_14);
	});

	$.reset(div_13);
	$.reset(div_12);
	$.reset(div_10);

	var node_19 = $.sibling(div_10, 2);

	Separator(node_19, { orientation: 'vertical', class: '-mt-6' });

	var div_17 = $.sibling(node_19, 2);
	var node_20 = $.child(div_17);

	{
		var consequent_3 = ($$anchor) => {
			var div_18 = root_6();
			var node_21 = $.sibling($.child(div_18), 2);

			Button(node_21, {
				variant: 'link',
				class: 'text-foreground group w-full justify-between !p-0',
				onclick: () => openUrl($$props.extension.readme_url),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_6 = root_5();
					var node_22 = $.sibling($.first_child(fragment_6));

					Icon(node_22, {
						icon: 'arrow-ne-16',
						class: 'text-muted-foreground group-hover:text-foreground size-4'
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			$.reset(div_18);
			$.append($$anchor, div_18);
		};

		$.if(node_20, ($$render) => {
			if ($$props.extension.readme_url) $$render(consequent_3);
		});
	}

	var div_19 = $.sibling(node_20, 2);
	var p_3 = $.sibling($.child(div_19), 2);
	var text_6 = $.only_child(p_3, true);

	$.reset(div_19);

	var div_20 = $.sibling(div_19, 2);
	var div_21 = $.sibling($.child(div_20), 2);

	$.each(div_21, 21, () => $$props.extension.contributors, (contributor) => contributor.handle, ($$anchor, contributor) => {
		var a = root_7();
		var node_23 = $.child(a);

		{
			let $0 = $.derived(() => $.get(contributor).avatar
				? { source: $.get(contributor).avatar, mask: 'circle' }
				: undefined);

			Icon(node_23, {
				get icon() {
					return $.get($0);
				},
				class: 'size-6'
			});
		}

		$.reset(a);
		$.template_effect(() => $.set_attribute(a, 'href', `https://github.com/${$.get(contributor).github_handle ?? ''}`));
		$.append($$anchor, a);
	});

	$.reset(div_21);
	$.reset(div_20);

	var node_24 = $.sibling(div_20, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_22 = root_9();
			var div_23 = $.sibling($.child(div_22), 2);

			$.each(div_23, 20, () => $$props.extension.categories, (category) => category, ($$anchor, category) => {
				var span_3 = root_8();
				var text_7 = $.only_child(span_3, true);

				$.template_effect(() => $.set_text(text_7, category));
				$.append($$anchor, span_3);
			});

			$.reset(div_23);
			$.reset(div_22);
			$.append($$anchor, div_22);
		};

		$.if(node_24, ($$render) => {
			if ($$props.extension.categories?.length > 0) $$render(consequent_4);
		});
	}

	var node_25 = $.sibling(node_24, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_24 = root_11();
			var node_26 = $.sibling($.child(div_24), 2);

			Button(node_26, {
				variant: 'link',
				class: 'text-foreground group w-full justify-between !p-0',
				onclick: () => openUrl($$props.extension.source_url),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_7 = root_10();
					var node_27 = $.sibling($.first_child(fragment_7));

					Icon(node_27, {
						icon: 'arrow-ne-16',
						class: 'text-muted-foreground group-hover:text-foreground size-4'
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_24);
			$.append($$anchor, div_24);
		};

		$.if(node_25, ($$render) => {
			if ($$props.extension.source_url) $$render(consequent_5);
		});
	}

	$.reset(div_17);
	$.reset(div_9);
	$.reset(div);

	var node_28 = $.sibling(div, 2);

	{
		const primaryAction = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;
			var fragment_8 = $.comment();
			var node_29 = $.first_child(fragment_8);

			{
				var consequent_6 = ($$anchor) => {
					var fragment_9 = $.comment();
					var node_30 = $.first_child(fragment_9);

					$.component(node_30, () => Popover.Root, ($$anchor, Popover_Root) => {
						Popover_Root($$anchor, {
							get open() {
								return $.get(openCommandsPopover);
							},

							set open($$value) {
								$.set(openCommandsPopover, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_10 = root_14();
								var node_31 = $.first_child(fragment_10);

								{
									const child = ($$anchor, $$arg0) => {
										let triggerProps = () => ($$arg0?.()).props;

										Button($$anchor, $.spread_props(triggerProps, props, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var fragment_12 = root_12();
												var node_32 = $.sibling($.first_child(fragment_12));

												KeyboardShortcut(node_32, { shortcut: { key: 'enter', modifiers: [] } });
												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										}));
									};

									$.component(node_31, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
										Popover_Trigger($$anchor, { child, $$slots: { child: true } });
									});
								}

								var node_33 = $.sibling(node_31, 2);

								$.component(node_33, () => Popover.Content, ($$anchor, Popover_Content) => {
									Popover_Content($$anchor, {
										class: 'w-80 p-0',
										side: 'top',
										align: 'start',
										children: ($$anchor, $$slotProps) => {
											var fragment_13 = $.comment();
											var node_34 = $.first_child(fragment_13);

											$.component(node_34, () => Command.Root, ($$anchor, Command_Root) => {
												Command_Root($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_14 = root_3();
														var node_35 = $.first_child(fragment_14);

														$.component(node_35, () => Command.Input, ($$anchor, Command_Input) => {
															Command_Input($$anchor, { placeholder: 'Search commands...' });
														});

														var node_36 = $.sibling(node_35, 2);

														$.component(node_36, () => Command.Empty, ($$anchor, Command_Empty) => {
															Command_Empty($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_8 = $.text('No results.');

																	$.append($$anchor, text_8);
																},
																$$slots: { default: true }
															});
														});

														var node_37 = $.sibling(node_36, 2);

														$.component(node_37, () => Command.List, ($$anchor, Command_List) => {
															Command_List($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_15 = $.comment();
																	var node_38 = $.first_child(fragment_15);

																	$.each(node_38, 17, () => $$props.extension.commands, (command) => command.id, ($$anchor, command) => {
																		const commandIcon = $.derived(() => $.get(command).icons.light
																			? { source: $.get(command).icons.light, mask: 'roundedRectangle' }
																			: undefined);

																		const extensionIcon = $.derived(() => $$props.extension.icons.light
																			? {
																				source: $$props.extension.icons.light,
																				mask: 'roundedRectangle'
																			}
																			: undefined);

																		var fragment_16 = $.comment();
																		var node_39 = $.first_child(fragment_16);

																		$.component(node_39, () => Command.Item, ($$anchor, Command_Item) => {
																			Command_Item($$anchor, {
																				get value() {
																					return $.get(command).title;
																				},

																				onSelect: () => {
																					handleOpenCommand($.get(command));
																					$.set(openCommandsPopover, false);
																				},

																				children: ($$anchor, $$slotProps) => {
																					var div_25 = root_13();
																					var node_40 = $.child(div_25);

																					{
																						let $0 = $.derived(() => $.get(commandIcon) ?? $.get(extensionIcon) ?? undefined);

																						Icon(node_40, {
																							get icon() {
																								return $.get($0);
																							},
																							class: 'mr-2 size-[18px]'
																						});
																					}

																					var span_4 = $.sibling(node_40, 2);
																					var text_9 = $.only_child(span_4, true);

																					$.reset(div_25);
																					$.template_effect(() => $.set_text(text_9, $.get(command).title));
																					$.append($$anchor, div_25);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_16);
																	});

																	$.append($$anchor, fragment_15);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_14);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_13);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_10);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_9);
				};

				var alternate = ($$anchor) => {
					Button($$anchor, $.spread_props(props, {
						get onclick() {
							return $$props.onInstall;
						},

						get disabled() {
							return $$props.isInstalling;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_18 = root_15();
							var text_10 = $.first_child(fragment_18);
							var node_41 = $.sibling(text_10);

							KeyboardShortcut(node_41, { shortcut: { key: 'enter', modifiers: [] } });
							$.template_effect(() => $.set_text(text_10, `${$$props.isInstalling ? 'Installing...' : 'Install Extension'} `));
							$.append($$anchor, fragment_18);
						},
						$$slots: { default: true }
					}));
				};

				$.if(node_29, ($$render) => {
					if ($.get(isInstalled)) $$render(consequent_6); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_8);
		};

		let $0 = $.derived(() => $$props.extension.icons.light
			? {
				source: $$props.extension.icons.light,
				mask: 'roundedRectangle'
			}
			: undefined);

		ActionBar(node_28, {
			get title() {
				return $$props.extension.title;
			},

			get icon() {
				return $.get($0);
			},

			get actions() {
				return $.get(actions);
			},
			primaryAction,
			$$slots: { primaryAction: true }
		});
	}

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $$props.extension.title);
			$.set_text(text_1, $$props.extension.author.name);
			$.set_text(text_2, `${$0 ?? ''} Installs`);
			$.set_text(text_3, $$props.extension.description);
			$.set_text(text_6, $1);
		},
		[
			() => $$props.extension.download_count.toLocaleString(),
			() => formatTimeAgo($$props.extension.updated_at)
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);