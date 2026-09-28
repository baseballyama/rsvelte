import * as $ from 'svelte/internal/server';
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

export default function ExtensionDetailView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { extension, isInstalling, onInstall, onOpenLightbox } = $$props;
		let openCommandsPopover = false;

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

		const isInstalled = $.derived(() => uiStore.pluginList.some((p) => p.author === extension.author.handle && p.pluginName === extension.name));

		const installedCommandsInfo = $.derived(() => isInstalled()
			? uiStore.pluginList.filter((p) => p.author === extension.author.handle && p.pluginName === extension.name)
			: []);

		const screenshots = $.derived(() => {
			if (extension.metadata && extension.metadata.length > 0) {
				return extension.metadata;
			}

			if (extension.metadata_count > 0) {
				return Array.from({ length: extension.metadata_count }, (_, i) => `${extension.readme_assets_path}metadata/${extension.name}-${i + 1}.png`);
			}

			return [];
		});

		function handleOpenCommand(command) {
			const pluginInfo = installedCommandsInfo().find((p) => p.commandName === command.name);

			if (pluginInfo) {
				viewManager.runPlugin(pluginInfo);
			} else {
				console.error('Could not find installed plugin info for command', command);
			}
		}

		const actions = $.derived(() => {
			if (isInstalled()) return [
				{ title: 'Show Commands', handler: () => {} },
				{ title: 'Uninstall Extension', handler: () => {} }
			];

			return [
				{
					title: isInstalling ? 'Installing...' : 'Install Extension',
					handler: onInstall,
					disabled: isInstalling
				}
			];
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex grow flex-col gap-6 overflow-x-hidden overflow-y-auto p-6"><div class="flex items-center gap-6">`);

			Icon($$renderer, {
				icon: extension.icons.light
					? { source: extension.icons.light, mask: 'roundedRectangle' }
					: undefined,
				class: 'size-16'
			});

			$$renderer.push(`<!----> <div><h1 class="text-lg font-bold">${$.escape(extension.title)}</h1> <div class="mt-2 flex items-center gap-2"><div class="flex items-center gap-1 text-sm">`);

			Icon($$renderer, {
				icon: extension.author.avatar
					? { source: extension.author.avatar, mask: 'circle' }
					: undefined,
				class: 'size-[18px]'
			});

			$$renderer.push(`<!----> <span>${$.escape(extension.author.name)}</span></div> `);
			Separator($$renderer, { orientation: 'vertical', class: '!h-4' });
			$$renderer.push(`<!----> <div class="flex items-center gap-1 text-sm">`);

			Icon($$renderer, {
				icon: 'arrow-down-circle-16',
				class: 'text-muted-foreground fill-none'
			});

			$$renderer.push(`<!----> <span>${$.escape(extension.download_count.toLocaleString())} Installs</span></div> `);

			if (extension.categories?.includes('AI Extensions')) {
				$$renderer.push('<!--[0-->');
				Separator($$renderer, { orientation: 'vertical', class: '!h-4' });
				$$renderer.push(`<!----> <div class="text-muted-foreground flex items-center gap-1 text-sm"><div class="size-4"${$.attr_style(`mask: url(${$.stringify(aiIcon)}) no-repeat center; mask-size: contain; background-color: currentColor;`)}></div> <span>AI Extension</span></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (isInstalled()) {
				$$renderer.push(`<!--[0--><div class="ml-auto flex items-center rounded bg-[#4EF8A7]/15 px-2 text-[#4EF8A7]">`);

				Icon($$renderer, {
					icon: { source: 'check-circle-16', tintColor: 'raycast-green' },
					class: 'mr-1 size-[18px]'
				});

				$$renderer.push(`<!----> Installed</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);
			Separator($$renderer, {});
			$$renderer.push(`<!----> `);

			if (screenshots().length > 0) {
				$$renderer.push('<!--[0-->');

				if (Carousel.Root) {
					$$renderer.push('<!--[-->');

					Carousel.Root($$renderer, {
						children: ($$renderer) => {
							if (Carousel.Content) {
								$$renderer.push('<!--[-->');

								Carousel.Content($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(screenshots());

										for (let i = 0, $$length = each_array.length; i < $$length; i++) {
											let imageUrl = each_array[i];

											if (Carousel.Item) {
												$$renderer.push('<!--[-->');

												Carousel.Item($$renderer, {
													class: 'grow-0 basis-auto',
													children: ($$renderer) => {
														$$renderer.push(`<button class="w-full cursor-pointer"><img${$.attr('src', imageUrl)}${$.attr('alt', `Screenshot ${i + 1} for ${extension.title}`)} class="h-[140px] rounded-lg bg-white/5 object-cover" loading="lazy"/></button>`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										$$renderer.push(`<!--]-->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Carousel.Previous) {
								$$renderer.push('<!--[-->');
								Carousel.Previous($$renderer, { class: '-left-4', variant: 'default' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Carousel.Next) {
								$$renderer.push('<!--[-->');
								Carousel.Next($$renderer, { class: '-right-4', variant: 'default' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			Separator($$renderer, { class: '-mx-6 !w-auto' });
			$$renderer.push(`<!----> <div class="grid grid-cols-[2fr_auto_1fr] gap-x-4"><div class="flex flex-col gap-4"><div><h2 class="text-muted-foreground mb-1 text-xs font-medium uppercase">Description</h2> <p>${$.escape(extension.description)}</p></div> `);
			Separator($$renderer, {});
			$$renderer.push(`<!----> <div><h2 class="text-muted-foreground mb-2 text-xs font-medium uppercase">Commands</h2> <div class="flex flex-col gap-4"><!--[-->`);

			const each_array_1 = $.ensure_array_like(extension.commands);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let command = each_array_1[$$index_1];

				const commandIcon = command.icons.light
					? { source: command.icons.light, mask: 'roundedRectangle' }
					: undefined;

				const extensionIcon = extension.icons.light
					? { source: extension.icons.light, mask: 'roundedRectangle' }
					: undefined;

				$$renderer.push(`<div class="flex items-start gap-3"><div><div class="mb-1 flex items-center gap-2 text-sm font-medium">`);

				Icon($$renderer, {
					icon: commandIcon ?? extensionIcon ?? undefined,
					class: 'size-[22px]'
				});

				$$renderer.push(`<!----> <span>${$.escape(command.title)}</span></div> <p class="text-muted-foreground text-xs">${$.escape(command.description)}</p></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div></div> `);
			Separator($$renderer, { orientation: 'vertical', class: '-mt-6' });
			$$renderer.push(`<!----> <div class="space-y-8">`);

			if (extension.readme_url) {
				$$renderer.push(`<!--[0--><div><h2 class="text-muted-foreground mb-1 text-xs font-medium uppercase">README</h2> `);

				Button($$renderer, {
					variant: 'link',
					class: 'text-foreground group w-full justify-between !p-0',
					onclick: () => openUrl(extension.readme_url),
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open README `);

						Icon($$renderer, {
							icon: 'arrow-ne-16',
							class: 'text-muted-foreground group-hover:text-foreground size-4'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div><h3 class="text-muted-foreground mb-1 text-xs font-medium uppercase">Last updated</h3> <p>${$.escape(formatTimeAgo(extension.updated_at))}</p></div> <div><h3 class="text-muted-foreground mb-1 text-xs font-medium uppercase">Contributors</h3> <div class="flex flex-wrap gap-2"><!--[-->`);

			const each_array_2 = $.ensure_array_like(extension.contributors);

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let contributor = each_array_2[$$index_2];

				$$renderer.push(`<a${$.attr('href', `https://github.com/${$.stringify(contributor.github_handle)}`)} target="_blank" class="flex items-center gap-2" rel="noopener noreferrer">`);

				Icon($$renderer, {
					icon: contributor.avatar
						? { source: contributor.avatar, mask: 'circle' }
						: undefined,
					class: 'size-6'
				});

				$$renderer.push(`<!----></a>`);
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (extension.categories?.length > 0) {
				$$renderer.push(`<!--[0--><div><h3 class="text-muted-foreground mb-1 text-xs font-medium uppercase">Categories</h3> <div class="flex flex-wrap gap-1.5"><!--[-->`);

				const each_array_3 = $.ensure_array_like(extension.categories);

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let category = each_array_3[$$index_3];

					$$renderer.push(`<span class="rounded-full bg-blue-900/50 px-2 py-0.5 text-xs font-semibold text-blue-300">${$.escape(category)}</span>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (extension.source_url) {
				$$renderer.push(`<!--[0--><div><h3 class="text-muted-foreground mb-1 text-xs font-medium uppercase">Source Code</h3> `);

				Button($$renderer, {
					variant: 'link',
					class: 'text-foreground group w-full justify-between !p-0',
					onclick: () => openUrl(extension.source_url),
					children: ($$renderer) => {
						$$renderer.push(`<!---->View Code `);

						Icon($$renderer, {
							icon: 'arrow-ne-16',
							class: 'text-muted-foreground group-hover:text-foreground size-4'
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div></div> `);

			{
				function primaryAction($$renderer, { props }) {
					if (isInstalled()) {
						$$renderer.push('<!--[0-->');

						if (Popover.Root) {
							$$renderer.push('<!--[-->');

							Popover.Root($$renderer, {
								get open() {
									return openCommandsPopover;
								},

								set open($$value) {
									openCommandsPopover = $$value;
									$$settled = false;
								},

								children: ($$renderer) => {
									{
										function child($$renderer, { props: triggerProps }) {
											Button($$renderer, $.spread_props([
												triggerProps,
												props,
												{
													children: ($$renderer) => {
														$$renderer.push(`<!---->Open Commands... `);
														KeyboardShortcut($$renderer, { shortcut: { key: 'enter', modifiers: [] } });
														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												}
											]));
										}

										if (Popover.Trigger) {
											$$renderer.push('<!--[-->');
											Popover.Trigger($$renderer, { child, $$slots: { child: true } });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(` `);

									if (Popover.Content) {
										$$renderer.push('<!--[-->');

										Popover.Content($$renderer, {
											class: 'w-80 p-0',
											side: 'top',
											align: 'start',
											children: ($$renderer) => {
												if (Command.Root) {
													$$renderer.push('<!--[-->');

													Command.Root($$renderer, {
														children: ($$renderer) => {
															if (Command.Input) {
																$$renderer.push('<!--[-->');
																Command.Input($$renderer, { placeholder: 'Search commands...' });
																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Command.Empty) {
																$$renderer.push('<!--[-->');

																Command.Empty($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->No results.`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Command.List) {
																$$renderer.push('<!--[-->');

																Command.List($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array_4 = $.ensure_array_like(extension.commands);

																		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																			let command = each_array_4[$$index_4];

																			const commandIcon = command.icons.light
																				? { source: command.icons.light, mask: 'roundedRectangle' }
																				: undefined;

																			const extensionIcon = extension.icons.light
																				? { source: extension.icons.light, mask: 'roundedRectangle' }
																				: undefined;

																			if (Command.Item) {
																				$$renderer.push('<!--[-->');

																				Command.Item($$renderer, {
																					value: command.title,
																					onSelect: () => {
																						handleOpenCommand(command);
																						openCommandsPopover = false;
																					},

																					children: ($$renderer) => {
																						$$renderer.push(`<div class="flex items-center gap-2">`);

																						Icon($$renderer, {
																							icon: commandIcon ?? extensionIcon ?? undefined,
																							class: 'mr-2 size-[18px]'
																						});

																						$$renderer.push(`<!----> <span>${$.escape(command.title)}</span></div>`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}

																		$$renderer.push(`<!--]-->`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');

						Button($$renderer, $.spread_props([
							props,
							{
								onclick: onInstall,
								disabled: isInstalling,
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(isInstalling ? 'Installing...' : 'Install Extension')} `);
									KeyboardShortcut($$renderer, { shortcut: { key: 'enter', modifiers: [] } });
									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							}
						]));
					}

					$$renderer.push(`<!--]-->`);
				}

				ActionBar($$renderer, {
					title: extension.title,
					icon: extension.icons.light
						? { source: extension.icons.light, mask: 'roundedRectangle' }
						: undefined,
					actions: actions(),
					primaryAction,
					$$slots: { primaryAction: true }
				});
			}

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}