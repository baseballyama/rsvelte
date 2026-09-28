import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	addDays,
	subDays,
	isAfter,
	isSameDay,
	startOfWeek,
	endOfWeek,
	addMonths,
	startOfMonth
} from 'date-fns';

import { Month } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="grid grid-cols-[1fr,1fr] gap-10"><div><!></div> <div><!></div></div>`);
var root_1 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Show Outside Days</h2> <!> <h2>Disabled days w/ single</h2> <!> <h2>Disabled days w/ array</h2> <!> <h2>Disabled days w/ range</h2> <!> <h2>Disabled days w/ function</h2> <!> <h2>Selected w/ single</h2> <!> <h2>Selected w/ array</h2> <!> <h2>Selected w/ range</h2> <!> <h2>Selected state w/ single</h2> <!> <h2>Selected state w/ array</h2> <!> <h2>Selected state w/ range</h2> <!> <h2>Selected state w/ week</h2> <!> <h2>Selected state w/ multi-month</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let selected = null;
	let selectedArr = [];
	let selectedRange = { from: null, to: null };
	let selectedWeek = { from: null, to: null };
	let selectedMultiMonth = { from: null, to: null };
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, { showOutsideDays: true });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, { disabledDates: new Date() });
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [subDays(new Date(), 2), new Date(), addDays(new Date(), 2)]);

				Month($$anchor, {
					get disabledDates() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => ({ from: subDays(new Date(), 2), to: addDays(new Date(), 2) }));

				Month($$anchor, {
					get disabledDates() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, { disabledDates: (date) => isAfter(date, new Date()) });
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, { selected: new Date() });
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [subDays(new Date(), 2), new Date(), addDays(new Date(), 2)]);

				Month($$anchor, {
					get selected() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => ({ from: subDays(new Date(), 2), to: addDays(new Date(), 2) }));

				Month($$anchor, {
					get selected() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, {
				get selected() {
					return selected;
				},

				$$events: {
					dateChange: (e) => {
						selected = e.detail;
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, {
				get selected() {
					return selectedArr;
				},

				$$events: {
					dateChange: (e) => {
						const date = e.detail;

						if (selectedArr.some((d) => isSameDay(d, date))) {
							selectedArr = selectedArr.filter((d) => !isSameDay(d, date));
						} else {
							selectedArr = [...selectedArr, date];
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, {
				get selected() {
					return selectedRange;
				},

				$$events: {
					dateChange: (e) => {
						const date = e.detail;
						const newSelectedRange = { ...selectedRange };

						if (selectedRange.from === null) {
							newSelectedRange.from = date;
						} else if (isSameDay(date, selectedRange.from)) {
							newSelectedRange.from = null;
						} else if (selectedRange.to === null) {
							if (isAfter(date, selectedRange.from)) {
								newSelectedRange.to = date;
							} else {
								newSelectedRange.to = selectedRange.from;
								newSelectedRange.from = date;
							}
						} else if (isSameDay(date, selectedRange.to)) {
							newSelectedRange.to = null;
						} else {
							newSelectedRange.from = date;
							newSelectedRange.to = null;
						}

						selectedRange = newSelectedRange;
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			Month($$anchor, {
				get selected() {
					return selectedWeek;
				},

				$$events: {
					dateChange: (e) => {
						const date = e.detail;

						selectedWeek = { from: startOfWeek(date), to: endOfWeek(date) };
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var div_1 = $.child(div);
			var node_14 = $.child(div_1);

			Month(node_14, {
				get selected() {
					return selectedMultiMonth;
				},

				$$events: {
					dateChange: (e) => {
						const date = e.detail;
						const newSelectedRange = { ...selectedMultiMonth };

						if (selectedMultiMonth.from === null) {
							newSelectedRange.from = date;
						} else if (isSameDay(date, selectedMultiMonth.from)) {
							newSelectedRange.from = null;
						} else if (selectedMultiMonth.to === null) {
							if (isAfter(date, selectedMultiMonth.from)) {
								newSelectedRange.to = date;
							} else {
								newSelectedRange.to = selectedMultiMonth.from;
								newSelectedRange.from = date;
							}
						} else if (isSameDay(date, selectedMultiMonth.to)) {
							newSelectedRange.to = null;
						} else {
							newSelectedRange.from = date;
							newSelectedRange.to = null;
						}

						selectedMultiMonth = newSelectedRange;
					}
				}
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_15 = $.child(div_2);

			{
				let $0 = $.derived(() => startOfMonth(addMonths(new Date(), 1)));

				Month(node_15, {
					get selected() {
						return selectedMultiMonth;
					},

					get startOfMonth() {
						return $.get($0);
					},

					$$events: {
						dateChange: (e) => {
							const date = e.detail;
							const newSelectedRange = { ...selectedMultiMonth };

							if (selectedMultiMonth.from === null) {
								newSelectedRange.from = date;
							} else if (isSameDay(date, selectedMultiMonth.from)) {
								newSelectedRange.from = null;
							} else if (selectedMultiMonth.to === null) {
								if (isAfter(date, selectedMultiMonth.from)) {
									newSelectedRange.to = date;
								} else {
									newSelectedRange.to = selectedMultiMonth.from;
									newSelectedRange.from = date;
								}
							} else if (isSameDay(date, selectedMultiMonth.to)) {
								newSelectedRange.to = null;
							} else {
								newSelectedRange.from = date;
								newSelectedRange.to = null;
							}

							selectedMultiMonth = newSelectedRange;
						}
					}
				});
			}

			$.reset(div_2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}