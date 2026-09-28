import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { subDays } from 'date-fns';
import { mdiCalendarRange } from '@mdi/js';
import { DateRangeField } from 'svelte-ux';
import { PeriodType } from '@layerstack/utils';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<h1>Examples</h1> <h2>Default</h2> <!> <h2>Controlled</h2> <!> <h2>Clearable</h2> <!> <h2>PeriodType options</h2> <!> <h2>Single PeriodType options with presets</h2> <!> <h2>Single PeriodType options without presets</h2> <!> <h2>Icon</h2> <!> <h2>Stepper</h2> <!> <h2>Stepper w/ icon</h2> <!> <h2>Stepper w/ rounded & centered</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let today = new Date();

	let value = {
		from: subDays(today, 3),
		to: today,
		periodType: PeriodType.Day
	};

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			DateRangeField($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			DateRangeField($$anchor, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			DateRangeField($$anchor, {
				clearable: true,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [PeriodType.Day, PeriodType.Month, PeriodType.CalendarYear]);

				DateRangeField($$anchor, {
					get periodTypes() {
						return $.get($0);
					},

					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
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
				let $0 = $.derived(() => [PeriodType.Day]);

				DateRangeField($$anchor, {
					get periodTypes() {
						return $.get($0);
					},

					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => [PeriodType.Day]);

				DateRangeField($$anchor, {
					get periodTypes() {
						return $.get($0);
					},
					getPeriodTypePresets: () => [],
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
					}
				});
			}
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			DateRangeField($$anchor, {
				get icon() {
					return mdiCalendarRange;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			DateRangeField($$anchor, {
				stepper: true,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 4);

	Preview(node_8, {
		children: ($$anchor, $$slotProps) => {
			DateRangeField($$anchor, {
				stepper: true,
				get icon() {
					return mdiCalendarRange;
				},

				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 4);

	Preview(node_9, {
		children: ($$anchor, $$slotProps) => {
			DateRangeField($$anchor, {
				stepper: true,
				rounded: true,
				center: true,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}