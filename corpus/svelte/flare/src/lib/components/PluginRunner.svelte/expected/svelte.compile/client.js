import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext, tick } from 'svelte';
import MainLayout from '$lib/components/layout/MainLayout.svelte';
import Header from '$lib/components/layout/Header.svelte';
import Content from '$lib/components/layout/Content.svelte';
import { uiStore } from '$lib/ui.svelte';
import path from 'path';
import ActionBar from './nodes/shared/ActionBar.svelte';
import NodeRenderer from './NodeRenderer.svelte';
import { focusManager } from '$lib/focus.svelte';
import { SvelteMap } from 'svelte/reactivity';
import { sidecarService } from '$lib/sidecar.svelte';
import HeaderInput from './HeaderInput.svelte';
import { nodeToActionDefinition } from './nodes/shared/actions';

var root = $.from_html(`<div class="grow"></div>`);

export default function PluginRunner($$anchor, $$props) {
	$.push($$props, true);

	const uiTree = $.derived(() => uiStore.uiTree),
		rootNodeId = $.derived(() => uiStore.rootNodeId),
		selectedNodeId = $.derived(() => uiStore.selectedNodeId),
		toasts = $.derived(() => uiStore.toasts),
		currentRunningPlugin = $.derived(() => uiStore.currentRunningPlugin),
		allActions = $.derived(() => uiStore.allActions);

	const rootNode = $.derived(() => $.get(uiTree).get($.get(rootNodeId)));
	const selectedItemNode = $.derived(() => $.get(uiTree).get($.get(selectedNodeId)));
	let searchText = $.state('');
	let searchInputEl = $.state(null);
	const icon = $.derived(() => $.get(currentRunningPlugin)?.icon);
	const navigationTitle = $.derived(() => $.get(rootNode)?.props.navigationTitle ?? $.get(currentRunningPlugin)?.title);
	const toastToShow = $.derived(() => Array.from($.get(toasts).entries()).sort((a, b) => b[0] - a[0])[0]?.[1]);
	const formValues = new SvelteMap();

	const assetsPath = $.derived(() => $.get(currentRunningPlugin)
		? path.dirname($.get(currentRunningPlugin).pluginPath) + '/assets'
		: '');

	setContext('assetsPath', () => $.get(assetsPath));

	setContext('form-context', {
		register: (fieldId, value) => {
			formValues.set(fieldId, value);
		}
	});

	function handleSelect(nodeId) {
		uiStore.selectedNodeId = nodeId;
	}

	function handleDispatch(instanceId, handlerName, args) {
		const instance = $.get(uiTree).get(instanceId);

		if (instance?.type === 'Action.SubmitForm' && handlerName === 'onSubmit') {
			const valuesObject = Object.fromEntries(formValues.entries());

			sidecarService.dispatchEvent('dispatch-event', { instanceId, handlerName, args: [valuesObject] });
			formValues.clear();
		} else {
			sidecarService.dispatchEvent('dispatch-event', { instanceId, handlerName, args });
		}
	}

	$.user_effect(() => {
		if (focusManager.activeScope === 'main-input') {
			tick().then(() => {
				$.get(searchInputEl)?.focus();
			});
		}
	});

	$.user_effect(() => {
		if ($.get(rootNode)) {
			handleDispatch($.get(rootNode).id, 'onSearchTextChange', [$.get(searchText)]);
		}
	});

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			{
				const header = ($$anchor) => {
					{
						const actions = ($$anchor) => {
							const searchBarAccessoryId = $.derived(() => $.get(rootNode)?.namedChildren?.searchBarAccessory);
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							{
								var consequent = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.key(node_3, () => $.get(searchBarAccessoryId), ($$anchor) => {
										NodeRenderer($$anchor, {
											get nodeId() {
												return $.get(searchBarAccessoryId);
											},

											get uiTree() {
												return $.get(uiTree);
											},
											onDispatch: handleDispatch
										});
									});

									$.append($$anchor, fragment_4);
								};

								$.if(node_2, ($$render) => {
									if ($.get(searchBarAccessoryId) && ($.get(rootNode).type === 'List' || $.get(rootNode).type === 'Grid' || $.get(rootNode).type === 'Form')) $$render(consequent);
								});
							}

							$.append($$anchor, fragment_3);
						};

						let $0 = $.derived(() => $.get(rootNode)?.props.isLoading ?? false);

						Header($$anchor, {
							showBackButton: true,
							get isLoading() {
								return $.get($0);
							},

							get onPopView() {
								return $$props.onPopView;
							},
							actions,
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_4 = $.first_child(fragment_6);

								{
									var consequent_1 = ($$anchor) => {
										{
											let $0 = $.derived(() => $.get(rootNode).props.searchBarPlaceholder ?? 'Search...');

											HeaderInput($$anchor, {
												get placeholder() {
													return $.get($0);
												},
												autofocus: true,
												class: '!pl-2.5',
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
									};

									var consequent_2 = ($$anchor) => {
										var div = root();

										$.append($$anchor, div);
									};

									$.if(node_4, ($$render) => {
										if ($.get(rootNode).type === 'List' || $.get(rootNode).type === 'Grid') $$render(consequent_1); else if ($.get(rootNode).type === 'Form') $$render(consequent_2, 1);
									});
								}

								$.append($$anchor, fragment_6);
							},
							$$slots: { actions: true, default: true }
						});
					}
				};

				const content = ($$anchor) => {
					Content($$anchor, {
						get rootNode() {
							return $.get(rootNode);
						},

						get selectedItemNode() {
							return $.get(selectedItemNode);
						},

						get uiTree() {
							return $.get(uiTree);
						},
						onDispatch: handleDispatch,
						onSelect: handleSelect,
						get searchText() {
							return $.get(searchText);
						}
					});
				};

				const footer = ($$anchor) => {
					{
						let $0 = $.derived(() => $.get(allActions).map((node) => nodeToActionDefinition(node, handleDispatch)));

						ActionBar($$anchor, {
							get actions() {
								return $.get($0);
							},

							get icon() {
								return $.get(icon);
							},

							get title() {
								return $.get(navigationTitle);
							},

							get toast() {
								return $.get(toastToShow);
							},

							get onToastAction() {
								return $$props.onToastAction;
							}
						});
					}
				};

				MainLayout($$anchor, {
					header,
					content,
					footer,
					$$slots: { header: true, content: true, footer: true }
				});
			}
		};

		$.if(node_1, ($$render) => {
			if ($.get(rootNode)) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}