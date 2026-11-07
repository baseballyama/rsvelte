import * as $ from 'svelte/internal/server';
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

export default function PluginRunner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uiTree = $.derived(() => uiStore.uiTree),
			rootNodeId = $.derived(() => uiStore.rootNodeId),
			selectedNodeId = $.derived(() => uiStore.selectedNodeId),
			toasts = $.derived(() => uiStore.toasts),
			currentRunningPlugin = $.derived(() => uiStore.currentRunningPlugin),
			allActions = $.derived(() => uiStore.allActions);

		let { onPopView, onToastAction } = $$props;
		const rootNode = $.derived(() => uiTree().get(rootNodeId()));
		const selectedItemNode = $.derived(() => uiTree().get(selectedNodeId()));
		let searchText = '';
		let searchInputEl = null;
		const icon = $.derived(() => currentRunningPlugin()?.icon);
		const navigationTitle = $.derived(() => rootNode()?.props.navigationTitle ?? currentRunningPlugin()?.title);
		const toastToShow = $.derived(() => Array.from(toasts().entries()).sort((a, b) => b[0] - a[0])[0]?.[1]);
		const formValues = new SvelteMap();

		const assetsPath = $.derived(() => currentRunningPlugin()
			? path.dirname(currentRunningPlugin().pluginPath) + '/assets'
			: '');

		setContext('assetsPath', () => assetsPath());

		setContext('form-context', {
			register: (fieldId, value) => {
				formValues.set(fieldId, value);
			}
		});

		function handleSelect(nodeId) {
			uiStore.selectedNodeId = nodeId;
		}

		function handleDispatch(instanceId, handlerName, args) {
			const instance = uiTree().get(instanceId);

			if (instance?.type === 'Action.SubmitForm' && handlerName === 'onSubmit') {
				const valuesObject = Object.fromEntries(formValues.entries());

				sidecarService.dispatchEvent('dispatch-event', { instanceId, handlerName, args: [valuesObject] });
				formValues.clear();
			} else {
				sidecarService.dispatchEvent('dispatch-event', { instanceId, handlerName, args });
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (rootNode()) {
				$$renderer.push('<!--[0-->');

				{
					function header($$renderer) {
						{
							function actions($$renderer) {
								const searchBarAccessoryId = rootNode()?.namedChildren?.searchBarAccessory;

								if (searchBarAccessoryId && (rootNode().type === 'List' || rootNode().type === 'Grid' || rootNode().type === 'Form')) {
									$$renderer.push(`<!--[0--><!---->`);

									{
										NodeRenderer($$renderer, {
											nodeId: searchBarAccessoryId,
											uiTree: uiTree(),
											onDispatch: handleDispatch
										});
									}

									$$renderer.push(`<!---->`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}

							Header($$renderer, {
								showBackButton: true,
								isLoading: rootNode()?.props.isLoading ?? false,
								onPopView,
								actions,
								children: ($$renderer) => {
									if (rootNode().type === 'List' || rootNode().type === 'Grid') {
										$$renderer.push('<!--[0-->');

										HeaderInput($$renderer, {
											placeholder: rootNode().props.searchBarPlaceholder ?? 'Search...',
											autofocus: true,
											class: '!pl-2.5',
											get value() {
												return searchText;
											},

											set value($$value) {
												searchText = $$value;
												$$settled = false;
											},

											get ref() {
												return searchInputEl;
											},

											set ref($$value) {
												searchInputEl = $$value;
												$$settled = false;
											}
										});
									} else if (rootNode().type === 'Form') {
										$$renderer.push(`<!--[1--><div class="grow"></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { actions: true, default: true }
							});
						}
					}

					function content($$renderer) {
						Content($$renderer, {
							rootNode: rootNode(),
							selectedItemNode: selectedItemNode(),
							uiTree: uiTree(),
							onDispatch: handleDispatch,
							onSelect: handleSelect,
							searchText
						});
					}

					function footer($$renderer) {
						ActionBar($$renderer, {
							actions: allActions().map((node) => nodeToActionDefinition(node, handleDispatch)),
							icon: icon(),
							title: navigationTitle(),
							toast: toastToShow(),
							onToastAction
						});
					}

					MainLayout($$renderer, {
						header,
						content,
						footer,
						$$slots: { header: true, content: true, footer: true }
					});
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}