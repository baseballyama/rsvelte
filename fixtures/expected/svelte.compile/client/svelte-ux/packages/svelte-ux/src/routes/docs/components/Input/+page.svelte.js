import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Input, SectionDivider } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="grid grid-cols-[60px,auto]"><span class="font-semibold">Input:</span> <!> <span class="font-semibold">input:</span> <input/></div>`);
var root_3 = $.from_html(`<h1>Examples</h1> <h2>Date</h2> <!> <h2>Date time</h2> <!> <h2>Telephone</h2> <!> <h2>Credit Card</h2> <!> <h2>MAC Address</h2> <!> <h2>Alphanumeric</h2> <!> <!> <h2>Formatted \`value\`</h2> <!> <h2>Unformatted \`value\`</h2> <!> <h2>Different (but compatible) \`value\` format</h2> <!> <h2>Partial \`value\`</h2> <!> <h2>Change event</h2> <!> <h2>With Field</h2> <!> <h2>Placeholder</h2> <!> <h2>bind:value</h2> <!>`, 1);

export default function _page($$anchor) {
	let value = 'test';
	var fragment = root_3();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, { mask: 'mm/dd/yyyy', replace: 'dmyh' });
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, { mask: 'mm/dd/yyyy hh:mm', replace: 'dmyh' });
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 4);

	Preview(node_2, {
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, { mask: '+1 (___) ___-____', replace: '_' });
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, { mask: '.... .... .... ....', replace: '.', accept: '\\d' });
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, { mask: 'XX:XX:XX:XX:XX:XX', replace: 'X', accept: '[\\dA-F]' });
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 4);

	Preview(node_5, {
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, { mask: '__-__-__-____', replace: '_', accept: '\\w' });
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	SectionDivider(node_6, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Props');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_8 = $.first_child(fragment_7);

			Input(node_8, { mask: 'mm/dd/yyyy', replace: 'dmyh', value: '03/30/1982' });

			var node_9 = $.sibling(node_8, 2);

			Input(node_9, {
				mask: '+1 (___) ___-____',
				replace: '_',
				value: '+1 (234) 567-8901'
			});

			var node_10 = $.sibling(node_9, 2);

			Input(node_10, {
				mask: '+1 (___) ___-____',
				replace: '_',
				value: '(234) 567-8901'
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_7, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_1();
			var node_12 = $.first_child(fragment_8);

			Input(node_12, { mask: 'mm/dd/yyyy', replace: 'dmyh', value: '03301982' });

			var node_13 = $.sibling(node_12, 2);

			Input(node_13, { mask: '+1 (___) ___-____', replace: '_', value: '2345678901' });
			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_11, 4);

	Preview(node_14, {
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, {
				mask: '+1 (___) ___-____',
				replace: '_',
				value: '234-567-8901'
			});
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_14, 4);

	Preview(node_15, {
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_1();
			var node_16 = $.first_child(fragment_10);

			Input(node_16, { mask: 'mm/dd/yyyy', replace: 'dmyh', value: '03/30' });

			var node_17 = $.sibling(node_16, 2);

			Input(node_17, { mask: '+1 (___) ___-____', replace: '_', value: '234' });
			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_15, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, {
				mask: 'mm/dd/yyyy',
				replace: 'dmyh',
				$$events: { change: (e) => console.log(e.detail) }
			});
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 4);

	Preview(node_19, {
		children: ($$anchor, $$slotProps) => {
			Field($$anchor, {
				label: 'Birth Date',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const id = $.derived(() => $$slotProps.id);

						Input($$anchor, {
							get id() {
								return $.get(id);
							},
							mask: 'mm/dd/yyyy',
							replace: 'dmyh'
						});
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_19, 4);

	Preview(node_20, {
		children: ($$anchor, $$slotProps) => {
			Input($$anchor, {
				placeholder: 'Please enter your birthday',
				mask: 'mm/dd/yyyy',
				replace: 'dmyh'
			});
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_20, 4);

	Preview(node_21, {
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node_22 = $.sibling($.child(div), 2);

			Input(node_22, {
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
				}
			});

			var input = $.sibling(node_22, 4);

			$.remove_input_defaults(input);
			$.reset(div);
			$.bind_value(input, () => value, ($$value) => value = $$value);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}