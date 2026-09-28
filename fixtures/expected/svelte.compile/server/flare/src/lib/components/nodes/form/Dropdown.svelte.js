import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import { setContext, untrack, getContext } from 'svelte';
import { ChevronsUpDownIcon } from '@lucide/svelte';
import * as Command from '$lib/components/ui/command';
import * as Popover from '$lib/components/ui/popover';
import { Button } from '$lib/components/ui/button';
import NodeRenderer from '$lib/components/NodeRenderer.svelte';
import { getDropdownItems } from '$lib/components/nodes/shared/dropdown';
import { focusManager } from '$lib/focus.svelte';
import { imperativeBus } from '$lib/imperative.svelte';

export default function Dropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: 'Form.Dropdown' }))),
			node = $.derived(() => $$d().node),
			componentProps = $.derived(() => $$d().props);

		const { register } = getContext('form-context');
		const isControlled = $.derived(() => componentProps()?.value !== undefined);
		const dropdownItems = $.derived(() => node() ? getDropdownItems(node(), uiTree) : []);
		const itemsMap = $.derived(() => new Map(dropdownItems().map((i) => [i.value, i])));
		const firstItemValue = $.derived(() => dropdownItems()[0]?.value);
		let internalValue = void 0;
		let mounted = false;
		let open = false;
		let triggerRef = null;
		const scopeId = `form-dropdown-${nodeId}`;
		const displayValue = $.derived(() => isControlled() ? componentProps()?.value : internalValue);
		const selectedItem = $.derived(() => itemsMap().get(displayValue() ?? ''));

		function onSelect(value) {
			if (!isControlled()) {
				internalValue = value;
			}

			onDispatch(nodeId, 'onChange', [value]);
			open = false;
		}

		setContext('unified-dropdown', { displayValue: () => displayValue(), onSelect });

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (node() && componentProps()) {
				$$renderer.push(`<!--[0--><div class="flex gap-4"><label${$.attr('for', componentProps().id)} class="text-muted-foreground pt-2 text-right text-sm font-medium">${$.escape(componentProps().title)}</label> <div class="w-full">`);

				if (Popover.Root) {
					$$renderer.push('<!--[-->');

					Popover.Root($$renderer, {
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							{
								function child($$renderer, { props: popoverTriggerProps }) {
									Button($$renderer, $.spread_props([
										popoverTriggerProps,
										{
											variant: 'outline',
											class: 'w-full justify-between',
											role: 'combobox',
											'aria-expanded': open,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(selectedItem()?.title || componentProps().placeholder || 'Select option...')} `);
												ChevronsUpDownIcon($$renderer, { class: 'opacity-50' });
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (Popover.Trigger) {
									$$renderer.push('<!--[-->');

									Popover.Trigger($$renderer, {
										get ref() {
											return triggerRef;
										},

										set ref($$value) {
											triggerRef = $$value;
											$$settled = false;
										},
										child,
										$$slots: { child: true }
									});

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
									class: 'w-full p-0',
									children: ($$renderer) => {
										if (Command.Root) {
											$$renderer.push('<!--[-->');

											Command.Root($$renderer, {
												children: ($$renderer) => {
													if (componentProps().filtering !== false) {
														$$renderer.push('<!--[0-->');

														if (Command.Input) {
															$$renderer.push('<!--[-->');
															Command.Input($$renderer, { placeholder: 'Search...' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (Command.List) {
														$$renderer.push('<!--[-->');

														Command.List($$renderer, {
															children: ($$renderer) => {
																if (Command.Empty) {
																	$$renderer.push('<!--[-->');

																	Command.Empty($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->No option found.`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` <!--[-->`);

																const each_array = $.ensure_array_like(node().children);

																for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																	let childId = each_array[$$index];

																	NodeRenderer($$renderer, { nodeId: childId, uiTree, onDispatch });
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

				$$renderer.push(` `);

				if (componentProps().error) {
					$$renderer.push(`<!--[0--><p class="mt-1 text-xs text-red-600">${$.escape(componentProps().error)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (componentProps().info) {
					$$renderer.push(`<!--[0--><p class="mt-1 text-xs text-gray-500">${$.escape(componentProps().info)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
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