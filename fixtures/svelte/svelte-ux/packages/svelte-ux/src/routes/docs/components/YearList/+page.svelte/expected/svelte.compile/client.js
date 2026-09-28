import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { addYears, startOfYear, subYears } from 'date-fns';
import { YearList } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="overflow-auto h-64"><!></div>`);
var root_1 = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Selected</h2> <!> <h2>Selected w/ Scroll into view</h2> <!> <h2>Min / Max date</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let selected = new Date('1982-03-30');
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			YearList($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			YearList($$anchor, {
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

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_3 = $.child(div);

			{
				let $0 = $.derived(() => subYears(selected, 10));
				let $1 = $.derived(() => addYears(selected, 10));

				YearList(node_3, {
					get minDate() {
						return $.get($0);
					},

					get maxDate() {
						return $.get($1);
					},

					get selected() {
						return selected;
					},

					$$events: {
						dateChange: (e) => {
							selected = e.detail;
						}
					}
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => startOfYear(subYears(new Date(), 3)));

				YearList($$anchor, {
					get minDate() {
						return $.get($0);
					},
					maxDate: new Date()
				});
			}
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}