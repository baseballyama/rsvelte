import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { mdiCheck, mdiClose } from '@mdi/js';
import { Button, Icon, Switch } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

var root = $.from_html(`<div class="grid gap-2"><!> <!></div>`);
var root_1 = $.from_html(`<div class="grid gap-2"><label class="flex gap-2 items-center text-sm">Click me <!></label> <label class="flex gap-2 items-center text-sm"><!> Click me</label></div>`);
var root_2 = $.from_html(`<div class="grid gap-2"><!> <!> <!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="inline-grid grid-cols-[auto,auto] gap-2"><!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);
var root_5 = $.from_html(`<h1>Examples</h1> <h2>Basic</h2> <!> <h2>Label</h2> <!> <h2>Icons</h2> <!> <h2>Disabled</h2> <!> <h2></h2> <!> <h2>Size</h2> <!> <h2>Color</h2> <!> <h2>Custom classes</h2> <!>`, 1);

export default function _page($$anchor) {
	let checked = null;
	var fragment = root_5();
	var node = $.sibling($.first_child(fragment), 4);

	Preview(node, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_1 = $.child(div);

			Switch(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			Switch(node_2, { checked: true });
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 4);

	Preview(node_3, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root_1();
			var label = $.child(div_1);
			var node_4 = $.sibling($.child(label));

			Switch(node_4, {});
			$.reset(label);

			var label_1 = $.sibling(label, 2);
			var node_5 = $.child(label_1);

			Switch(node_5, {});
			$.next();
			$.reset(label_1);
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 4);

	Preview(node_6, {
		children: ($$anchor, $$slotProps) => {
			var div_2 = root();
			var node_7 = $.child(div_2);

			Switch(node_7, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const checked = $.derived(() => $$slotProps.checked);
						var fragment_1 = $.comment();
						var node_8 = $.first_child(fragment_1);

						{
							var consequent = ($$anchor) => {
								Icon($$anchor, {
									get data() {
										return mdiCheck;
									},
									class: 'text-primary',
									size: '.8em'
								});
							};

							$.if(node_8, ($$render) => {
								if ($.get(checked)) $$render(consequent);
							});
						}

						$.append($$anchor, fragment_1);
					}
				}
			});

			var node_9 = $.sibling(node_7, 2);

			Switch(node_9, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const checked = $.derived(() => $$slotProps.checked);
						var fragment_3 = $.comment();
						var node_10 = $.first_child(fragment_3);

						{
							var consequent_1 = ($$anchor) => {
								Icon($$anchor, {
									get data() {
										return mdiCheck;
									},
									class: 'text-primary',
									size: '.8em'
								});
							};

							var alternate = ($$anchor) => {
								Icon($$anchor, {
									get data() {
										return mdiClose;
									},
									class: 'text-surface-content',
									size: '.8em'
								});
							};

							$.if(node_10, ($$render) => {
								if ($.get(checked)) $$render(consequent_1); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_3);
					}
				}
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_6, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root_2();
			var node_12 = $.child(div_3);

			Switch(node_12, { disabled: true });

			var node_13 = $.sibling(node_12, 2);

			Switch(node_13, { disabled: true, checked: true });

			var node_14 = $.sibling(node_13, 2);

			Switch(node_14, {
				disabled: true,
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, {
						get data() {
							return mdiCheck;
						},
						class: 'text-surface-content/50',
						size: '.8em'
					});
				},
				$$slots: { default: true }
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var h2 = $.sibling(node_11, 2);

	h2.textContent = 'checked=';

	var node_15 = $.sibling(h2, 2);

	Preview(node_15, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_3();
			var node_16 = $.first_child(fragment_7);

			Switch(node_16, {
				get checked() {
					return checked;
				},

				set checked($$value) {
					checked = $$value;
				}
			});

			var node_17 = $.sibling(node_16, 2);

			Button(node_17, {
				size: 'sm',
				$$events: { click: () => checked = null },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('reset');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_15, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			var div_4 = root_2();
			var node_19 = $.child(div_4);

			Switch(node_19, { size: 'sm' });

			var node_20 = $.sibling(node_19, 2);

			Switch(node_20, { size: 'md' });

			var node_21 = $.sibling(node_20, 2);

			Switch(node_21, { size: 'lg' });
			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_18, 4);

	Preview(node_22, {
		children: ($$anchor, $$slotProps) => {
			var div_5 = root_4();
			var node_23 = $.child(div_5);

			Switch(node_23, { color: 'primary' });

			var node_24 = $.sibling(node_23, 2);

			Switch(node_24, { checked: true, color: 'primary' });

			var node_25 = $.sibling(node_24, 2);

			Switch(node_25, { color: 'secondary' });

			var node_26 = $.sibling(node_25, 2);

			Switch(node_26, { checked: true, color: 'secondary' });

			var node_27 = $.sibling(node_26, 2);

			Switch(node_27, { color: 'accent' });

			var node_28 = $.sibling(node_27, 2);

			Switch(node_28, { checked: true, color: 'accent' });

			var node_29 = $.sibling(node_28, 2);

			Switch(node_29, { color: 'neutral' });

			var node_30 = $.sibling(node_29, 2);

			Switch(node_30, { checked: true, color: 'neutral' });

			var node_31 = $.sibling(node_30, 2);

			Switch(node_31, { color: 'success' });

			var node_32 = $.sibling(node_31, 2);

			Switch(node_32, { checked: true, color: 'success' });

			var node_33 = $.sibling(node_32, 2);

			Switch(node_33, { color: 'danger' });

			var node_34 = $.sibling(node_33, 2);

			Switch(node_34, { checked: true, color: 'danger' });
			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_35 = $.sibling(node_22, 4);

	Preview(node_35, {
		children: ($$anchor, $$slotProps) => {
			var div_6 = root();
			var node_36 = $.child(div_6);

			Switch(node_36, {
				color: 'success',
				classes: {
					switch: 'data-[checked=false]:bg-danger data-[checked=false]:border-danger'
				}
			});

			var node_37 = $.sibling(node_36, 2);

			Switch(node_37, {
				classes: {
					switch: 'bg-surface-100 border-surface-content/50',
					toggle: 'data-[checked=false]:bg-danger data-[checked=true]:bg-success'
				}
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}