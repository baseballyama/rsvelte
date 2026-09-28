import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Combobox, mergeProps } from "bits-ui";
import ChevronUpDown from "phosphor-svelte/lib/CaretUpDown";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'items',
	'value',
	'open',
	'inputProps',
	'contentProps',
	'type'
]);

var root = $.from_html(`<div class="flex w-full flex-col"><span> </span></div>`);
var root_1 = $.from_html(`<span>No results found</span>`);
var root_2 = $.from_html(`<div class="relative"><!> <!></div> <!>`, 1);

export default function Combobox_1($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		open = $.prop($$props, 'open', 15, false),
		restProps = $.rest_props($$props, rest_excludes);

	let searchValue = $.state("");

	const filteredItems = $.derived(() => {
		if ($.get(searchValue) === "") return $$props.items;

		return $$props.items.filter((item) => item.label.toLowerCase().includes($.get(searchValue).toLowerCase()));
	});

	function handleInput(e) {
		$.set(searchValue, e.currentTarget.value, true);
	}

	function handleOpenChange(newOpen) {
		if (!newOpen) $.set(searchValue, "");
	}

	const mergedRootProps = $.derived(() => mergeProps(restProps, { onOpenChange: handleOpenChange }));
	const mergedInputProps = $.derived(() => mergeProps($$props.inputProps, { oninput: handleInput }));

	let inputValue = $.derived(() => {
		return $$props.items.find((item) => item.value === value())?.label;
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Combobox.Root, ($$anchor, Combobox_Root) => {
		Combobox_Root($$anchor, $.spread_props(
			{
				get inputValue() {
					return $.get(inputValue);
				}
			},
			() => $.get(mergedRootProps),
			{
				get type() {
					return $$props.type;
				},

				get items() {
					return $$props.items;
				},

				get value() {
					return value();
				},

				set value($$value) {
					value($$value);
				},

				get open() {
					return open();
				},

				set open($$value) {
					open($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_2();
					var div = $.first_child(fragment_1);
					var node_1 = $.child(div);

					$.component(node_1, () => Combobox.Input, ($$anchor, Combobox_Input) => {
						Combobox_Input($$anchor, $.spread_props(() => $.get(mergedInputProps), {
							class: 'border-input bg-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
						}));
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Combobox.Trigger, ($$anchor, Combobox_Trigger) => {
						Combobox_Trigger($$anchor, {
							class: 'absolute end-3 top-1/2 size-6 -translate-y-1/2',
							children: ($$anchor, $$slotProps) => {
								ChevronUpDown($$anchor, { class: 'text-muted-foreground h-5 w-5' });
							},
							$$slots: { default: true }
						});
					});

					$.reset(div);

					var node_3 = $.sibling(div, 2);

					$.component(node_3, () => Combobox.Portal, ($$anchor, Combobox_Portal) => {
						Combobox_Portal($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_4 = $.first_child(fragment_3);

								$.component(node_4, () => Combobox.Content, ($$anchor, Combobox_Content) => {
									Combobox_Content($$anchor, $.spread_props(() => $$props.contentProps, {
										class: 'z-50  mt-2 w-[var(--bits-combobox-anchor-width)] min-w-[var(--bits-combobox-anchor-width)]  rounded-md border bg-white p-1 shadow-md outline-none',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_5 = $.first_child(fragment_4);

											$.each(
												node_5,
												17,
												() => $.get(filteredItems),
												(item) => item.value,
												($$anchor, item) => {
													var fragment_5 = $.comment();
													var node_6 = $.first_child(fragment_5);

													{
														const children = ($$anchor, $$arg0) => {
															let selected = () => ($$arg0?.()).selected;
															var div_1 = root();
															var span = $.child(div_1);
															var text = $.only_child(span, true);

															$.reset(div_1);

															$.template_effect(() => {
																$.set_class(span, 1, $.clsx(selected() ? "font-medium text-red-500" : ""));
																$.set_text(text, $.get(item).label);
															});

															$.append($$anchor, div_1);
														};

														$.component(node_6, () => Combobox.Item, ($$anchor, Combobox_Item) => {
															Combobox_Item($$anchor, {
																get value() {
																	return $.get(item).value;
																},

																get label() {
																	return $.get(item).label;
																},
																class: 'relative flex w-full cursor-pointer select-none items-center rounded-sm p-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
																children,
																$$slots: { default: true }
															});
														});
													}

													$.append($$anchor, fragment_5);
												},
												($$anchor) => {
													var span_1 = root_1();

													$.append($$anchor, span_1);
												}
											);

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									}));
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	});

	$.append($$anchor, fragment);
	$.pop();
}