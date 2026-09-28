import * as $ from 'svelte/internal/server';
import { useTypedNode } from '$lib/node.svelte';
import { setContext } from 'svelte';
import { ChevronDown } from '@lucide/svelte';
import * as Command from '$lib/components/ui/command';
import * as Popover from '$lib/components/ui/popover';
import { Button } from '$lib/components/ui/button';
import NodeRenderer from '$lib/components/NodeRenderer.svelte';
import Icon from '$lib/components/Icon.svelte';
import { getDropdownItems } from '$lib/components/nodes/shared/dropdown';
import { focusManager } from '$lib/focus.svelte';

export default function AccessoryDropdown($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onDispatch } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: ['List.Dropdown', 'Grid.Dropdown'] }))),
			node = $.derived(() => $$d().node),
			componentProps = $.derived(() => $$d().props);

		const isControlled = $.derived(() => componentProps()?.value !== undefined);
		const dropdownItems = $.derived(() => node() ? getDropdownItems(node(), uiTree) : []);
		const itemsMap = $.derived(() => new Map(dropdownItems().map((i) => [i.value, i])));
		const firstItemValue = $.derived(() => dropdownItems()[0]?.value);
		let internalValue = void 0;
		let isInitialized = false;
		let open = false;
		let triggerRef = null;
		const scopeId = `accessory-dropdown-${nodeId}`;
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
				$$renderer.push('<!--[0-->');

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
											class: '!border-border h-9 w-64 justify-between !px-2.5',
											role: 'combobox',
											'aria-expanded': open,
											title: componentProps().tooltip,
											children: ($$renderer) => {
												$$renderer.push(`<div class="flex items-center gap-2">`);

												if (selectedItem()?.icon) {
													$$renderer.push(`<!--[0--><div class="flex size-[18px] shrink-0 items-center justify-center">`);
													Icon($$renderer, { icon: selectedItem().icon, class: 'size-[18px]' });
													$$renderer.push(`<!----></div>`);
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--> <span class="truncate text-base">${$.escape(selectedItem()?.title ?? componentProps()?.placeholder ?? 'Select...')}</span></div> `);

												ChevronDown($$renderer, {
													class: `size-4 shrink-0 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`
												});

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
									class: 'h-[275px] w-64 p-0',
									children: ($$renderer) => {
										if (Command.Root) {
											$$renderer.push('<!--[-->');

											Command.Root($$renderer, {
												children: ($$renderer) => {
													if (Command.Input) {
														$$renderer.push('<!--[-->');
														Command.Input($$renderer, { placeholder: 'Search...', class: 'h-12 text-base' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.List) {
														$$renderer.push('<!--[-->');

														Command.List($$renderer, {
															class: 'mt-2',
															children: ($$renderer) => {
																if (Command.Empty) {
																	$$renderer.push('<!--[-->');

																	Command.Empty($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->No items found.`);
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

																	NodeRenderer($$renderer, {
																		nodeId: childId,
																		uiTree,
																		onDispatch,
																		selectedValue: displayValue() ?? undefined
																	});
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