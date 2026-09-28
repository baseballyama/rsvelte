import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { SplitButton } from "$lib/index.js";

import {
	splitButtonDefault,
	splitButtonMenuAlignment,
	splitButtonTypes
} from "../../docs/data/split-button.js";

import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const description = ($$anchor) => {
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

const alignment = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_6();
			var node_21 = $.first_child(fragment_16);

			LinkH2(node_21, {
				href: '/split-button#menu-alignment',
				'aria-label': 'menu-alignment',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Menu Alignment');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var div_10 = $.sibling(node_21, 2);

			{
				const demo = ($$anchor) => {
					var div_11 = root_7();
					var node_22 = $.child(div_11);

					$.component(node_22, () => SplitButton.Root, ($$anchor, SplitButton_Root_3) => {
						SplitButton_Root_3($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_17 = root_2();
								var node_23 = $.first_child(fragment_17);

								$.component(node_23, () => SplitButton.Button, ($$anchor, SplitButton_Button_3) => {
									SplitButton_Button_3($$anchor, {
										onclick: () => alert("Clicked save"),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_6 = $.text('save');

											$.append($$anchor, text_6);
										},
										$$slots: { default: true }
									});
								});

								var node_24 = $.sibling(node_23, 2);

								$.component(node_24, () => SplitButton.Content, ($$anchor, SplitButton_Content_3) => {
									SplitButton_Content_3($$anchor, {
										class: 'w-66',
										children: ($$anchor, $$slotProps) => {
											var fragment_18 = root_2();
											var node_25 = $.first_child(fragment_18);

											$.component(node_25, () => SplitButton.Item, ($$anchor, SplitButton_Item_6) => {
												SplitButton_Item_6($$anchor, {
													onClick: () => alert("Clicked save"),
													title: 'Save',
													description: 'Save changes'
												});
											});

											var node_26 = $.sibling(node_25, 2);

											$.component(node_26, () => SplitButton.Item, ($$anchor, SplitButton_Item_7) => {
												SplitButton_Item_7($$anchor, {
													onClick: () => alert("Clicked save + Redeploy"),
													title: 'Save + Redeploy',
													description: 'Save changes and create a new production deployment'
												});
											});

											$.append($$anchor, fragment_18);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_17);
							},
							$$slots: { default: true }
						});
					});

					var node_27 = $.sibling(node_22, 2);

					$.component(node_27, () => SplitButton.Root, ($$anchor, SplitButton_Root_4) => {
						SplitButton_Root_4($$anchor, {
							alignment: 'right',
							children: ($$anchor, $$slotProps) => {
								var fragment_19 = root_2();
								var node_28 = $.first_child(fragment_19);

								$.component(node_28, () => SplitButton.Button, ($$anchor, SplitButton_Button_4) => {
									SplitButton_Button_4($$anchor, {
										onclick: () => alert("Clicked save"),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_7 = $.text('save');

											$.append($$anchor, text_7);
										},
										$$slots: { default: true }
									});
								});

								var node_29 = $.sibling(node_28, 2);

								$.component(node_29, () => SplitButton.Content, ($$anchor, SplitButton_Content_4) => {
									SplitButton_Content_4($$anchor, {
										class: 'w-66',
										children: ($$anchor, $$slotProps) => {
											var fragment_20 = root_2();
											var node_30 = $.first_child(fragment_20);

											$.component(node_30, () => SplitButton.Item, ($$anchor, SplitButton_Item_8) => {
												SplitButton_Item_8($$anchor, {
													onClick: () => alert("Clicked save"),
													title: 'Save',
													description: 'Save changes'
												});
											});

											var node_31 = $.sibling(node_30, 2);

											$.component(node_31, () => SplitButton.Item, ($$anchor, SplitButton_Item_9) => {
												SplitButton_Item_9($$anchor, {
													onClick: () => alert("Clicked save + Redeploy"),
													title: 'Save + Redeploy',
													description: 'Save changes and create a new production deployment'
												});
											});

											$.append($$anchor, fragment_20);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_19);
							},
							$$slots: { default: true }
						});
					});

					$.reset(div_11);
					$.append($$anchor, div_11);
				};

				var node_32 = $.child(div_10);

				demoAndCode(node_32, () => demo, () => splitButtonMenuAlignment);
				$.reset(div_10);
			}

			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "snippet", href: "/snippet" },
				next: { title: "status dot", href: "/status-dot" }
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

var root = $.from_html(
	`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">Split Button</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">A button that offers a primary interaction coupled with a dropdown menu offering
			additional actions.</p>`,
	1
);

var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="space-y-8"><div class="flex flex-wrap gap-4 lg:gap-8"></div> <div class="flex w-full flex-wrap gap-4 lg:gap-8"></div></div>`);
var root_4 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The button's primary action should be the first item in the dropdown menu.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_5 = $.from_html(`<div class="flex w-full flex-wrap gap-4 lg:gap-10"></div>`);
var root_6 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_7 = $.from_html(`<div class="flex w-full gap-10"><!> <!></div>`);
var root_8 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const defaultDescription = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_4();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/split-button#split-button',
					'aria-label': 'split-button',
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
						var div_5 = root_3();
						var div_6 = $.child(div_5);

						$.each(div_6, 21, () => sizes, $.index, ($$anchor, size) => {
							var fragment_4 = $.comment();
							var node_3 = $.first_child(fragment_4);

							$.component(node_3, () => SplitButton.Root, ($$anchor, SplitButton_Root) => {
								SplitButton_Root($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_2();
										var node_4 = $.first_child(fragment_5);

										$.component(node_4, () => SplitButton.Button, ($$anchor, SplitButton_Button) => {
											SplitButton_Button($$anchor, {
												onclick: () => alert("Clicked save"),
												get size() {
													return $.get(size);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text('save');

													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => SplitButton.Content, ($$anchor, SplitButton_Content) => {
											SplitButton_Content($$anchor, {
												class: 'w-66',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_2();
													var node_6 = $.first_child(fragment_6);

													$.component(node_6, () => SplitButton.Item, ($$anchor, SplitButton_Item) => {
														SplitButton_Item($$anchor, {
															onClick: () => alert("Clicked save"),
															title: 'Save',
															description: 'Save changes'
														});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => SplitButton.Item, ($$anchor, SplitButton_Item_1) => {
														SplitButton_Item_1($$anchor, {
															onClick: () => alert("Clicked save + Redeploy"),
															title: 'Save + Redeploy',
															description: 'Save changes and create a new production deployment'
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

							$.append($$anchor, fragment_4);
						});

						$.reset(div_6);

						var div_7 = $.sibling(div_6, 2);

						$.each(div_7, 21, () => sizes, $.index, ($$anchor, size) => {
							var fragment_7 = $.comment();
							var node_8 = $.first_child(fragment_7);

							$.component(node_8, () => SplitButton.Root, ($$anchor, SplitButton_Root_1) => {
								SplitButton_Root_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_8 = root_2();
										var node_9 = $.first_child(fragment_8);

										$.component(node_9, () => SplitButton.Button, ($$anchor, SplitButton_Button_1) => {
											SplitButton_Button_1($$anchor, {
												onclick: () => alert("Clicked save"),
												get size() {
													return $.get(size);
												},
												type: 'secondary',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('save');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_10 = $.sibling(node_9, 2);

										$.component(node_10, () => SplitButton.Content, ($$anchor, SplitButton_Content_1) => {
											SplitButton_Content_1($$anchor, {
												class: 'w-66',
												children: ($$anchor, $$slotProps) => {
													var fragment_9 = root_2();
													var node_11 = $.first_child(fragment_9);

													$.component(node_11, () => SplitButton.Item, ($$anchor, SplitButton_Item_2) => {
														SplitButton_Item_2($$anchor, {
															onClick: () => alert("Clicked save"),
															title: 'Save',
															description: 'Save changes'
														});
													});

													var node_12 = $.sibling(node_11, 2);

													$.component(node_12, () => SplitButton.Item, ($$anchor, SplitButton_Item_3) => {
														SplitButton_Item_3($$anchor, {
															onClick: () => alert("Clicked save + Redeploy"),
															title: 'Save + Redeploy',
															description: 'Save changes and create a new production deployment'
														});
													});

													$.append($$anchor, fragment_9);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_7);
						});

						$.reset(div_7);
						$.reset(div_5);
						$.append($$anchor, div_5);
					};

					var node_13 = $.child(div_4);

					demoAndCode(node_13, () => demo, () => splitButtonDefault);
					$.reset(div_4);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const types = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_11 = root_6();
				var node_14 = $.first_child(fragment_11);

				LinkH2(node_14, {
					href: '/split-button#types',
					'aria-label': 'types',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('types');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var div_8 = $.sibling(node_14, 2);

				{
					const demo = ($$anchor) => {
						var div_9 = root_5();

						$.each(div_9, 21, () => sbTypes, $.index, ($$anchor, sbType) => {
							var fragment_12 = $.comment();
							var node_15 = $.first_child(fragment_12);

							$.component(node_15, () => SplitButton.Root, ($$anchor, SplitButton_Root_2) => {
								SplitButton_Root_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_13 = root_2();
										var node_16 = $.first_child(fragment_13);

										$.component(node_16, () => SplitButton.Button, ($$anchor, SplitButton_Button_2) => {
											SplitButton_Button_2($$anchor, {
												onclick: () => alert("Clicked save"),
												get type() {
													return $.get(sbType);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('save');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => SplitButton.Content, ($$anchor, SplitButton_Content_2) => {
											SplitButton_Content_2($$anchor, {
												class: 'w-66',
												children: ($$anchor, $$slotProps) => {
													var fragment_14 = root_2();
													var node_18 = $.first_child(fragment_14);

													$.component(node_18, () => SplitButton.Item, ($$anchor, SplitButton_Item_4) => {
														SplitButton_Item_4($$anchor, {
															onClick: () => alert("Clicked save"),
															title: 'Save',
															description: 'Save changes'
														});
													});

													var node_19 = $.sibling(node_18, 2);

													$.component(node_19, () => SplitButton.Item, ($$anchor, SplitButton_Item_5) => {
														SplitButton_Item_5($$anchor, {
															onClick: () => alert("Clicked save + Redeploy"),
															title: 'Save + Redeploy',
															description: 'Save changes and create a new production deployment'
														});
													});

													$.append($$anchor, fragment_14);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_13);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_12);
						});

						$.reset(div_9);
						$.append($$anchor, div_9);
					};

					var node_20 = $.child(div_8);

					demoAndCode(node_20, () => demo, () => splitButtonTypes);
					$.reset(div_8);
				}

				$.append($$anchor, fragment_11);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_23 = root_8();
		var node_33 = $.first_child(fragment_23);

		description(node_33);

		var node_34 = $.sibling(node_33, 2);

		defaultDescription(node_34);

		var node_35 = $.sibling(node_34, 2);

		types(node_35);

		var node_36 = $.sibling(node_35, 2);

		alignment(node_36);

		var node_37 = $.sibling(node_36, 2);

		prevAndNext(node_37);
		$.append($$anchor, fragment_23);
	};

	const sizes = ["small", "medium", "large"];
	const sbTypes = ["primary", "secondary", "tertiary", "error", "warning"];

	$.head('o806sc', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Split Button';
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