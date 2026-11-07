import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';
import * as _ from 'lodash-es';
import Icon from '@iconify/svelte';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { buttonVariants } from '$lib/components/ui/button';

var root = $.from_html(`<!> <p> </p> <span class="dropdown-icon"><!></span>`, 1);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><!> <span> </span></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="options"></div>`);

export default function Dropdown($$anchor, $$props) {
	$.push($$props, true);

	// import { toast } from '@zerodevx/svelte-toast';
	const dispatch = createEventDispatcher();

	/**
	 * @typedef {Object} Props
	 * @property {string} [label]
	 * @property {string} [icon]
	 * @property {'sm' | 'lg'} [size]
	 * @property {1 | 2} [px]
	 * @property {any} [options]
	 * @property {any} [dividers]
	 * @property {string} [variant]
	 */
	/** @type {Props} */
	let label = $.prop($$props, 'label', 3, ''),
		icon = $.prop($$props, 'icon', 3, 'carbon:overflow-menu-vertical'),
		options = $.prop($$props, 'options', 19, () => []),
		dividers = $.prop($$props, 'dividers', 19, () => []),
		px = $.prop($$props, 'px', 3, 1),
		size = $.prop($$props, 'size', 3, 'sm');

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({
						variant: 'ghost',
						size: size(),
						class: `py-1 px-${px()} rounded-md focus-visible:ring-1 focus-visible:ring-[var(--primo-primary-color)] focus-visible:outline-none`
					}));

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = $.comment();
								var node_2 = $.first_child(fragment_2);

								{
									var consequent = ($$anchor) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										Icon(node_3, {
											get icon() {
												return icon();
											}
										});

										var p = $.sibling(node_3, 2);
										var text = $.only_child(p, true);
										var span = $.sibling(p, 2);
										var node_4 = $.child(span);

										Icon(node_4, { icon: 'mi:select' });
										$.reset(span);
										$.template_effect(() => $.set_text(text, label()));
										$.append($$anchor, fragment_3);
									};

									var alternate = ($$anchor) => {
										Icon($$anchor, {
											get icon() {
												return icon();
											}
										});
									};

									$.if(node_2, ($$render) => {
										if (label()) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						class: 'text-sm bg-[#171717] border-[#292929] border-[1px] z-999999999',
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = $.comment();
							var node_6 = $.first_child(fragment_5);

							$.component(node_6, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
								DropdownMenu_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var div = root_3();

										$.each(div, 21, options, $.index, ($$anchor, option, i) => {
											var fragment_6 = root_2();
											var node_7 = $.first_child(fragment_6);

											{
												let $0 = $.derived(() => $.get(option).danger ? 'text-[var(--primo-color-danger)]' : '');
												let $1 = $.derived(() => $.get(option).disabled ? 'text-gray-500 cursor-not-allowed' : 'cursor-pointer');

												$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
													DropdownMenu_Item($$anchor, {
														get class() {
															return `p-1 rounded ${$.get($0) ?? ''} ${$.get($1) ?? ''}`;
														},

														get disabled() {
															return $.get(option).disabled;
														},

														onSelect: (e) => {
															if ($.get(option).disabled) return;

															if ($.get(option).on_click) {
																$.get(option).on_click(e);
															} else {
																dispatch('input', $.get(option).value);
															}
														},

														children: ($$anchor, $$slotProps) => {
															var div_1 = root_1();
															var node_8 = $.child(div_1);

															Icon(node_8, {
																get icon() {
																	return $.get(option).icon;
																}
															});

															var span_1 = $.sibling(node_8, 2);
															var text_1 = $.only_child(span_1, true);

															$.reset(div_1);
															$.template_effect(() => $.set_text(text_1, $.get(option).label));
															$.append($$anchor, div_1);
														},
														$$slots: { default: true }
													});
												});
											}

											var node_9 = $.sibling(node_7, 2);

											{
												var consequent_1 = ($$anchor) => {
													var fragment_7 = $.comment();
													var node_10 = $.first_child(fragment_7);

													$.component(node_10, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
														DropdownMenu_Separator($$anchor, {});
													});

													$.append($$anchor, fragment_7);
												};

												var d = $.derived(() => dividers().includes(i));

												$.if(node_9, ($$render) => {
													if ($.get(d)) $$render(consequent_1);
												});
											}

											$.append($$anchor, fragment_6);
										});

										$.reset(div);
										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
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