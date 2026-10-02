import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Select } from "bits-ui";
import Check from "phosphor-svelte/lib/Check";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
import CaretDoubleUp from "phosphor-svelte/lib/CaretDoubleUp";
import CaretDoubleDown from "phosphor-svelte/lib/CaretDoubleDown";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<div class="ml-auto"><!></div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Home_select($$anchor, $$props) {
	$.push($$props, true);

	const themes = [
		{ value: "new", label: "New App" },
		{ value: "code", label: "Code" },
		{ value: "design", label: "Design" }
	];

	let value = $.prop($$props, 'value', 15, "new");

	const selectedLabel = $.derived(() => value()
		? themes.find((theme) => theme.value === value())?.label
		: "New app");

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get items() {
				return themes;
			},

			get value() {
				return value();
			},

			set value($$value) {
				value($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'border-border-input bg-background placeholder:text-foreground-alt/50 inline-flex h-[27px] w-full cursor-pointer select-none items-center rounded-[5px] border px-2 pr-1 text-[8px] transition-colors lg:h-[37px] lg:rounded-[9px] lg:px-3 lg:pr-2 lg:text-sm dark:border-[#18181B2B] dark:bg-white dark:text-[#171717]',
						'aria-label': 'Select task',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_2 = root();
							var text = $.first_child(fragment_2);
							var node_2 = $.sibling(text);

							CaretUpDown(node_2, {
								class: 'text-muted-foreground ml-auto mr-[-5px] size-3 lg:size-6 dark:text-[#17171766]'
							});

							$.template_effect(() => $.set_text(text, `${$.get(selectedLabel) ?? ''} `));
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Select.Portal, ($$anchor, Select_Portal) => {
					Select_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
								Select_Content($$anchor, {
									class: 'focus-override border-muted bg-background shadow-popover outline-hidden z-50 max-h-96 w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] select-none rounded-xl border px-1 py-2',
									sideOffset: 10,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_2();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => Select.ScrollUpButton, ($$anchor, Select_ScrollUpButton) => {
											Select_ScrollUpButton($$anchor, {
												class: 'flex w-full items-center justify-center',
												children: ($$anchor, $$slotProps) => {
													CaretDoubleUp($$anchor, { class: 'size-3' });
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Select.Viewport, ($$anchor, Select_Viewport) => {
											Select_Viewport($$anchor, {
												class: 'p-1',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_7 = $.first_child(fragment_6);

													$.each(node_7, 17, () => themes, (theme) => theme.value, ($$anchor, theme) => {
														var fragment_7 = $.comment();
														var node_8 = $.first_child(fragment_7);

														{
															const children = ($$anchor, $$arg0) => {
																let selected = () => ($$arg0?.()).selected;

																$.next();

																var fragment_8 = root();
																var text_1 = $.first_child(fragment_8);
																var node_9 = $.sibling(text_1);

																{
																	var consequent = ($$anchor) => {
																		var div = root_1();
																		var node_10 = $.child(div);

																		Check(node_10, {});
																		$.reset(div);
																		$.append($$anchor, div);
																	};

																	$.if(node_9, ($$render) => {
																		if (selected()) $$render(consequent);
																	});
																}

																$.template_effect(() => $.set_text(text_1, `${$.get(theme).label ?? ''} `));
																$.append($$anchor, fragment_8);
															};

															$.component(node_8, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	class: 'rounded-button data-highlighted:bg-muted outline-hidden flex h-10 w-full select-none items-center py-3 pl-5 pr-1.5 text-sm capitalize duration-75',
																	get value() {
																		return $.get(theme).value;
																	},

																	get label() {
																		return $.get(theme).label;
																	},
																	children,
																	$$slots: { default: true }
																});
															});
														}

														$.append($$anchor, fragment_7);
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_11 = $.sibling(node_6, 2);

										$.component(node_11, () => Select.ScrollDownButton, ($$anchor, Select_ScrollDownButton) => {
											Select_ScrollDownButton($$anchor, {
												class: 'flex w-full items-center justify-center',
												children: ($$anchor, $$slotProps) => {
													CaretDoubleDown($$anchor, { class: 'size-3' });
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}