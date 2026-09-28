import * as $ from 'svelte/internal/server';

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

export default function Transactions($$renderer, $$props) {
	let { dark } = $$props;

	// Define the state type to match StatusBadge requirements
	const headers = [
		"Transaction",
		"Date & Time",
		"Amount",
		"Reference number",
		"Payment method",
		"Status"
	];

	let dateRange = { from: undefined, to: undefined };

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

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Card($$renderer, {
			size: 'xl',
			class: 'max-w-none p-4 shadow-sm sm:p-6',
			children: ($$renderer) => {
				$$renderer.push(`<div class="items-center justify-between lg:flex"><div class="mt-px mb-4 lg:mb-0">`);

				Heading($$renderer, {
					tag: 'h3',
					class: 'mb-2 -ml-0.25 text-xl font-semibold dark:text-white',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Transactions`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <span class="text-base font-normal text-gray-500 dark:text-gray-300">This is a list of latest transactions</span></div> <div class="items-center justify-between gap-3 space-y-4 sm:flex sm:space-y-0"><div class="flex items-center">`);

				Button($$renderer, {
					color: 'alternative',
					class: 'w-fit px-4 py-2 whitespace-nowrap',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Filter by status `);
						ChevronDownOutline($$renderer, { size: 'lg' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Dropdown($$renderer, {
					simple: true,
					class: 'w-48 space-y-2 text-sm',
					placement: 'bottom-start',
					children: ($$renderer) => {
						DropdownItem($$renderer, {
							children: ($$renderer) => {
								Checkbox($$renderer, {
									class: 'accent-primary-600',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Completed (56)`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropdownItem($$renderer, {
							children: ($$renderer) => {
								Checkbox($$renderer, {
									checked: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Cancelled (56)`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropdownItem($$renderer, {
							children: ($$renderer) => {
								Checkbox($$renderer, {
									class: 'accent-primary-600',
									children: ($$renderer) => {
										$$renderer.push(`<!---->In progress (56)`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropdownItem($$renderer, {
							children: ($$renderer) => {
								Checkbox($$renderer, {
									checked: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->In review (97)`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div class="flex items-center space-x-4">`);

				Datepicker($$renderer, {
					range: true,
					color: 'pink',
					inputClass: 'w-64',
					get rangeFrom() {
						return dateRange.from;
					},

					set rangeFrom($$value) {
						dateRange.from = $$value;
						$$settled = false;
					},

					get rangeTo() {
						return dateRange.to;
					},

					set rangeTo($$value) {
						dateRange.to = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div></div></div> `);

				Table($$renderer, {
					hoverable: true,
					striped: true,
					class: 'mt-6 min-w-full divide-y divide-gray-200 dark:divide-gray-600',
					children: ($$renderer) => {
						TableHead($$renderer, {
							class: 'bg-gray-50 dark:bg-gray-700',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(headers);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let header = each_array[$$index];

									TableHeadCell($$renderer, {
										class: 'p-4 font-normal whitespace-nowrap',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(header)}`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						TableBody($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array_1 = $.ensure_array_like(data);

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let [name, date, amount, reference, method, status] = each_array_1[$$index_1];

									TableBodyRow($$renderer, {
										children: ($$renderer) => {
											TableBodyCell($$renderer, {
												class: 'px-4 font-normal',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(name)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											TableBodyCell($$renderer, {
												class: 'px-4 font-normal text-gray-500 dark:text-gray-300',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(date)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											TableBodyCell($$renderer, {
												class: 'px-4',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(amount)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											TableBodyCell($$renderer, {
												class: 'px-4 font-normal  text-gray-500 dark:text-gray-300',
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(reference)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											TableBodyCell($$renderer, {
												class: 'flex items-center gap-2 px-4 font-normal  text-gray-500 dark:text-gray-300',
												children: ($$renderer) => {
													CreditCard($$renderer, { number: method });
													$$renderer.push(`<!----> <span>••• ${$.escape(method)}</span>`);
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!----> `);

											TableBodyCell($$renderer, {
												class: 'px-4 font-normal',
												children: ($$renderer) => {
													StatusBadge($$renderer, { state: status, dark });
												},
												$$slots: { default: true }
											});

											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="-mb-1 flex items-center justify-between pt-3 sm:pt-6">`);
				DateRangeSelector($$renderer, {});
				$$renderer.push(`<!----> <a href="#top" class="text-primary-700 dark:text-primary-500 inline-flex items-center rounded-lg p-1 text-xs font-medium uppercase hover:bg-gray-100 sm:text-sm dark:hover:bg-gray-700">Transactions report `);
				ChevronRightOutline($$renderer, { size: 'lg' });
				$$renderer.push(`<!----></a></div>`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}