import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Choicebox, Badge } from "$lib/index.js";

import {
	choiceboxCustomContent,
	choiceboxDefault,
	choiceboxDisabled,
	choiceboxMultiselect
} from "$lib/../docs/data/choicebox.js";

import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const choicebox = ($$anchor) => {
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
	var code_1 = root_7();
	var text_6 = $.only_child(code_1, true);

	$.template_effect(() => $.set_text(text_6, rct()));
	$.append($$anchor, code_1);
};

const bestPractices = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_8();
			var node_27 = $.first_child(fragment_16);

			LinkH2(node_27, {
				href: '/choicebox#best-practices',
				'aria-label': 'best practices',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('best practices');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var div_13 = $.sibling(node_27, 2);
			var ul = $.sibling($.child(div_13), 6);
			var li = $.sibling($.child(ul), 4);
			var node_28 = $.sibling($.child(li), 3);

			roundedCode(node_28, () => "Available on Pro");
			$.next();
			$.reset(li);
			$.reset(ul);

			var ul_1 = $.sibling(ul, 4);
			var li_1 = $.sibling($.child(ul_1), 2);
			var node_29 = $.sibling($.child(li_1));

			roundedCode(node_29, () => "$20/mo · 100 GB bandwidth");
			$.next();
			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var node_30 = $.sibling($.child(li_2));

			roundedCode(node_30, () => "aria-label");
			$.next();
			$.reset(li_2);
			$.reset(ul_1);

			var ul_2 = $.sibling(ul_1, 4);
			var li_3 = $.child(ul_2);
			var node_31 = $.sibling($.child(li_3));

			roundedCode(node_31, () => "<fieldset>");

			var node_32 = $.sibling(node_31, 2);

			roundedCode(node_32, () => "<legend>");
			$.next();
			$.reset(li_3);
			$.next(4);
			$.reset(ul_2);
			$.reset(div_13);
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
				previous: { title: "checkbox", href: "/checkbox" },
				next: { title: "collapse", href: "/collapse" }
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
	`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">choicebox</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">A larger form of Radio or Checkbox, where the user has a larger tap target and more
			details.</p>`,
	1
);

var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="w-full"><!></div>`);
var root_4 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_5 = $.from_html(`<div class="flex w-full flex-initial flex-col items-stretch justify-start gap-6"><!> <!></div>`);
var root_6 = $.from_html(`<div class="flex justify-center p-2"><!></div>`);
var root_7 = $.from_html(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs"> </code>`);

var root_8 = $.from_html(
	`<!> <div class="mt-4"><h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">When to use</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Use Choicebox when a choice benefits from a larger tap target plus a description or
					icon, like a framework picker, plan comparison, or deployment region with latency.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Single-select for mutually exclusive choices, multi-select for additive ones. Don’t
					mix the two within one group.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Cap at 4–6 tiles. Past that, switch to a <a href="/select" class="underline">Select</a> so the page doesn’t scroll for a single field. For plain text labels with no description,
					use <a href="/radio" class="underline">Radio</a>.</li></ul> <h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">Behavior</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">The whole tile is the click and focus target; tapping anywhere inside selects it.
					Don’t place nested buttons or links inside a tile that would steal the click.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Selected state shows a check or filled dot in the corner. The border highlight alone
					isn’t enough on low-contrast screens.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Disabled tiles need a <a href="/tooltip" class="underline">Tooltip</a> naming why (<!>). A faded tile with no reason reads as broken.</li></ul> <h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">Content</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Titles are parallel: one Title Case title plus one sentence-case description per
					tile, ending in a period.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Don’t restate the title in the description. The description adds the differentiator (<!>), not a synonym.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Icons are decorative when paired with a title; if the icon is the only label, give
					the tile an <!> naming the choice.</li></ul> <h3 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mt-6 mb-2 text-[16px] leading-6 font-semibold tracking-[-0.16px]">Accessibility</h3> <ul class="mt-2 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Tiles render as radios or checkboxes under the hood, so they are kept inside a <!> with a <!> so screen readers announce the group.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Arrow keys move within a single-select group, Space toggles in multi-select. Don’t
					override those keys with custom handlers.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Color is not the selection signal. Pair the highlight border with the corner check so
					colorblind users still see what’s active.</li></ul></div>`,
	1
);

var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	const defaultChoicebox = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_4();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/choicebox#Single-select',
					'aria-label': 'Single-select',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Single-select');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div_3 = $.sibling(node_2, 2);

				{
					const demo = ($$anchor) => {
						var div_4 = root_3();
						var node_3 = $.child(div_4);

						$.component(node_3, () => Choicebox.Group, ($$anchor, Choicebox_Group) => {
							Choicebox_Group($$anchor, {
								label: 'select a plan',
								type: 'radio',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_2();
									var node_4 = $.first_child(fragment_4);

									$.component(node_4, () => Choicebox.Item, ($$anchor, Choicebox_Item) => {
										Choicebox_Item($$anchor, {
											defaultChecked: true,
											description: 'Free for two weeks',
											title: 'Pro Trial',
											value: 'trial'
										});
									});

									var node_5 = $.sibling(node_4, 2);

									$.component(node_5, () => Choicebox.Item, ($$anchor, Choicebox_Item_1) => {
										Choicebox_Item_1($$anchor, { description: 'Get started now', title: 'Pro', value: 'pro' });
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_4);
						$.append($$anchor, div_4);
					};

					var node_6 = $.child(div_3);

					demoAndCode(node_6, () => demo, () => choiceboxDefault);
					$.reset(div_3);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const multiselect = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_6 = root_4();
				var node_7 = $.first_child(fragment_6);

				LinkH2(node_7, {
					href: '/choicebox#multiselect',
					'aria-label': 'multiselect',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('multiselect');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var div_5 = $.sibling(node_7, 2);

				{
					const demo = ($$anchor) => {
						var div_6 = root_3();
						var node_8 = $.child(div_6);

						$.component(node_8, () => Choicebox.Group, ($$anchor, Choicebox_Group_1) => {
							Choicebox_Group_1($$anchor, {
								label: 'select a plan',
								type: 'checkbox',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();
									var node_9 = $.first_child(fragment_7);

									$.component(node_9, () => Choicebox.Item, ($$anchor, Choicebox_Item_2) => {
										Choicebox_Item_2($$anchor, {
											description: 'Free for two weeks',
											title: 'Pro Trial',
											value: 'trial'
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Choicebox.Item, ($$anchor, Choicebox_Item_3) => {
										Choicebox_Item_3($$anchor, { description: 'Get started now', title: 'Pro', value: 'pro' });
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_6);
						$.append($$anchor, div_6);
					};

					var node_11 = $.child(div_5);

					demoAndCode(node_11, () => demo, () => choiceboxMultiselect);
					$.reset(div_5);
				}

				$.append($$anchor, fragment_6);
			},
			$$slots: { default: true }
		});
	};

	const disabled = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_9 = root_4();
				var node_12 = $.first_child(fragment_9);

				LinkH2(node_12, {
					href: '/choicebox#disabled',
					'aria-label': 'disabled',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('disabled');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var div_7 = $.sibling(node_12, 2);

				{
					const demo = ($$anchor) => {
						var div_8 = root_5();
						var node_13 = $.child(div_8);

						$.component(node_13, () => Choicebox.Group, ($$anchor, Choicebox_Group_2) => {
							Choicebox_Group_2($$anchor, {
								label: 'Choicebox group disabled',
								disabled: true,
								type: 'radio',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_10 = root_2();
									var node_14 = $.first_child(fragment_10);

									$.component(node_14, () => Choicebox.Item, ($$anchor, Choicebox_Item_4) => {
										Choicebox_Item_4($$anchor, {
											description: 'Free for two weeks',
											title: 'Pro Trial',
											value: 'trial'
										});
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Choicebox.Item, ($$anchor, Choicebox_Item_5) => {
										Choicebox_Item_5($$anchor, { description: 'Get started now', title: 'Pro', value: 'pro' });
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						var node_16 = $.sibling(node_13, 2);

						$.component(node_16, () => Choicebox.Group, ($$anchor, Choicebox_Group_3) => {
							Choicebox_Group_3($$anchor, {
								label: 'Single input disabled',
								type: 'checkbox',
								get value() {
									return $.get(value2);
								},

								set value($$value) {
									$.set(value2, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_2();
									var node_17 = $.first_child(fragment_11);

									$.component(node_17, () => Choicebox.Item, ($$anchor, Choicebox_Item_6) => {
										Choicebox_Item_6($$anchor, {
											description: 'Free for two weeks',
											disabled: true,
											title: 'Pro Trial',
											value: 'trial'
										});
									});

									var node_18 = $.sibling(node_17, 2);

									$.component(node_18, () => Choicebox.Item, ($$anchor, Choicebox_Item_7) => {
										Choicebox_Item_7($$anchor, { description: 'Get started now', title: 'Pro', value: 'pro' });
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_8);
						$.append($$anchor, div_8);
					};

					var node_19 = $.child(div_7);

					demoAndCode(node_19, () => demo, () => choiceboxDisabled);
					$.reset(div_7);
				}

				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	};

	const customContent = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_13 = root_4();
				var node_20 = $.first_child(fragment_13);

				LinkH2(node_20, {
					href: '/choicebox#custom-content',
					'aria-label': 'custom content',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('custom content');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				var div_9 = $.sibling(node_20, 2);

				{
					const demo = ($$anchor) => {
						var div_10 = root_3();
						var node_21 = $.child(div_10);

						$.component(node_21, () => Choicebox.Group, ($$anchor, Choicebox_Group_4) => {
							Choicebox_Group_4($$anchor, {
								label: 'select a plan',
								type: 'radio',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_2();
									var node_22 = $.first_child(fragment_14);

									$.component(node_22, () => Choicebox.Item, ($$anchor, Choicebox_Item_8) => {
										Choicebox_Item_8($$anchor, {
											description: 'Free for two weeks',
											title: 'Pro Trial',
											value: 'trial',
											children: ($$anchor, $$slotProps) => {
												var div_11 = root_6();
												var node_23 = $.child(div_11);

												Badge(node_23, {
													variant: 'trial',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_4 = $.text('Trial');

														$.append($$anchor, text_4);
													},
													$$slots: { default: true }
												});

												$.reset(div_11);
												$.append($$anchor, div_11);
											},
											$$slots: { default: true }
										});
									});

									var node_24 = $.sibling(node_22, 2);

									$.component(node_24, () => Choicebox.Item, ($$anchor, Choicebox_Item_9) => {
										Choicebox_Item_9($$anchor, {
											description: 'Get started now',
											title: 'Pro',
											value: 'pro',
											children: ($$anchor, $$slotProps) => {
												var div_12 = root_6();
												var node_25 = $.child(div_12);

												Badge(node_25, {
													variant: 'blue',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_5 = $.text('Pro');

														$.append($$anchor, text_5);
													},
													$$slots: { default: true }
												});

												$.reset(div_12);
												$.append($$anchor, div_12);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						$.reset(div_10);
						$.append($$anchor, div_10);
					};

					var node_26 = $.child(div_9);

					demoAndCode(node_26, () => demo, () => choiceboxCustomContent);
					$.reset(div_9);
				}

				$.append($$anchor, fragment_13);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_19 = root_9();
		var node_33 = $.first_child(fragment_19);

		choicebox(node_33);

		var node_34 = $.sibling(node_33, 2);

		defaultChoicebox(node_34);

		var node_35 = $.sibling(node_34, 2);

		multiselect(node_35);

		var node_36 = $.sibling(node_35, 2);

		disabled(node_36);

		var node_37 = $.sibling(node_36, 2);

		customContent(node_37);

		var node_38 = $.sibling(node_37, 2);

		bestPractices(node_38);

		var node_39 = $.sibling(node_38, 2);

		prevAndNext(node_39);
		$.append($$anchor, fragment_19);
	};

	let value = $.state("");
	let value2 = $.state($.proxy([]));

	$.head('p8j56z', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Choicebox';
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