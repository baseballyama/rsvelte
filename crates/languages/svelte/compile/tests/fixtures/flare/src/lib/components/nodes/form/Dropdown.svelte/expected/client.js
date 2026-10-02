import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<p class="mt-1 text-xs text-red-600"> </p>`);
var root_3 = $.from_html(`<p class="mt-1 text-xs text-gray-500"> </p>`);
var root_4 = $.from_html(`<div class="flex gap-4"><label class="text-muted-foreground pt-2 text-right text-sm font-medium"> </label> <div class="w-full"><!> <!> <!></div></div>`);

export default function Dropdown($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			type: 'Form.Dropdown'
		}))),
		node = $.derived(() => $.get($$d).node),
		componentProps = $.derived(() => $.get($$d).props);

	const { register } = getContext('form-context');
	const isControlled = $.derived(() => $.get(componentProps)?.value !== undefined);
	const dropdownItems = $.derived(() => $.get(node) ? getDropdownItems($.get(node), $$props.uiTree) : []);
	const itemsMap = $.derived(() => new Map($.get(dropdownItems).map((i) => [i.value, i])));
	const firstItemValue = $.derived(() => $.get(dropdownItems)[0]?.value);
	let internalValue = $.state(void 0);
	let mounted = $.state(false);
	let open = $.state(false);
	let triggerRef = $.state(null);
	const scopeId = `form-dropdown-${$$props.nodeId}`;
	const displayValue = $.derived(() => $.get(isControlled) ? $.get(componentProps)?.value : $.get(internalValue));
	const selectedItem = $.derived(() => $.get(itemsMap).get($.get(displayValue) ?? ''));

	$.user_effect(() => {
		if ($.get(componentProps)) {
			register($.get(componentProps).id, $.get(displayValue));
		}
	});

	$.user_effect(() => {
		if ($.get(open)) {
			focusManager.requestFocus(scopeId);
		} else {
			focusManager.releaseFocus(scopeId);
		}
	});

	$.user_effect(() => {
		if ($.get(componentProps)?.value !== undefined && $.get(componentProps).value !== $.get(internalValue)) {
			$.set(internalValue, $.get(componentProps).value ?? undefined, true);
		}
	});

	$.user_effect(() => {
		if (!$.get(mounted)) {
			if (!$.get(isControlled)) {
				$.set(internalValue, $.get(componentProps)?.defaultValue, true);
			}

			if ($.get(internalValue) === undefined && $.get(firstItemValue) !== undefined) {
				$$props.onDispatch($$props.nodeId, 'onChange', [$.get(firstItemValue)]);

				if (!$.get(isControlled)) {
					$.set(internalValue, $.get(firstItemValue), true);
				}
			}

			$.set(mounted, true);
		} else {
			if ($.get(internalValue) !== $.get(componentProps)?.value) {
				if ($.get(internalValue) !== undefined) {
					$$props.onDispatch($$props.nodeId, 'onChange', [$.get(internalValue)]);
				}
			}
		}
	});

	$.user_effect(() => {
		const cmd = imperativeBus.command;

		if (cmd && cmd.nodeId === $$props.nodeId) {
			if (cmd.command === 'focus') {
				$.get(triggerRef)?.focus();
			} else if (cmd.command === 'reset') {
				if (!untrack(() => $.get(isControlled))) {
					$.set(internalValue, untrack(() => $.get(componentProps)?.defaultValue), true);
				}
			}
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
		var consequent_3 = ($$anchor) => {
			var div = root_4();
			var label = $.child(div);
			var text = $.only_child(label, true);
			var div_1 = $.sibling(label, 2);
			var node_2 = $.child(div_1);

			$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_1();
						var node_3 = $.first_child(fragment_1);

						{
							const child = ($$anchor, $$arg0) => {
								let popoverTriggerProps = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props(popoverTriggerProps, {
									variant: 'outline',
									class: 'w-full justify-between',
									role: 'combobox',
									get 'aria-expanded'() {
										return $.get(open);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_3 = root();
										var text_1 = $.first_child(fragment_3);
										var node_4 = $.sibling(text_1);

										ChevronsUpDownIcon(node_4, { class: 'opacity-50' });
										$.template_effect(() => $.set_text(text_1, `${($.get(selectedItem)?.title || $.get(componentProps).placeholder || 'Select option...') ?? ''} `));
										$.append($$anchor, fragment_3);
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

						var node_5 = $.sibling(node_3, 2);

						$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'w-full p-0',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_6 = $.first_child(fragment_4);

									$.component(node_6, () => Command.Root, ($$anchor, Command_Root) => {
										Command_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_7 = $.first_child(fragment_5);

												{
													var consequent = ($$anchor) => {
														var fragment_6 = $.comment();
														var node_8 = $.first_child(fragment_6);

														$.component(node_8, () => Command.Input, ($$anchor, Command_Input) => {
															Command_Input($$anchor, { placeholder: 'Search...' });
														});

														$.append($$anchor, fragment_6);
													};

													$.if(node_7, ($$render) => {
														if ($.get(componentProps).filtering !== false) $$render(consequent);
													});
												}

												var node_9 = $.sibling(node_7, 2);

												$.component(node_9, () => Command.List, ($$anchor, Command_List) => {
													Command_List($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_1();
															var node_10 = $.first_child(fragment_7);

															$.component(node_10, () => Command.Empty, ($$anchor, Command_Empty) => {
																Command_Empty($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text('No option found.');

																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});

															var node_11 = $.sibling(node_10, 2);

															$.each(node_11, 16, () => $.get(node).children, (childId) => childId, ($$anchor, childId) => {
																NodeRenderer($$anchor, {
																	get nodeId() {
																		return childId;
																	},

																	get uiTree() {
																		return $$props.uiTree;
																	},

																	get onDispatch() {
																		return $$props.onDispatch;
																	}
																});
															});

															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_12 = $.sibling(node_2, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p = root_2();
					var text_3 = $.only_child(p, true);

					$.template_effect(() => $.set_text(text_3, $.get(componentProps).error));
					$.append($$anchor, p);
				};

				$.if(node_12, ($$render) => {
					if ($.get(componentProps).error) $$render(consequent_1);
				});
			}

			var node_13 = $.sibling(node_12, 2);

			{
				var consequent_2 = ($$anchor) => {
					var p_1 = root_3();
					var text_4 = $.only_child(p_1, true);

					$.template_effect(() => $.set_text(text_4, $.get(componentProps).info));
					$.append($$anchor, p_1);
				};

				$.if(node_13, ($$render) => {
					if ($.get(componentProps).info) $$render(consequent_2);
				});
			}

			$.reset(div_1);
			$.reset(div);

			$.template_effect(() => {
				$.set_attribute(label, 'for', $.get(componentProps).id);
				$.set_text(text, $.get(componentProps).title);
			});

			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(node) && $.get(componentProps)) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}