import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Calculator from '$lib/components/Calculator.svelte';
import BaseList from '$lib/components/BaseList.svelte';
import ListItemBase from '../nodes/shared/ListItemBase.svelte';
import path from 'path';
import { tick } from 'svelte';
import { appsStore } from '$lib/apps.svelte';
import { frecencyStore } from '$lib/frecency.svelte';
import { quicklinksStore } from '$lib/quicklinks.svelte';
import { useCommandPaletteItems, useCommandPaletteActions } from '$lib/command-palette.svelte';
import CommandPaletteActionBar from './ActionBar.svelte';
import { focusManager } from '$lib/focus.svelte';
import HeaderInput from '../HeaderInput.svelte';
import { Input } from '$lib/components/ui/input';
import MainLayout from '../layout/MainLayout.svelte';
import Header from '../layout/Header.svelte';

var root = $.from_html(`<div class="pointer-events-none absolute top-0 left-0 flex h-full w-full items-center pl-4"><span class="text-lg whitespace-pre text-transparent"> </span> <span class="w-2"></span> <div class="pointer-events-auto"><div class="inline-grid items-center"><span class="invisible col-start-1 row-start-1 px-3 text-base whitespace-pre md:text-sm" aria-hidden="true"> </span> <!></div></div></div>`);
var root_1 = $.from_html(`<div class="relative flex w-full items-center"><!> <!></div>`);
var root_2 = $.from_html(`<span class="text-muted-foreground ml-auto text-xs whitespace-nowrap">Command</span>`);
var root_3 = $.from_html(`<span class="text-muted-foreground ml-auto text-xs whitespace-nowrap">Application</span>`);
var root_4 = $.from_html(`<span class="text-muted-foreground ml-auto text-xs whitespace-nowrap">Quicklink</span>`);
var root_5 = $.from_html(`<div class="grow overflow-y-auto" data-testid="command-palette-content"><!></div>`);

export default function CommandPalette($$anchor, $$props) {
	$.push($$props, true);

	const installedApps = $.derived(() => appsStore.apps);
	const quicklinks = $.derived(() => quicklinksStore.quicklinks);
	const frecencyData = $.derived(() => frecencyStore.data);
	let searchText = $.state('');
	let quicklinkArgument = $.state('');
	let selectedIndex = $.state(0);
	let listElement = $.state(null);
	let searchInputEl = $.state(null);
	let argumentInputEl = $.state(null);
	let selectedQuicklinkForArgument = $.state(null);

	const $$d = $.derived(useCommandPaletteItems({
			searchText: () => $.get(searchText),
			plugins: () => $$props.plugins,
			installedApps: () => $.get(installedApps),
			quicklinks: () => $.get(quicklinks),
			frecencyData: () => $.get(frecencyData),
			selectedQuicklinkForArgument: () => $.get(selectedQuicklinkForArgument)
		})),
		displayItems = $.derived(() => $.get($$d).displayItems);

	const selectedItem = $.derived(() => $.get(displayItems)[$.get(selectedIndex)]);

	$.user_effect(() => {
		if (focusManager.activeScope === 'main-input') {
			tick().then(() => {
				$.get(searchInputEl)?.focus();
			});
		}
	});

	$.user_effect(() => {
		if (focusManager.activeScope === 'quicklink-argument') {
			tick().then(() => {
				$.get(argumentInputEl)?.focus();
			});
		}
	});

	function resetState() {
		$.set(searchText, '');
		$.set(quicklinkArgument, '');
		$.set(selectedIndex, 0);
		$.set(selectedQuicklinkForArgument, null);
	}

	function focusArgumentInput() {
		focusManager.requestFocus('quicklink-argument');
	}

	async function setSearchText(text) {
		$.set(searchText, text, true);
	}

	const actions = useCommandPaletteActions({
		selectedItem: () => $.get(selectedItem),
		onRunPlugin: $$props.onRunPlugin,
		resetState,
		focusArgumentInput
	});

	$.user_effect(() => {
		const item = $.get(displayItems)[$.get(selectedIndex)];

		if (item?.type === 'quicklink' && item.data.link.includes('{argument}')) {
			$.set(selectedQuicklinkForArgument, item.data, true);
		} else {
			console.log('null haha');
			$.set(selectedQuicklinkForArgument, null);
		}
	});

	$.user_effect(() => {
		if (!$.get(selectedQuicklinkForArgument)) {
			focusManager.releaseFocus('quicklink-argument');
		}
	});

	async function handleArgumentKeydown(e) {
		if (e.key === 'Enter') {
			e.preventDefault();

			if ($.get(selectedQuicklinkForArgument)) {
				await actions.executeQuicklink($.get(selectedQuicklinkForArgument), $.get(quicklinkArgument));
			}
		} else if (e.key === 'Escape' || e.key === 'Backspace' && $.get(quicklinkArgument) === '') {
			e.preventDefault();
			focusManager.releaseFocus('quicklink-argument');
		}
	}

	{
		const header = ($$anchor) => {
			Header($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div = root_1();
					var node = $.child(div);

					{
						let $0 = $.derived(() => $.get(selectedQuicklinkForArgument)
							? $.get(selectedQuicklinkForArgument).name
							: 'Search for apps and commands...');

						HeaderInput(node, {
							get placeholder() {
								return $.get($0);
							},
							autofocus: true,
							class: '!pl-0',
							get value() {
								return $.get(searchText);
							},

							set value($$value) {
								$.set(searchText, $$value, true);
							},

							get ref() {
								return $.get(searchInputEl);
							},

							set ref($$value) {
								$.set(searchInputEl, $$value, true);
							}
						});
					}

					var node_1 = $.sibling(node, 2);

					{
						var consequent = ($$anchor) => {
							var div_1 = root();
							var span = $.child(div_1);
							var text_1 = $.only_child(span, true);
							var div_2 = $.sibling(span, 4);
							var div_3 = $.child(div_2);
							var span_1 = $.child(div_3);
							var text_2 = $.only_child(span_1, true);
							var node_2 = $.sibling(span_1, 2);

							Input(node_2, {
								class: 'border-border col-start-1 row-start-1 h-7 w-full',
								placeholder: 'Query',
								onkeydown: handleArgumentKeydown,
								get value() {
									return $.get(quicklinkArgument);
								},

								set value($$value) {
									$.set(quicklinkArgument, $$value, true);
								},

								get ref() {
									return $.get(argumentInputEl);
								},

								set ref($$value) {
									$.set(argumentInputEl, $$value, true);
								}
							});

							$.reset(div_3);
							$.reset(div_2);
							$.reset(div_1);

							$.template_effect(() => {
								$.set_text(text_1, $.get(searchText) || $.get(selectedQuicklinkForArgument).name);
								$.set_text(text_2, $.get(quicklinkArgument) || 'Query');
							});

							$.append($$anchor, div_1);
						};

						$.if(node_1, ($$render) => {
							if ($.get(selectedQuicklinkForArgument)) $$render(consequent);
						});
					}

					$.reset(div);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		const content = ($$anchor) => {
			var div_4 = root_5();
			var node_3 = $.child(div_4);

			{
				const itemSnippet = ($$anchor, $$arg0) => {
					let item = () => ($$arg0?.()).item;
					let isSelected = () => ($$arg0?.()).isSelected;
					let onclick = () => ($$arg0?.()).onclick;
					var fragment_2 = $.comment();
					var node_4 = $.first_child(fragment_2);

					{
						var consequent_1 = ($$anchor) => {
							Calculator($$anchor, {
								get searchText() {
									return item().data.value;
								},

								get mathResult() {
									return item().data.result;
								},

								get mathResultType() {
									return item().data.resultType;
								},

								get isSelected() {
									return isSelected();
								},

								get onSelect() {
									return onclick();
								}
							});
						};

						var consequent_2 = ($$anchor) => {
							const assetsPath = $.derived(() => path.dirname(item().data.pluginPath) + '/assets');

							{
								const accessories = ($$anchor) => {
									var span_2 = root_2();

									$.append($$anchor, span_2);
								};

								let $0 = $.derived(() => item().data.icon || 'app-window-16');

								ListItemBase($$anchor, {
									get title() {
										return item().data.title;
									},

									get subtitle() {
										return item().data.pluginTitle;
									},

									get icon() {
										return $.get($0);
									},

									get assetsPath() {
										return $.get(assetsPath);
									},

									get isSelected() {
										return isSelected();
									},

									get onclick() {
										return onclick();
									},
									accessories,
									$$slots: { accessories: true }
								});
							}
						};

						var consequent_3 = ($$anchor) => {
							{
								const accessories = ($$anchor) => {
									var span_3 = root_3();

									$.append($$anchor, span_3);
								};

								let $0 = $.derived(() => item().data.icon_path ?? 'app-window-16');

								ListItemBase($$anchor, {
									get title() {
										return item().data.name;
									},

									get subtitle() {
										return item().data.comment;
									},

									get icon() {
										return $.get($0);
									},

									get isSelected() {
										return isSelected();
									},

									get onclick() {
										return onclick();
									},
									accessories,
									$$slots: { accessories: true }
								});
							}
						};

						var consequent_4 = ($$anchor) => {
							{
								const accessories = ($$anchor) => {
									var span_4 = root_4();

									$.append($$anchor, span_4);
								};

								let $0 = $.derived(() => item().data.link.replace(/\{argument\}/g, '...'));
								let $1 = $.derived(() => item().data.icon ?? 'link-16');

								ListItemBase($$anchor, {
									get title() {
										return item().data.name;
									},

									get subtitle() {
										return $.get($0);
									},

									get icon() {
										return $.get($1);
									},

									get isSelected() {
										return isSelected();
									},

									get onclick() {
										return onclick();
									},
									accessories,
									$$slots: { accessories: true }
								});
							}
						};

						$.if(node_4, ($$render) => {
							if (item().type === 'calculator') $$render(consequent_1); else if (item().type === 'plugin') $$render(consequent_2, 1); else if (item().type === 'app') $$render(consequent_3, 2); else if (item().type === 'quicklink') $$render(consequent_4, 3);
						});
					}

					$.append($$anchor, fragment_2);
				};

				let $0 = $.derived(() => $.get(displayItems).map((item) => ({ ...item, itemType: 'item' })));

				BaseList(node_3, {
					get items() {
						return $.get($0);
					},

					get onenter() {
						return actions.handleEnter;
					},

					get selectedIndex() {
						return $.get(selectedIndex);
					},

					set selectedIndex($$value) {
						$.set(selectedIndex, $$value, true);
					},

					get listElement() {
						return $.get(listElement);
					},

					set listElement($$value) {
						$.set(listElement, $$value, true);
					},
					itemSnippet,
					$$slots: { itemSnippet: true }
				});
			}

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		const footer = ($$anchor) => {
			CommandPaletteActionBar($$anchor, {
				get selectedItem() {
					return $.get(selectedItem);
				},

				get actions() {
					return actions;
				},
				setSearchText
			});
		};

		MainLayout($$anchor, {
			header,
			content,
			footer,
			$$slots: { header: true, content: true, footer: true }
		});
	}

	$.pop();
}