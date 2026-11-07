import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	Card,
	Checkbox,
	Dropdown,
	DropdownItem,
	Heading,
	Table,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell,
	Datepicker
} from "flowbite-svelte";

import { ChevronDownOutline, ChevronRightOutline } from "flowbite-svelte-icons";
import { StatusBadge, CreditCard, DateRangeSelector } from "flowbite-svelte-admin-dashboard";

var root = $.from_html(`Filter by status <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <span> </span>`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<div class="items-center justify-between lg:flex"><div class="mt-px mb-4 lg:mb-0"><!> <span class="text-base font-normal text-gray-500 dark:text-gray-300">This is a list of latest transactions</span></div> <div class="items-center justify-between gap-3 space-y-4 sm:flex sm:space-y-0"><div class="flex items-center"><!> <!></div> <div class="flex items-center space-x-4"><!></div></div></div> <!> <div class="-mb-1 flex items-center justify-between pt-3 sm:pt-6"><!> <a href="#top" class="text-primary-700 dark:text-primary-500 inline-flex items-center rounded-lg p-1 text-xs font-medium uppercase hover:bg-gray-100 sm:text-sm dark:hover:bg-gray-700">Transactions report <!></a></div>`, 1);

export default function Transactions($$anchor, $$props) {
	// Define the state type to match StatusBadge requirements
	const headers = [
		"Transaction",
		"Date & Time",
		"Amount",
		"Reference number",
		"Payment method",
		"Status"
	];

	let dateRange = $.proxy({ from: undefined, to: undefined });

	// Update the type definition to include the specific StatusState type
	const data = [
		[
			"Payment from Bonnie Green",
			"Apr 23 ,2021",
			"$2300",
			"0047568936",
			475,
			"completed"
		],

		[
			"Payment refund to #00910",
			"Apr 23 ,2021",
			"-$670",
			"0078568936",
			924,
			"completed"
		],

		[
			"Payment failed from #087651",
			"Apr 18 ,2021",
			"$234",
			"0088568934",
			826,
			"cancelled"
		],

		[
			"Payment from Lana Byrd",
			"Apr 15 ,2021",
			"$5000",
			"0018568911",
			634,
			"inprogress"
		],

		[
			"Payment from Jese Leos",
			"Apr 15 ,2021",
			"$2300",
			"0045568939",
			163,
			"completed"
		],

		[
			"Refund to THEMESBERG LLC",
			"Apr 11 ,2021",
			"-$560",
			"0031568935",
			443,
			"inreview"
		],

		[
			"Payment from Lana Lysle",
			"Apr 6 ,2021",
			"$1437",
			"0023568934",
			223,
			"inreview"
		],

		[
			"Payment to Joseph Mcfall",
			"Apr 1 ,2021",
			"$980",
			"0057568935",
			362,
			"completed"
		],

		[
			"Payment from Alphabet",
			"Mar 23 ,2021",
			"$11,436",
			"00836143841",
			772,
			"inprogress"
		],

		[
			"Payment from Bonnie Green",
			"Mar 23 ,2021",
			"$560",
			"0031568935",
			123,
			"completed"
		]
	];

	Card($$anchor, {
		size: 'xl',
		class: 'max-w-none p-4 shadow-sm sm:p-6',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var div = $.first_child(fragment_1);
			var div_1 = $.child(div);
			var node = $.child(div_1);

			Heading(node, {
				tag: 'h3',
				class: 'mb-2 -ml-0.25 text-xl font-semibold dark:text-white',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Transactions');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.next(2);
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var div_3 = $.child(div_2);
			var node_1 = $.child(div_3);

			Button(node_1, {
				color: 'alternative',
				class: 'w-fit px-4 py-2 whitespace-nowrap',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root();
					var node_2 = $.sibling($.first_child(fragment_2));

					ChevronDownOutline(node_2, { size: 'lg' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_1, 2);

			Dropdown(node_3, {
				simple: true,
				class: 'w-48 space-y-2 text-sm',
				placement: 'bottom-start',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_4 = $.first_child(fragment_3);

					DropdownItem(node_4, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								class: 'accent-primary-600',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Completed (56)');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					DropdownItem(node_5, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								checked: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Cancelled (56)');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					DropdownItem(node_6, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								class: 'accent-primary-600',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('In progress (56)');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					DropdownItem(node_7, {
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {
								checked: true,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('In review (97)');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_3);

			var div_4 = $.sibling(div_3, 2);
			var node_8 = $.child(div_4);

			Datepicker(node_8, {
				range: true,
				color: 'pink',
				inputClass: 'w-64',
				get rangeFrom() {
					return dateRange.from;
				},

				set rangeFrom($$value) {
					dateRange.from = $$value;
				},

				get rangeTo() {
					return dateRange.to;
				},

				set rangeTo($$value) {
					dateRange.to = $$value;
				}
			});

			$.reset(div_4);
			$.reset(div_2);
			$.reset(div);

			var node_9 = $.sibling(div, 2);

			Table(node_9, {
				hoverable: true,
				striped: true,
				class: 'mt-6 min-w-full divide-y divide-gray-200 dark:divide-gray-600',
				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_4();
					var node_10 = $.first_child(fragment_8);

					TableHead(node_10, {
						class: 'bg-gray-50 dark:bg-gray-700',
						children: ($$anchor, $$slotProps) => {
							var fragment_9 = $.comment();
							var node_11 = $.first_child(fragment_9);

							$.each(node_11, 17, () => headers, $.index, ($$anchor, header) => {
								TableHeadCell($$anchor, {
									class: 'p-4 font-normal whitespace-nowrap',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text();

										$.template_effect(() => $.set_text(text_5, $.get(header)));
										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_10, 2);

					TableBody(node_12, {
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = $.comment();
							var node_13 = $.first_child(fragment_12);

							$.each(node_13, 17, () => data, $.index, ($$anchor, $$item) => {
								var $$array = $.derived(() => $.to_array($.get($$item), 6));
								let name = () => $.get($$array)[0];
								let date = () => $.get($$array)[1];
								let amount = () => $.get($$array)[2];
								let reference = () => $.get($$array)[3];
								let method = () => $.get($$array)[4];
								let status = () => $.get($$array)[5];

								TableBodyRow($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_14 = root_3();
										var node_14 = $.first_child(fragment_14);

										TableBodyCell(node_14, {
											class: 'px-4 font-normal',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text();

												$.template_effect(() => $.set_text(text_6, name()));
												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});

										var node_15 = $.sibling(node_14, 2);

										TableBodyCell(node_15, {
											class: 'px-4 font-normal text-gray-500 dark:text-gray-300',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text();

												$.template_effect(() => $.set_text(text_7, date()));
												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});

										var node_16 = $.sibling(node_15, 2);

										TableBodyCell(node_16, {
											class: 'px-4',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text();

												$.template_effect(() => $.set_text(text_8, amount()));
												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});

										var node_17 = $.sibling(node_16, 2);

										TableBodyCell(node_17, {
											class: 'px-4 font-normal  text-gray-500 dark:text-gray-300',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text();

												$.template_effect(() => $.set_text(text_9, reference()));
												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});

										var node_18 = $.sibling(node_17, 2);

										TableBodyCell(node_18, {
											class: 'flex items-center gap-2 px-4 font-normal  text-gray-500 dark:text-gray-300',
											children: ($$anchor, $$slotProps) => {
												var fragment_19 = root_2();
												var node_19 = $.first_child(fragment_19);

												CreditCard(node_19, {
													get number() {
														return method();
													}
												});

												var span = $.sibling(node_19, 2);
												var text_10 = $.only_child(span);

												$.template_effect(() => $.set_text(text_10, `••• ${method() ?? ''}`));
												$.append($$anchor, fragment_19);
											},
											$$slots: { default: true }
										});

										var node_20 = $.sibling(node_18, 2);

										TableBodyCell(node_20, {
											class: 'px-4 font-normal',
											children: ($$anchor, $$slotProps) => {
												StatusBadge($$anchor, {
													get state() {
														return status();
													},

													get dark() {
														return $$props.dark;
													}
												});
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_14);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			var div_5 = $.sibling(node_9, 2);
			var node_21 = $.child(div_5);

			DateRangeSelector(node_21, {});

			var a = $.sibling(node_21, 2);
			var node_22 = $.sibling($.child(a));

			ChevronRightOutline(node_22, { size: 'lg' });
			$.reset(a);
			$.reset(div_5);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}