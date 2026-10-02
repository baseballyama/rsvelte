import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Select } from "$lib/index.js";
import { selectDefault, selectSize, selectError } from "$lib/../docs/data/select.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const select = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_1 = $.child(div_3);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "project banner", href: "/project-banner" },
				next: { title: "show more", href: "/show-more" }
			});
		},
		$$slots: { default: true }
	});
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">select</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display a dropdown list of items.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="grid w-full gap-4 lg:flex lg:flex-wrap lg:justify-between"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Displays a list of options for the user to pick from—triggered by a button.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const defaultSelect = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_4();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/select#default',
					'aria-label': 'default',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('default');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div_4 = $.sibling(node_2, 4);

				{
					const demo = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_3 = $.first_child(fragment_4);

						$.component(node_3, () => Select.Root, ($$anchor, Select_Root) => {
							Select_Root($$anchor, {
								class: 'w-full lg:w-auto',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_3();
									var node_4 = $.first_child(fragment_5);

									$.component(node_4, () => Select.Trigger, ($$anchor, Select_Trigger) => {
										Select_Trigger($$anchor, {
											class: 'w-full lg:w-[200px]',
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = $.comment();
												var node_5 = $.first_child(fragment_6);

												$.component(node_5, () => Select.Value, ($$anchor, Select_Value) => {
													Select_Value($$anchor, { placeholder: 'select a fruit' });
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_4, 2);

									$.component(node_6, () => Select.Content, ($$anchor, Select_Content) => {
										Select_Content($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_7 = root_2();
												var node_7 = $.first_child(fragment_7);

												$.component(node_7, () => Select.Item, ($$anchor, Select_Item) => {
													Select_Item($$anchor, {
														value: 'apple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('apple');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => Select.Item, ($$anchor, Select_Item_1) => {
													Select_Item_1($$anchor, {
														value: 'banana',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('banana');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Select.Item, ($$anchor, Select_Item_2) => {
													Select_Item_2($$anchor, {
														value: 'orange',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('orange');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.component(node_10, () => Select.Item, ($$anchor, Select_Item_3) => {
													Select_Item_3($$anchor, {
														value: 'pineapple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text('pineapple');

															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
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
					};

					var node_11 = $.child(div_4);

					demoAndCode(node_11, () => demo, () => selectDefault);
					$.reset(div_4);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const size = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root_6();
				var node_12 = $.first_child(fragment_9);

				LinkH2(node_12, {
					href: '/select#size',
					'aria-label': 'size',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('size');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var div_5 = $.sibling(node_12, 2);

				{
					const demo = ($$anchor) => {
						var fragment_10 = root_5();
						var node_13 = $.first_child(fragment_10);

						$.component(node_13, () => Select.Root, ($$anchor, Select_Root_1) => {
							Select_Root_1($$anchor, {
								size: 'small',
								class: 'w-full lg:w-auto',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_3();
									var node_14 = $.first_child(fragment_11);

									$.component(node_14, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
										Select_Trigger_1($$anchor, {
											class: 'w-full lg:w-[200px]',
											children: ($$anchor, $$slotProps) => {
												var fragment_12 = $.comment();
												var node_15 = $.first_child(fragment_12);

												$.component(node_15, () => Select.Value, ($$anchor, Select_Value_1) => {
													Select_Value_1($$anchor, { placeholder: 'select a fruit' });
												});

												$.append($$anchor, fragment_12);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_14, 2);

									$.component(node_16, () => Select.Content, ($$anchor, Select_Content_1) => {
										Select_Content_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_13 = root_2();
												var node_17 = $.first_child(fragment_13);

												$.component(node_17, () => Select.Item, ($$anchor, Select_Item_4) => {
													Select_Item_4($$anchor, {
														value: 'apple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('apple');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_17, 2);

												$.component(node_18, () => Select.Item, ($$anchor, Select_Item_5) => {
													Select_Item_5($$anchor, {
														value: 'banana',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('banana');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_19 = $.sibling(node_18, 2);

												$.component(node_19, () => Select.Item, ($$anchor, Select_Item_6) => {
													Select_Item_6($$anchor, {
														value: 'orange',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('orange');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												var node_20 = $.sibling(node_19, 2);

												$.component(node_20, () => Select.Item, ($$anchor, Select_Item_7) => {
													Select_Item_7($$anchor, {
														value: 'pineapple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('pineapple');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_13);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						var node_21 = $.sibling(node_13, 2);

						$.component(node_21, () => Select.Root, ($$anchor, Select_Root_2) => {
							Select_Root_2($$anchor, {
								class: 'w-full lg:w-auto',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_3();
									var node_22 = $.first_child(fragment_14);

									$.component(node_22, () => Select.Trigger, ($$anchor, Select_Trigger_2) => {
										Select_Trigger_2($$anchor, {
											class: 'w-full lg:w-[200px]',
											children: ($$anchor, $$slotProps) => {
												var fragment_15 = $.comment();
												var node_23 = $.first_child(fragment_15);

												$.component(node_23, () => Select.Value, ($$anchor, Select_Value_2) => {
													Select_Value_2($$anchor, { placeholder: 'select a fruit' });
												});

												$.append($$anchor, fragment_15);
											},
											$$slots: { default: true }
										});
									});

									var node_24 = $.sibling(node_22, 2);

									$.component(node_24, () => Select.Content, ($$anchor, Select_Content_2) => {
										Select_Content_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root_2();
												var node_25 = $.first_child(fragment_16);

												$.component(node_25, () => Select.Item, ($$anchor, Select_Item_8) => {
													Select_Item_8($$anchor, {
														value: 'apple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('apple');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});
												});

												var node_26 = $.sibling(node_25, 2);

												$.component(node_26, () => Select.Item, ($$anchor, Select_Item_9) => {
													Select_Item_9($$anchor, {
														value: 'banana',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('banana');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});
												});

												var node_27 = $.sibling(node_26, 2);

												$.component(node_27, () => Select.Item, ($$anchor, Select_Item_10) => {
													Select_Item_10($$anchor, {
														value: 'orange',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text('orange');

															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});
												});

												var node_28 = $.sibling(node_27, 2);

												$.component(node_28, () => Select.Item, ($$anchor, Select_Item_11) => {
													Select_Item_11($$anchor, {
														value: 'pineapple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_13 = $.text('pineapple');

															$.append($$anchor, text_13);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_16);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						var node_29 = $.sibling(node_21, 2);

						$.component(node_29, () => Select.Root, ($$anchor, Select_Root_3) => {
							Select_Root_3($$anchor, {
								size: 'large',
								class: 'w-full lg:w-auto',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root_3();
									var node_30 = $.first_child(fragment_17);

									$.component(node_30, () => Select.Trigger, ($$anchor, Select_Trigger_3) => {
										Select_Trigger_3($$anchor, {
											class: 'w-full lg:w-[200px]',
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = $.comment();
												var node_31 = $.first_child(fragment_18);

												$.component(node_31, () => Select.Value, ($$anchor, Select_Value_3) => {
													Select_Value_3($$anchor, { placeholder: 'select a fruit' });
												});

												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									});

									var node_32 = $.sibling(node_30, 2);

									$.component(node_32, () => Select.Content, ($$anchor, Select_Content_3) => {
										Select_Content_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_19 = root_2();
												var node_33 = $.first_child(fragment_19);

												$.component(node_33, () => Select.Item, ($$anchor, Select_Item_12) => {
													Select_Item_12($$anchor, {
														value: 'apple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_14 = $.text('apple');

															$.append($$anchor, text_14);
														},
														$$slots: { default: true }
													});
												});

												var node_34 = $.sibling(node_33, 2);

												$.component(node_34, () => Select.Item, ($$anchor, Select_Item_13) => {
													Select_Item_13($$anchor, {
														value: 'banana',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_15 = $.text('banana');

															$.append($$anchor, text_15);
														},
														$$slots: { default: true }
													});
												});

												var node_35 = $.sibling(node_34, 2);

												$.component(node_35, () => Select.Item, ($$anchor, Select_Item_14) => {
													Select_Item_14($$anchor, {
														value: 'orange',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_16 = $.text('orange');

															$.append($$anchor, text_16);
														},
														$$slots: { default: true }
													});
												});

												var node_36 = $.sibling(node_35, 2);

												$.component(node_36, () => Select.Item, ($$anchor, Select_Item_15) => {
													Select_Item_15($$anchor, {
														value: 'pineapple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_17 = $.text('pineapple');

															$.append($$anchor, text_17);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_19);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_10);
					};

					var node_37 = $.child(div_5);

					demoAndCode(node_37, () => demo, () => selectSize);
					$.reset(div_5);
				}

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	};

	const errorSnip = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_21 = root_6();
				var node_38 = $.first_child(fragment_21);

				LinkH2(node_38, {
					href: '/select#size',
					'aria-label': 'size',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_18 = $.text('error');

						$.append($$anchor, text_18);
					},
					$$slots: { default: true }
				});

				var div_6 = $.sibling(node_38, 2);

				{
					const demo = ($$anchor) => {
						var fragment_22 = root_5();
						var node_39 = $.first_child(fragment_22);

						$.component(node_39, () => Select.Root, ($$anchor, Select_Root_4) => {
							Select_Root_4($$anchor, {
								size: 'small',
								class: 'w-full lg:w-auto',
								get error() {
									return $.get(error);
								},

								set error($$value) {
									$.set(error, $$value, true);
								},

								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_23 = root_3();
									var node_40 = $.first_child(fragment_23);

									$.component(node_40, () => Select.Trigger, ($$anchor, Select_Trigger_4) => {
										Select_Trigger_4($$anchor, {
											class: 'w-full lg:w-[200px]',
											children: ($$anchor, $$slotProps) => {
												var fragment_24 = $.comment();
												var node_41 = $.first_child(fragment_24);

												$.component(node_41, () => Select.Value, ($$anchor, Select_Value_4) => {
													Select_Value_4($$anchor, { placeholder: 'select a fruit' });
												});

												$.append($$anchor, fragment_24);
											},
											$$slots: { default: true }
										});
									});

									var node_42 = $.sibling(node_40, 2);

									$.component(node_42, () => Select.Content, ($$anchor, Select_Content_4) => {
										Select_Content_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_25 = root_2();
												var node_43 = $.first_child(fragment_25);

												$.component(node_43, () => Select.Item, ($$anchor, Select_Item_16) => {
													Select_Item_16($$anchor, {
														value: 'apple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_19 = $.text('apple');

															$.append($$anchor, text_19);
														},
														$$slots: { default: true }
													});
												});

												var node_44 = $.sibling(node_43, 2);

												$.component(node_44, () => Select.Item, ($$anchor, Select_Item_17) => {
													Select_Item_17($$anchor, {
														value: 'banana',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_20 = $.text('banana');

															$.append($$anchor, text_20);
														},
														$$slots: { default: true }
													});
												});

												var node_45 = $.sibling(node_44, 2);

												$.component(node_45, () => Select.Item, ($$anchor, Select_Item_18) => {
													Select_Item_18($$anchor, {
														value: 'orange',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_21 = $.text('orange');

															$.append($$anchor, text_21);
														},
														$$slots: { default: true }
													});
												});

												var node_46 = $.sibling(node_45, 2);

												$.component(node_46, () => Select.Item, ($$anchor, Select_Item_19) => {
													Select_Item_19($$anchor, {
														value: 'pineapple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_22 = $.text('pineapple');

															$.append($$anchor, text_22);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_25);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_23);
								},
								$$slots: { default: true }
							});
						});

						var node_47 = $.sibling(node_39, 2);

						$.component(node_47, () => Select.Root, ($$anchor, Select_Root_5) => {
							Select_Root_5($$anchor, {
								class: 'w-full lg:w-auto',
								get error() {
									return $.get(error);
								},

								set error($$value) {
									$.set(error, $$value, true);
								},

								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_26 = root_3();
									var node_48 = $.first_child(fragment_26);

									$.component(node_48, () => Select.Trigger, ($$anchor, Select_Trigger_5) => {
										Select_Trigger_5($$anchor, {
											class: 'w-full lg:w-[200px]',
											children: ($$anchor, $$slotProps) => {
												var fragment_27 = $.comment();
												var node_49 = $.first_child(fragment_27);

												$.component(node_49, () => Select.Value, ($$anchor, Select_Value_5) => {
													Select_Value_5($$anchor, { placeholder: 'select a fruit' });
												});

												$.append($$anchor, fragment_27);
											},
											$$slots: { default: true }
										});
									});

									var node_50 = $.sibling(node_48, 2);

									$.component(node_50, () => Select.Content, ($$anchor, Select_Content_5) => {
										Select_Content_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_28 = root_2();
												var node_51 = $.first_child(fragment_28);

												$.component(node_51, () => Select.Item, ($$anchor, Select_Item_20) => {
													Select_Item_20($$anchor, {
														value: 'apple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_23 = $.text('apple');

															$.append($$anchor, text_23);
														},
														$$slots: { default: true }
													});
												});

												var node_52 = $.sibling(node_51, 2);

												$.component(node_52, () => Select.Item, ($$anchor, Select_Item_21) => {
													Select_Item_21($$anchor, {
														value: 'banana',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_24 = $.text('banana');

															$.append($$anchor, text_24);
														},
														$$slots: { default: true }
													});
												});

												var node_53 = $.sibling(node_52, 2);

												$.component(node_53, () => Select.Item, ($$anchor, Select_Item_22) => {
													Select_Item_22($$anchor, {
														value: 'orange',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_25 = $.text('orange');

															$.append($$anchor, text_25);
														},
														$$slots: { default: true }
													});
												});

												var node_54 = $.sibling(node_53, 2);

												$.component(node_54, () => Select.Item, ($$anchor, Select_Item_23) => {
													Select_Item_23($$anchor, {
														value: 'pineapple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_26 = $.text('pineapple');

															$.append($$anchor, text_26);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_28);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_26);
								},
								$$slots: { default: true }
							});
						});

						var node_55 = $.sibling(node_47, 2);

						$.component(node_55, () => Select.Root, ($$anchor, Select_Root_6) => {
							Select_Root_6($$anchor, {
								size: 'large',
								class: 'w-full lg:w-auto',
								get error() {
									return $.get(error);
								},

								set error($$value) {
									$.set(error, $$value, true);
								},

								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_29 = root_3();
									var node_56 = $.first_child(fragment_29);

									$.component(node_56, () => Select.Trigger, ($$anchor, Select_Trigger_6) => {
										Select_Trigger_6($$anchor, {
											class: 'w-full lg:w-[200px]',
											children: ($$anchor, $$slotProps) => {
												var fragment_30 = $.comment();
												var node_57 = $.first_child(fragment_30);

												$.component(node_57, () => Select.Value, ($$anchor, Select_Value_6) => {
													Select_Value_6($$anchor, { placeholder: 'select a fruit' });
												});

												$.append($$anchor, fragment_30);
											},
											$$slots: { default: true }
										});
									});

									var node_58 = $.sibling(node_56, 2);

									$.component(node_58, () => Select.Content, ($$anchor, Select_Content_6) => {
										Select_Content_6($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_31 = root_2();
												var node_59 = $.first_child(fragment_31);

												$.component(node_59, () => Select.Item, ($$anchor, Select_Item_24) => {
													Select_Item_24($$anchor, {
														value: 'apple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_27 = $.text('apple');

															$.append($$anchor, text_27);
														},
														$$slots: { default: true }
													});
												});

												var node_60 = $.sibling(node_59, 2);

												$.component(node_60, () => Select.Item, ($$anchor, Select_Item_25) => {
													Select_Item_25($$anchor, {
														value: 'banana',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_28 = $.text('banana');

															$.append($$anchor, text_28);
														},
														$$slots: { default: true }
													});
												});

												var node_61 = $.sibling(node_60, 2);

												$.component(node_61, () => Select.Item, ($$anchor, Select_Item_26) => {
													Select_Item_26($$anchor, {
														value: 'orange',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_29 = $.text('orange');

															$.append($$anchor, text_29);
														},
														$$slots: { default: true }
													});
												});

												var node_62 = $.sibling(node_61, 2);

												$.component(node_62, () => Select.Item, ($$anchor, Select_Item_27) => {
													Select_Item_27($$anchor, {
														value: 'pineapple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_30 = $.text('pineapple');

															$.append($$anchor, text_30);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_31);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_29);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_22);
					};

					var node_63 = $.child(div_6);

					demoAndCode(node_63, () => demo, () => selectError);
					$.reset(div_6);
				}

				$.append($$anchor, fragment_21);
			},
			$$slots: { default: true }
		});
	};

	const loadingSnip = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_33 = root_6();
				var node_64 = $.first_child(fragment_33);

				LinkH2(node_64, {
					href: '/select#size',
					'aria-label': 'size',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_31 = $.text('loading');

						$.append($$anchor, text_31);
					},
					$$slots: { default: true }
				});

				var div_7 = $.sibling(node_64, 2);

				{
					const demo = ($$anchor) => {
						var fragment_34 = root_5();
						var node_65 = $.first_child(fragment_34);

						$.component(node_65, () => Select.Root, ($$anchor, Select_Root_7) => {
							Select_Root_7($$anchor, {
								size: 'small',
								class: 'w-full lg:w-auto',
								get loading() {
									return $.get(loading);
								},

								set loading($$value) {
									$.set(loading, $$value, true);
								},

								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_35 = root_3();
									var node_66 = $.first_child(fragment_35);

									$.component(node_66, () => Select.Trigger, ($$anchor, Select_Trigger_7) => {
										Select_Trigger_7($$anchor, {
											class: 'w-full lg:w-[200px]',
											children: ($$anchor, $$slotProps) => {
												var fragment_36 = $.comment();
												var node_67 = $.first_child(fragment_36);

												$.component(node_67, () => Select.Value, ($$anchor, Select_Value_7) => {
													Select_Value_7($$anchor, { placeholder: 'select a fruit' });
												});

												$.append($$anchor, fragment_36);
											},
											$$slots: { default: true }
										});
									});

									var node_68 = $.sibling(node_66, 2);

									$.component(node_68, () => Select.Content, ($$anchor, Select_Content_7) => {
										Select_Content_7($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_37 = root_2();
												var node_69 = $.first_child(fragment_37);

												$.component(node_69, () => Select.Item, ($$anchor, Select_Item_28) => {
													Select_Item_28($$anchor, {
														value: 'apple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_32 = $.text('apple');

															$.append($$anchor, text_32);
														},
														$$slots: { default: true }
													});
												});

												var node_70 = $.sibling(node_69, 2);

												$.component(node_70, () => Select.Item, ($$anchor, Select_Item_29) => {
													Select_Item_29($$anchor, {
														value: 'banana',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_33 = $.text('banana');

															$.append($$anchor, text_33);
														},
														$$slots: { default: true }
													});
												});

												var node_71 = $.sibling(node_70, 2);

												$.component(node_71, () => Select.Item, ($$anchor, Select_Item_30) => {
													Select_Item_30($$anchor, {
														value: 'orange',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_34 = $.text('orange');

															$.append($$anchor, text_34);
														},
														$$slots: { default: true }
													});
												});

												var node_72 = $.sibling(node_71, 2);

												$.component(node_72, () => Select.Item, ($$anchor, Select_Item_31) => {
													Select_Item_31($$anchor, {
														value: 'pineapple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_35 = $.text('pineapple');

															$.append($$anchor, text_35);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_37);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_35);
								},
								$$slots: { default: true }
							});
						});

						var node_73 = $.sibling(node_65, 2);

						$.component(node_73, () => Select.Root, ($$anchor, Select_Root_8) => {
							Select_Root_8($$anchor, {
								class: 'w-full lg:w-auto',
								get loading() {
									return $.get(loading);
								},

								set loading($$value) {
									$.set(loading, $$value, true);
								},

								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_38 = root_3();
									var node_74 = $.first_child(fragment_38);

									$.component(node_74, () => Select.Trigger, ($$anchor, Select_Trigger_8) => {
										Select_Trigger_8($$anchor, {
											class: 'w-full lg:w-[200px]',
											children: ($$anchor, $$slotProps) => {
												var fragment_39 = $.comment();
												var node_75 = $.first_child(fragment_39);

												$.component(node_75, () => Select.Value, ($$anchor, Select_Value_8) => {
													Select_Value_8($$anchor, { placeholder: 'select a fruit' });
												});

												$.append($$anchor, fragment_39);
											},
											$$slots: { default: true }
										});
									});

									var node_76 = $.sibling(node_74, 2);

									$.component(node_76, () => Select.Content, ($$anchor, Select_Content_8) => {
										Select_Content_8($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_40 = root_2();
												var node_77 = $.first_child(fragment_40);

												$.component(node_77, () => Select.Item, ($$anchor, Select_Item_32) => {
													Select_Item_32($$anchor, {
														value: 'apple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_36 = $.text('apple');

															$.append($$anchor, text_36);
														},
														$$slots: { default: true }
													});
												});

												var node_78 = $.sibling(node_77, 2);

												$.component(node_78, () => Select.Item, ($$anchor, Select_Item_33) => {
													Select_Item_33($$anchor, {
														value: 'banana',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_37 = $.text('banana');

															$.append($$anchor, text_37);
														},
														$$slots: { default: true }
													});
												});

												var node_79 = $.sibling(node_78, 2);

												$.component(node_79, () => Select.Item, ($$anchor, Select_Item_34) => {
													Select_Item_34($$anchor, {
														value: 'orange',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_38 = $.text('orange');

															$.append($$anchor, text_38);
														},
														$$slots: { default: true }
													});
												});

												var node_80 = $.sibling(node_79, 2);

												$.component(node_80, () => Select.Item, ($$anchor, Select_Item_35) => {
													Select_Item_35($$anchor, {
														value: 'pineapple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_39 = $.text('pineapple');

															$.append($$anchor, text_39);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_40);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_38);
								},
								$$slots: { default: true }
							});
						});

						var node_81 = $.sibling(node_73, 2);

						$.component(node_81, () => Select.Root, ($$anchor, Select_Root_9) => {
							Select_Root_9($$anchor, {
								size: 'large',
								class: 'w-full lg:w-auto',
								get loading() {
									return $.get(loading);
								},

								set loading($$value) {
									$.set(loading, $$value, true);
								},

								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_41 = root_3();
									var node_82 = $.first_child(fragment_41);

									$.component(node_82, () => Select.Trigger, ($$anchor, Select_Trigger_9) => {
										Select_Trigger_9($$anchor, {
											class: 'w-full lg:w-[200px]',
											children: ($$anchor, $$slotProps) => {
												var fragment_42 = $.comment();
												var node_83 = $.first_child(fragment_42);

												$.component(node_83, () => Select.Value, ($$anchor, Select_Value_9) => {
													Select_Value_9($$anchor, { placeholder: 'select a fruit' });
												});

												$.append($$anchor, fragment_42);
											},
											$$slots: { default: true }
										});
									});

									var node_84 = $.sibling(node_82, 2);

									$.component(node_84, () => Select.Content, ($$anchor, Select_Content_9) => {
										Select_Content_9($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_43 = root_2();
												var node_85 = $.first_child(fragment_43);

												$.component(node_85, () => Select.Item, ($$anchor, Select_Item_36) => {
													Select_Item_36($$anchor, {
														value: 'apple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_40 = $.text('apple');

															$.append($$anchor, text_40);
														},
														$$slots: { default: true }
													});
												});

												var node_86 = $.sibling(node_85, 2);

												$.component(node_86, () => Select.Item, ($$anchor, Select_Item_37) => {
													Select_Item_37($$anchor, {
														value: 'banana',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_41 = $.text('banana');

															$.append($$anchor, text_41);
														},
														$$slots: { default: true }
													});
												});

												var node_87 = $.sibling(node_86, 2);

												$.component(node_87, () => Select.Item, ($$anchor, Select_Item_38) => {
													Select_Item_38($$anchor, {
														value: 'orange',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_42 = $.text('orange');

															$.append($$anchor, text_42);
														},
														$$slots: { default: true }
													});
												});

												var node_88 = $.sibling(node_87, 2);

												$.component(node_88, () => Select.Item, ($$anchor, Select_Item_39) => {
													Select_Item_39($$anchor, {
														value: 'pineapple',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_43 = $.text('pineapple');

															$.append($$anchor, text_43);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_43);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_41);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_34);
					};

					var node_89 = $.child(div_7);

					demoAndCode(node_89, () => demo, () => selectError);
					$.reset(div_7);
				}

				$.append($$anchor, fragment_33);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_46 = root_7();
		var node_90 = $.first_child(fragment_46);

		select(node_90);

		var node_91 = $.sibling(node_90, 2);

		defaultSelect(node_91);

		var node_92 = $.sibling(node_91, 2);

		size(node_92);

		var node_93 = $.sibling(node_92, 2);

		errorSnip(node_93);

		var node_94 = $.sibling(node_93, 2);

		loadingSnip(node_94);

		var node_95 = $.sibling(node_94, 2);

		prevAndNext(node_95);
		$.append($$anchor, fragment_46);
	};

	let value = $.state("");
	let error = $.state("Please select a value.");
	let loading = $.state(true);

	$.head('18utmfh', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Select';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});
}