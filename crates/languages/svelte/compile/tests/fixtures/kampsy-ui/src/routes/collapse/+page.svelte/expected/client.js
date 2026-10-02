import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";

import {
	collapseDefault,
	collapseExpanded,
	collapseMultiple,
	collapseSize
} from "../../docs/data/collapse.js";

import { Collapse, Pagination, Tabs, Text } from "$lib/index.js";
import { fade } from "svelte/transition";
import { Webhook, Accessibility } from "$lib/icons/index.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const collapse = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
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

	var node_1 = $.sibling(div_1, 2);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div);
	$.append($$anchor, div);
};

const roundedCode = ($$anchor, rct = $.noop) => {
	var code_1 = root_4();
	var text_18 = $.only_child(code_1, true);

	$.template_effect(() => $.set_text(text_18, rct()));
	$.append($$anchor, code_1);
};

const accessibility = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_35 = root_9();
			var node_35 = $.sibling($.first_child(fragment_35), 4);

			Text(node_35, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_19 = $.text('Accordion headings should clearly and accurately describe the content within each\n			corresponding section.');

					$.append($$anchor, text_19);
				},
				$$slots: { default: true }
			});

			var node_36 = $.sibling(node_35, 2);

			Text(node_36, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_20 = $.text('Do not use an accordion if it conceals essential information the user needs to complete\n			actions on the page.');

					$.append($$anchor, text_20);
				},
				$$slots: { default: true }
			});

			var node_37 = $.sibling(node_36, 2);

			Text(node_37, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_36 = root_5();
					var node_38 = $.sibling($.first_child(fragment_36));

					roundedCode(node_38, () => 'role="heading"');

					var node_39 = $.sibling(node_38, 2);

					roundedCode(node_39, () => "aria-level");
					$.next();
					$.append($$anchor, fragment_36);
				},
				$$slots: { default: true }
			});

			var node_40 = $.sibling(node_37, 2);

			Text(node_40, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_37 = root_6();
					var node_41 = $.sibling($.first_child(fragment_37));

					roundedCode(node_41, () => 'aria-expanded="true"');
					$.next();
					$.append($$anchor, fragment_37);
				},
				$$slots: { default: true }
			});

			var node_42 = $.sibling(node_40, 2);

			Text(node_42, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_38 = root_7();
					var node_43 = $.sibling($.first_child(fragment_38));

					roundedCode(node_43, () => "aria-controls");
					$.next();
					$.append($$anchor, fragment_38);
				},
				$$slots: { default: true }
			});

			var node_44 = $.sibling(node_42, 2);

			Text(node_44, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_39 = root_8();
					var node_45 = $.sibling($.first_child(fragment_39));

					roundedCode(node_45, () => "aria-labelledby");
					$.next();
					$.append($$anchor, fragment_39);
				},
				$$slots: { default: true }
			});

			var node_46 = $.sibling(node_44, 2);

			Text(node_46, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_21 = $.text('Avoid keyboard traps when adding components to the accordion panel. For instance, users\n			can expand an accordion but may not be able to tab to the next focusable element.');

					$.append($$anchor, text_21);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_35);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "choicebox", href: "/choicebox" },
				next: { title: "copy button", href: "/copy-button" }
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
	`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">collapse</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">A set of headings, vertically stacked, that each reveal an related section of content.
			Commonly referred to as an accordion.</p>`,
	1
);

var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs"> </code>`);

var root_5 = $.from_html(
	`Ensure that the Collapse.Trigger has a <!> attribute. This heading should have an appropriate <!> designation,
			based on its position in the page hierarchy.`,
	1
);

var root_6 = $.from_html(
	`If the accordion panel linked to the heading is visible, then the Collapse.Trigger must
			have <!> .`,
	1
);

var root_7 = $.from_html(
	`The Collapse.Trigger must have an <!> attribute that points
			to the ID of the associated accordion panel.`,
	1
);

var root_8 = $.from_html(
	`Add the <!> attribute to Collapse.Content and set its
			ID value to the aria-controls of Collapse.Trigger.`,
	1
);

var root_9 = $.from_html(
	`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize">Accessibility</h2> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">This component aims to adhere to <a href="https://www.w3.org/TR/WCAG22/" class="text-kui-light-blue-900 dark:text-kui-dark-blue-900 underline">WCAG 2.2 (level AA)</a> guidelines. Ensure this compliance is maintained when the component is integrated into other
			projects.</p> <!> <!> <!> <!> <!> <!> <!>`,
	1
);

var root_10 = $.from_html(`<section><!> <!> <!> <!></section>`);
var root_11 = $.from_html(`<section><!></section>`);
var root_12 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const tabSnip = ($$anchor) => {
		Row($$anchor, {
			bottomLine: false,
			class: 'py-1!',
			children: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => [
						{
							title: "Implementation",
							value: "implementation",
							icon: Webhook
						},

						{
							title: "Accessibility",
							value: "accessibility",
							icon: Accessibility
						}
					]);

					Tabs($$anchor, {
						get tabs() {
							return $.get($0);
						},

						get selected() {
							return $.get(selected);
						},

						set selected($$value) {
							$.set(selected, $$value, true);
						}
					});
				}
			},
			$$slots: { default: true }
		});
	};

	const defaultCollapse = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_3();
				var node_2 = $.first_child(fragment_5);

				LinkH2(node_2, {
					href: '/collapse#default',
					'aria-label': 'default',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('default');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div_3 = $.sibling(node_2, 2);

				{
					const demo = ($$anchor) => {
						var fragment_6 = $.comment();
						var node_3 = $.first_child(fragment_6);

						$.component(node_3, () => Collapse.Root, ($$anchor, Collapse_Root) => {
							Collapse_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();
									var node_4 = $.first_child(fragment_7);

									$.component(node_4, () => Collapse.Item, ($$anchor, Collapse_Item) => {
										Collapse_Item($$anchor, {
											value: '1',
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_2();
												var node_5 = $.first_child(fragment_8);

												$.component(node_5, () => Collapse.Trigger, ($$anchor, Collapse_Trigger) => {
													Collapse_Trigger($$anchor, {
														role: 'heading',
														'aria-level': 3,
														type: 'button',
														'aria-controls': 'tab1-section',
														'aria-expanded': 'false',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Question A');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_6 = $.sibling(node_5, 2);

												$.component(node_6, () => Collapse.Content, ($$anchor, Collapse_Content) => {
													Collapse_Content($$anchor, {
														id: 'tab1-section',
														'aria-hidden': 'true',
														'aria-labelledby': 'tab1',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, questions[0]));
															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_4, 2);

									$.component(node_7, () => Collapse.Item, ($$anchor, Collapse_Item_1) => {
										Collapse_Item_1($$anchor, {
											value: '2',
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_2();
												var node_8 = $.first_child(fragment_10);

												$.component(node_8, () => Collapse.Trigger, ($$anchor, Collapse_Trigger_1) => {
													Collapse_Trigger_1($$anchor, {
														role: 'heading',
														'aria-level': 3,
														type: 'button',
														'aria-controls': 'tab2-section',
														'aria-expanded': 'false',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Question B');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_9 = $.sibling(node_8, 2);

												$.component(node_9, () => Collapse.Content, ($$anchor, Collapse_Content_1) => {
													Collapse_Content_1($$anchor, {
														id: 'tab2-section',
														'aria-hidden': 'true',
														'aria-labelledby': 'tab2',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_4 = $.text();

															$.template_effect(() => $.set_text(text_4, questions[1]));
															$.append($$anchor, text_4);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_6);
					};

					var node_10 = $.child(div_3);

					demoAndCode(node_10, () => demo, () => collapseDefault);
					$.reset(div_3);
				}

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	};

	const expanded = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_13 = root_3();
				var node_11 = $.first_child(fragment_13);

				LinkH2(node_11, {
					href: '/collapse#expanded',
					'aria-label': 'expanded',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('expanded');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});

				var div_4 = $.sibling(node_11, 2);

				{
					const demo = ($$anchor) => {
						var fragment_14 = $.comment();
						var node_12 = $.first_child(fragment_14);

						$.component(node_12, () => Collapse.Root, ($$anchor, Collapse_Root_1) => {
							Collapse_Root_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_15 = root_2();
									var node_13 = $.first_child(fragment_15);

									$.component(node_13, () => Collapse.Item, ($$anchor, Collapse_Item_2) => {
										Collapse_Item_2($$anchor, {
											value: '1',
											children: ($$anchor, $$slotProps) => {
												var fragment_16 = root_2();
												var node_14 = $.first_child(fragment_16);

												$.component(node_14, () => Collapse.Trigger, ($$anchor, Collapse_Trigger_2) => {
													Collapse_Trigger_2($$anchor, {
														role: 'heading',
														'aria-level': 3,
														type: 'button',
														'aria-controls': 'tab1-section',
														'aria-expanded': 'false',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Question A');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_14, 2);

												$.component(node_15, () => Collapse.Content, ($$anchor, Collapse_Content_2) => {
													Collapse_Content_2($$anchor, {
														id: 'tab2-section',
														'aria-hidden': 'true',
														'aria-labelledby': 'tab2',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text();

															$.template_effect(() => $.set_text(text_7, questions[0]));
															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_16);
											},
											$$slots: { default: true }
										});
									});

									var node_16 = $.sibling(node_13, 2);

									$.component(node_16, () => Collapse.Item, ($$anchor, Collapse_Item_3) => {
										Collapse_Item_3($$anchor, {
											defaultExpanded: true,
											value: '2',
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root_2();
												var node_17 = $.first_child(fragment_18);

												$.component(node_17, () => Collapse.Trigger, ($$anchor, Collapse_Trigger_3) => {
													Collapse_Trigger_3($$anchor, {
														role: 'heading',
														'aria-level': 3,
														type: 'button',
														'aria-controls': 'tab2-section',
														'aria-expanded': 'true',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Question B');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												var node_18 = $.sibling(node_17, 2);

												$.component(node_18, () => Collapse.Content, ($$anchor, Collapse_Content_3) => {
													Collapse_Content_3($$anchor, {
														id: 'tab2-section',
														'aria-hidden': 'false',
														'aria-labelledby': 'tab2',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text();

															$.template_effect(() => $.set_text(text_9, questions[1]));
															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_15);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_14);
					};

					var node_19 = $.child(div_4);

					demoAndCode(node_19, () => demo, () => collapseExpanded);
					$.reset(div_4);
				}

				$.append($$anchor, fragment_13);
			},
			$$slots: { default: true }
		});
	};

	const multiple = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_21 = root_3();
				var node_20 = $.first_child(fragment_21);

				LinkH2(node_20, {
					href: '/collapse#multiple',
					'aria-label': 'multiple',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_10 = $.text('multiple');

						$.append($$anchor, text_10);
					},
					$$slots: { default: true }
				});

				var div_5 = $.sibling(node_20, 2);

				{
					const demo = ($$anchor) => {
						var fragment_22 = $.comment();
						var node_21 = $.first_child(fragment_22);

						$.component(node_21, () => Collapse.Root, ($$anchor, Collapse_Root_2) => {
							Collapse_Root_2($$anchor, {
								multiple: true,
								children: ($$anchor, $$slotProps) => {
									var fragment_23 = root_2();
									var node_22 = $.first_child(fragment_23);

									$.component(node_22, () => Collapse.Item, ($$anchor, Collapse_Item_4) => {
										Collapse_Item_4($$anchor, {
											value: '1',
											children: ($$anchor, $$slotProps) => {
												var fragment_24 = root_2();
												var node_23 = $.first_child(fragment_24);

												$.component(node_23, () => Collapse.Trigger, ($$anchor, Collapse_Trigger_4) => {
													Collapse_Trigger_4($$anchor, {
														role: 'heading',
														'aria-level': 3,
														type: 'button',
														'aria-controls': 'tab1-section',
														'aria-expanded': 'false',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text('Question A');

															$.append($$anchor, text_11);
														},
														$$slots: { default: true }
													});
												});

												var node_24 = $.sibling(node_23, 2);

												$.component(node_24, () => Collapse.Content, ($$anchor, Collapse_Content_4) => {
													Collapse_Content_4($$anchor, {
														id: 'tab2-section',
														'aria-hidden': 'true',
														'aria-labelledby': 'tab2',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text();

															$.template_effect(() => $.set_text(text_12, questions[0]));
															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_24);
											},
											$$slots: { default: true }
										});
									});

									var node_25 = $.sibling(node_22, 2);

									$.component(node_25, () => Collapse.Item, ($$anchor, Collapse_Item_5) => {
										Collapse_Item_5($$anchor, {
											value: '2',
											children: ($$anchor, $$slotProps) => {
												var fragment_26 = root_2();
												var node_26 = $.first_child(fragment_26);

												$.component(node_26, () => Collapse.Trigger, ($$anchor, Collapse_Trigger_5) => {
													Collapse_Trigger_5($$anchor, {
														role: 'heading',
														'aria-level': 3,
														type: 'button',
														'aria-controls': 'tab2-section',
														'aria-expanded': 'true',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_13 = $.text('Question B');

															$.append($$anchor, text_13);
														},
														$$slots: { default: true }
													});
												});

												var node_27 = $.sibling(node_26, 2);

												$.component(node_27, () => Collapse.Content, ($$anchor, Collapse_Content_5) => {
													Collapse_Content_5($$anchor, {
														id: 'tab2-section',
														'aria-hidden': 'false',
														'aria-labelledby': 'tab2',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_14 = $.text();

															$.template_effect(() => $.set_text(text_14, questions[1]));
															$.append($$anchor, text_14);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_26);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_23);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_22);
					};

					var node_28 = $.child(div_5);

					demoAndCode(node_28, () => demo, () => collapseMultiple);
					$.reset(div_5);
				}

				$.append($$anchor, fragment_21);
			},
			$$slots: { default: true }
		});
	};

	const size = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_29 = root_3();
				var node_29 = $.first_child(fragment_29);

				LinkH2(node_29, {
					href: '/collapse#small',
					'aria-label': 'small',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_15 = $.text('small');

						$.append($$anchor, text_15);
					},
					$$slots: { default: true }
				});

				var div_6 = $.sibling(node_29, 2);

				{
					const demo = ($$anchor) => {
						var fragment_30 = $.comment();
						var node_30 = $.first_child(fragment_30);

						$.component(node_30, () => Collapse.Root, ($$anchor, Collapse_Root_3) => {
							Collapse_Root_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_31 = $.comment();
									var node_31 = $.first_child(fragment_31);

									$.component(node_31, () => Collapse.Item, ($$anchor, Collapse_Item_6) => {
										Collapse_Item_6($$anchor, {
											size: 'small',
											value: '1',
											children: ($$anchor, $$slotProps) => {
												var fragment_32 = root_2();
												var node_32 = $.first_child(fragment_32);

												$.component(node_32, () => Collapse.Trigger, ($$anchor, Collapse_Trigger_6) => {
													Collapse_Trigger_6($$anchor, {
														role: 'heading',
														'aria-level': 3,
														type: 'button',
														'aria-controls': 'tab1-section',
														'aria-expanded': 'false',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_16 = $.text('Question A');

															$.append($$anchor, text_16);
														},
														$$slots: { default: true }
													});
												});

												var node_33 = $.sibling(node_32, 2);

												$.component(node_33, () => Collapse.Content, ($$anchor, Collapse_Content_6) => {
													Collapse_Content_6($$anchor, {
														id: 'tab1-section',
														'aria-hidden': 'true',
														'aria-labelledby': 'tab1',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_17 = $.text();

															$.template_effect(() => $.set_text(text_17, questions[0]));
															$.append($$anchor, text_17);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_32);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_31);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_30);
					};

					var node_34 = $.child(div_6);

					demoAndCode(node_34, () => demo, () => collapseSize);
					$.reset(div_6);
				}

				$.append($$anchor, fragment_29);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_42 = root_12();
		var node_47 = $.first_child(fragment_42);

		collapse(node_47);

		var node_48 = $.sibling(node_47, 2);

		tabSnip(node_48);

		var node_49 = $.sibling(node_48, 2);

		{
			var consequent = ($$anchor) => {
				var section = root_10();
				var node_50 = $.child(section);

				defaultCollapse(node_50);

				var node_51 = $.sibling(node_50, 2);

				expanded(node_51);

				var node_52 = $.sibling(node_51, 2);

				multiple(node_52);

				var node_53 = $.sibling(node_52, 2);

				size(node_53);
				$.reset(section);
				$.transition(3, section, () => fade);
				$.append($$anchor, section);
			};

			$.if(node_49, ($$render) => {
				if ($.get(selected) == "implementation") $$render(consequent);
			});
		}

		var node_54 = $.sibling(node_49, 2);

		{
			var consequent_1 = ($$anchor) => {
				var section_1 = root_11();
				var node_55 = $.child(section_1);

				accessibility(node_55);
				$.reset(section_1);
				$.transition(3, section_1, () => fade);
				$.append($$anchor, section_1);
			};

			$.if(node_54, ($$render) => {
				if ($.get(selected) == "accessibility") $$render(consequent_1);
			});
		}

		var node_56 = $.sibling(node_54, 2);

		prevAndNext(node_56);
		$.append($$anchor, fragment_42);
	};

	let selected = $.state("implementation");

	const questions = [
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
		"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
	];

	$.head('26ye2c', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Collapse';
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