import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex size-[18px] shrink-0 items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><!> <span class="truncate text-base"> </span></div> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function AccessoryDropdown($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: ['List.Dropdown', 'Grid.Dropdown']
		}))),
		node = $.derived(() => $.get($$d).node),
		componentProps = $.derived(() => $.get($$d).props);

	const isControlled = $.derived(() => $.get(componentProps)?.value !== undefined);
	const dropdownItems = $.derived(() => $.get(node) ? getDropdownItems($.get(node), $$props.uiTree) : []);
	const itemsMap = $.derived(() => new Map($.get(dropdownItems).map((i) => [i.value, i])));
	const firstItemValue = $.derived(() => $.get(dropdownItems)[0]?.value);
	let internalValue = $.state(void 0);
	let isInitialized = $.state(false);
	let open = $.state(false);
	let triggerRef = $.state(null);
	const scopeId = `accessory-dropdown-${$$props.nodeId}`;
	const displayValue = $.derived(() => $.get(isControlled) ? $.get(componentProps)?.value : $.get(internalValue));
	const selectedItem = $.derived(() => $.get(itemsMap).get($.get(displayValue) ?? ''));

	$.user_effect(() => {
		if ($.get(componentProps) && !$.get(isInitialized)) {
			const initial = $.get(componentProps).defaultValue ?? $.get(componentProps).value;

			if (initial !== undefined) {
				$.set(internalValue, initial ?? undefined, true);
			} else if ($.get(firstItemValue) !== undefined) {
				$$props.onDispatch($$props.nodeId, 'onChange', [$.get(firstItemValue)]);

				if (!$.get(isControlled)) {
					$.set(internalValue, $.get(firstItemValue), true);
				}
			}

			$.set(isInitialized, true);
		}
	});

	$.user_effect(() => {
		if ($.get(isControlled) && $.get(componentProps)) {
			$.set(internalValue, $.get(componentProps).value ?? undefined, true);
		}
	});

	$.user_effect(() => {
		if ($.get(isInitialized) && !$.get(isControlled) && $.get(internalValue) !== undefined) {
			$$props.onDispatch($$props.nodeId, 'onChange', [$.get(internalValue)]);
		}
	});

	$.user_effect(() => {
		if ($.get(open)) {
			focusManager.requestFocus(scopeId);
		} else {
			focusManager.releaseFocus(scopeId);
		}
	});

	function onSelect(value) {
		if (!$.get(isControlled)) {
			$.set(internalValue, value, true);
		}

		$$props.onDispatch($$props.nodeId, 'onChange', [value]);
		$.set(open, false);
	}

	setContext('unified-dropdown', { displayValue: () => $.get(displayValue), onSelect });

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_3 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let popoverTriggerProps = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props(popoverTriggerProps, {
									variant: 'outline',
									class: '!border-border h-9 w-64 justify-between !px-2.5',
									role: 'combobox',
									get 'aria-expanded'() {
										return $.get(open);
									},

									get title() {
										return $.get(componentProps).tooltip;
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var div = $.first_child(fragment_4);
										var node_4 = $.child(div);

										{
											var consequent = ($$anchor) => {
												var div_1 = root();
												var node_5 = $.child(div_1);

												Icon(node_5, {
													get icon() {
														return $.get(selectedItem).icon;
													},
													class: 'size-[18px]'
												});

												$.reset(div_1);
												$.append($$anchor, div_1);
											};

											$.if(node_4, ($$render) => {
												if ($.get(selectedItem)?.icon) $$render(consequent);
											});
										}

										var span = $.sibling(node_4, 2);
										var text = $.only_child(span, true);

										$.reset(div);

										var node_6 = $.sibling(div, 2);

										{
											let $0 = $.derived(() => $.get(open) ? 'rotate-180' : '');

											ChevronDown(node_6, {
												get class() {
													return `size-4 shrink-0 opacity-50 transition-transform ${$.get($0) ?? ''}`;
												}
											});
										}

										$.template_effect(() => $.set_text(text, $.get(selectedItem)?.title ?? $.get(componentProps)?.placeholder ?? 'Select...'));
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
								Popover_Trigger($$anchor, {
									get ref() {
										return $.get(triggerRef);
									},

									set ref($$value) {
										$.set(triggerRef, $$value, true);
									},
									child,
									$$slots: { child: true }
								});
							});
						}

						var node_7 = $.sibling(node_3, 2);

						$.component(node_7, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'h-[275px] w-64 p-0',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = $.comment();
									var node_8 = $.first_child(fragment_5);

									$.component(node_8, () => Command.Root, ($$anchor, Command_Root) => {
										Command_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root_2();
												var node_9 = $.first_child(fragment_6);

												$.component(node_9, () => Command.Input, ($$anchor, Command_Input) => {
													Command_Input($$anchor, { placeholder: 'Search...', class: 'h-12 text-base' });
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Command.List, ($$anchor, Command_List) => {
													Command_List($$anchor, {
														class: 'mt-2',
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_2();
															var node_11 = $.first_child(fragment_7);

															$.component(node_11, () => Command.Empty, ($$anchor, Command_Empty) => {
																Command_Empty($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text('No items found.');

																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_12 = $.sibling(node_11, 2);

															$.each(node_12, 16, () => $.get(node).children, (childId) => childId, ($$anchor, childId) => {
																{
																	let $0 = $.derived(() => $.get(displayValue) ?? undefined);

																	NodeRenderer($$anchor, {
																		get nodeId() {
																			return childId;
																		},

																		get uiTree() {
																			return $$props.uiTree;
																		},

																		get onDispatch() {
																			return $$props.onDispatch;
																		},

																		get selectedValue() {
																			return $.get($0);
																		}
																	});
																}
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(node) && $.get(componentProps)) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}