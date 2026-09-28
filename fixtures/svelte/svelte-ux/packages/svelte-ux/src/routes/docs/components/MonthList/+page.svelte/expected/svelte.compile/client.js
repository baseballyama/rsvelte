import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	addMonths,
	subMonths,
	isSameMonth,
	isAfter,
	startOfQuarter,
	endOfQuarter
} from 'date-fns';

import { MonthList } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="grid grid-flow-col"><!></div>`);
var root_1 = $.from_html(`<div class="grid"><!></div>`);
var root_2 = $.from_html(`<div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))]"><!></div>`);
var root_3 = $.from_html(`<div class="grid grid-cols-3"><!></div>`);
var root_4 = $.from_html(`<div class="grid grid-cols-6"><!></div>`);
var root_5 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Horizontal layout</h2> <!> <h2>Vertical layout</h2> <!> <h2>Auto columns (100px)</h2> <!> <h2>3 columns</h2> <!> <h2>Format w/ as name</h2> <!> <h2>Format w/ as number</h2> <!> <h2>Disabled months w/ single</h2> <!> <h2>Disabled months w/ array</h2> <!> <h2>Disabled months w/ range</h2> <!> <h2>Disabled months w/ function</h2> <!> <h2>Selected w/ single</h2> <!> <h2>Selected w/ array</h2> <!> <h2>Selected w/ range</h2> <!> <h2>Selected state w/ single</h2> <!> <h2>Selected state w/ array</h2> <!> <h2>Selected state w/ range</h2> <!> <h2>Selected state w/ quarter</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let selected = null;
	let selectedArr = [];
	let selectedRange = { from: null, to: null };
	let selectedQuarter = { from: null, to: null };
	var fragment = root_5();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			MonthList($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_2 = $.child(div);

			MonthList(node_2, {});
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_1, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();
			var node_4 = $.child(div_1);

			MonthList(node_4, {});
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_3, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			var div_2 = root_2();
			var node_6 = $.child(div_2);

			MonthList(node_6, {});
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_5, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_3();
			var node_8 = $.child(div_3);

			MonthList(node_8, {});
			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_7, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_2();
			var node_10 = $.child(div_4);

			MonthList(node_10, { format: 'MMMM' });
			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_9, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			MonthList($$anchor, { format: 'M' });
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			MonthList($$anchor, { disabledDates: new Date() });
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 4);

	Preview(node_13, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [
					subMonths(new Date(), 2),
					new Date(),
					addMonths(new Date(), 2)
				]);

				MonthList($$anchor, {
					get disabledDates() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => ({ from: subMonths(new Date(), 2), to: addMonths(new Date(), 2) }));

				MonthList($$anchor, {
					get disabledDates() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 4);

	Preview(node_15, {
		children: ($$anchor, $$slotProps) => {
			MonthList($$anchor, { disabledDates: (date) => isAfter(date, new Date()) });
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 4);

	Preview(node_16, {
		children: ($$anchor, $$slotProps) => {
			MonthList($$anchor, { selected: new Date() });
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 4);

	Preview(node_17, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [
					subMonths(new Date(), 2),
					new Date(),
					addMonths(new Date(), 2)
				]);

				MonthList($$anchor, {
					get selected() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => ({ from: subMonths(new Date(), 2), to: addMonths(new Date(), 2) }));

				MonthList($$anchor, {
					get selected() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 4);

	Preview(node_19, {
		children: ($$anchor, $$slotProps) => {
			MonthList($$anchor, {
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

	var node_20 = $.sibling(node_19, 4);

	Preview(node_20, {
		children: ($$anchor, $$slotProps) => {
			MonthList($$anchor, {
				get selected() {
					return selectedArr;
				},

				$$events: {
					dateChange: (e) => {
						const date = e.detail;

						if (selectedArr.some((d) => isSameMonth(d, date))) {
							selectedArr = selectedArr.filter((d) => !isSameMonth(d, date));
						} else {
							selectedArr = [...selectedArr, date];
						}
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_20, 4);

	Preview(node_21, {
		children: ($$anchor, $$slotProps) => {
			MonthList($$anchor, {
				get selected() {
					return selectedRange;
				},

				$$events: {
					dateChange: (e) => {
						const date = e.detail;
						const newSelectedRange = { ...selectedRange };

						if (selectedRange.from === null) {
							newSelectedRange.from = date;
						} else if (isSameMonth(date, selectedRange.from)) {
							newSelectedRange.from = null;
						} else if (selectedRange.to === null) {
							if (isAfter(date, selectedRange.from)) {
								newSelectedRange.to = date;
							} else {
								newSelectedRange.to = selectedRange.from;
								newSelectedRange.from = date;
							}
						} else if (isSameMonth(date, selectedRange.to)) {
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

	var node_22 = $.sibling(node_21, 4);

	Preview(node_22, {
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_4();
			var node_23 = $.child(div_5);

			MonthList(node_23, {
				get selected() {
					return selectedQuarter;
				},

				$$events: {
					dateChange: (e) => {
						const date = e.detail;

						selectedQuarter = { from: startOfQuarter(date), to: endOfQuarter(date) };
					}
				}
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}