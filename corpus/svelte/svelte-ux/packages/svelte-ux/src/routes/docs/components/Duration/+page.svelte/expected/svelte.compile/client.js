import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { subDays, subSeconds } from 'date-fns';
import { Duration } from 'svelte-ux';
import { DurationUnits } from '@layerstack/utils';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="grid"><!> <!> <!> <!> <!> <!></div>`);
var root_1 = $.from_html(`<!> old`, 1);
var root_2 = $.from_html(`<h1>Examples</h1> <h2>Duration</h2> <!> <h2>Fixed range</h2> <!> <h2>Age</h2> <!> <h2>Explicit duration</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root_2();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_1 = $.child(div);

			Duration(node_1, { start: new Date() });

			var node_2 = $.sibling(node_1, 2);

			Duration(node_2, { start: new Date(), totalUnits: 1 });

			var node_3 = $.sibling(node_2, 2);

			Duration(node_3, { start: new Date(), totalUnits: 2 });

			var node_4 = $.sibling(node_3, 2);

			Duration(node_4, {
				start: new Date(),
				totalUnits: 2,
				get minUnits() {
					return DurationUnits.Second;
				}
			});

			var node_5 = $.sibling(node_4, 2);

			Duration(node_5, {
				start: new Date(),
				get minUnits() {
					return DurationUnits.Minute;
				}
			});

			var node_6 = $.sibling(node_5, 2);

			{
				let $0 = $.derived(() => subSeconds(new Date(), 55));

				Duration(node_6, {
					get start() {
						return $.get($0);
					},
					totalUnits: 1
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => subDays(new Date(), 3));
				let $1 = $.derived(() => subDays(new Date(), 1));

				Duration($$anchor, {
					get start() {
						return $.get($0);
					},

					get end() {
						return $.get($1);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_9 = $.first_child(fragment_2);

			Duration(node_9, {
				start: new Date('1982-03-30'),
				totalUnits: 1,
				variant: 'long'
			});

			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_8, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			Duration($$anchor, { duration: { milliseconds: 54321 } });
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}