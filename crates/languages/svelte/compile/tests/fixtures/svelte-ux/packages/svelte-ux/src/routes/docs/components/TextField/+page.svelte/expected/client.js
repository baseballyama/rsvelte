import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	mdiCurrencyUsd,
	mdiPercent,
	mdiAccountSearch,
	mdiCreditCardOutline,
	mdiArrowRight,
	mdiRefresh,
	mdiMagnify,
	mdiStarOutline,
	mdiInformationOutline,
	mdiChevronLeft,
	mdiChevronRight,
	mdiCalendar,
	mdiMinus,
	mdiPlus
} from '@mdi/js';

import { Button, Icon, SectionDivider, TextField } from 'svelte-ux';
import { autoHeight, debounceEvent } from '@layerstack/svelte-actions';
import Preview from '$lib/components/Preview.svelte';
import Blockquote from '$docs/Blockquote.svelte';
import Toggle from '$lib/components/Toggle.svelte';

var root = $.from_html(`<div class="grid grid-flow-col gap-2"><!> <!></div>`);
var root_1 = $.from_html(`<div class="grid gap-2"><!> <!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="grid gap-2 justify-start"><!> <!></div>`);
var root_4 = $.from_html(`<div class="grid grid-cols-3 gap-2"><!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);
var root_5 = $.from_html(`<div slot="prepend"><!></div>`);
var root_6 = $.from_html(`<div slot="prepend"><select class="appearance-none bg-surface-content/5 border rounded-full mr-2 px-4" style="text-align-last: center;"><option></option><option></option><option></option><option></option><option></option><option></option></select></div>`);
var root_7 = $.from_html(`<span slot="append"><!></span>`);
var root_8 = $.from_html(`<div slot="prefix"><!></div>`);
var root_9 = $.from_html(`<div slot="suffix" class="text-surface-content/50">lbs</div>`);
var root_10 = $.from_html(`<div slot="suffix"><!></div>`);
var root_11 = $.from_html(`<div slot="append"><!></div>`);
var root_12 = $.from_html(`<div slot="suffix" class="text-surface-content/50">usd</div>`);
var root_13 = $.from_html(`<div slot="prepend"><!> <!></div>`);
var root_14 = $.from_html(`<div slot="append"><!> <!></div>`);
var root_15 = $.from_html(`See <a href="./Input" class="font-semibold">Input</a> for more mask examples`, 1);
var root_16 = $.from_html(`<div slot="prefix" class="text-surface-content/50">http://</div>`);
var root_17 = $.from_html(`<div slot="prepend" class="flex"><!></div>`);
var root_18 = $.from_html(`<div slot="append" class="flex"><!></div>`);
var root_19 = $.from_html(`<h1>Examples</h1> <h2>Label only</h2> <!> <h2>Placeholder only</h2> <!> <h2>Label with placeholder</h2> <!> <h2>Error</h2> <!> <h2>Error message</h2> <!> <h2>Dense inline label</h2> <!> <h2>Float label</h2> <!> <h2>Float label with placeholder</h2> <!> <h2>Top label</h2> <!> <h2>Top label with placeholder</h2> <!> <h2>Top label with error</h2> <!> <h2>Left label</h2> <!> <h2>Left label with placeholder</h2> <!> <h2>Left label with error</h2> <!> <h2>Hint</h2> <!> <h2>Disabled</h2> <!> <h2>on:change event</h2> <!> <h2>debounceChange</h2> <!> <h2>Actions</h2> <!> <h2>bind:inputEl</h2> <!> <!> <h2>Input types</h2> <h3>Sets input type and add prefix/suffix when appropriate</h3> <!> <!> <div class="grid grid-flow-col gap-2"><div><div class="text-lg font-semibold mt-8 ml-2">Prepend</div> <!></div> <div><div class="text-lg font-semibold mt-8 ml-2">Prepend with select</div> <!></div></div> <h2>Append</h2> <!> <h2>Prefix</h2> <!> <div class="grid grid-flow-col gap-2"><div><div class="text-lg font-semibold mt-8 ml-2">Suffix</div> <!></div> <div><div class="text-lg font-semibold mt-8 ml-2">Suffix with align right</div> <!></div></div> <h2>Icon with convienent prepend</h2> <!> <h2>Icon with convienent append</h2> <!> <h2>Clearable with convienent append</h2> <!> <h2>Clearable with additional append</h2> <!> <h2>Operators with number</h2> <!> <h2>Operators with string</h2> <!> <h2>All adornments</h2> <!> <h2>Multi Prepend/Append</h2> <!> <!> <h2>Multiline</h2> <!> <h2>Multiline with placeholder</h2> <!> <h2>Multiline with autoHeight</h2> <!> <h2>Multiline with fixed height</h2> <!> <!> <h2>Date</h2> <!> <h2>Telephone</h2> <!> <h2>\`accept\` without \`mask\`</h2> <!> <!> <!> <h2>Rounded</h2> <!> <h2>Rounded with icon</h2> <!> <!> <h2>Address bar</h2> <!> <h2>Number stepper</h2> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const numberOperators = [
		{ label: '=', value: 'equal' },
		{ label: '!=', value: 'notEqual' },
		{ label: '>', value: 'greaterThan' },
		{ label: '>=', value: 'greaterThanOrEqual' },
		{ label: '<', value: 'lessThan' },
		{ label: '<=', value: 'lessThanOrEqual' }
	];

	const stringOperators = [
		{ label: 'equals', value: 'equal' },
		{ label: 'starts', value: 'startsWith' },
		{ label: 'ends', value: 'endsWith' },
		{ label: 'contains', value: 'contains' }
	];

	let value = '';
	let numberValue = 1;
	let multilineValue = 'one\ntwo\nthree';
	let inputEl = null;
	var fragment = root_19();
	var node_1 = $.sibling($.first_child(fragment), 4);

	Preview(node_1, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_2 = $.child(div);

			TextField(node_2, { label: 'First Name' });

			var node_3 = $.sibling(node_2, 2);

			TextField(node_3, { label: 'Last Name' });
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_1, 4);

	Preview(node_4, {
		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_5 = $.child(div_1);

			TextField(node_5, { placeholder: 'First Name' });

			var node_6 = $.sibling(node_5, 2);

			TextField(node_6, { placeholder: 'Last Name' });
			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_4, 4);

	Preview(node_7, {
		children: ($$anchor, $$slotProps) => {
			var div_2 = root();
			var node_8 = $.child(div_2);

			TextField(node_8, {
				label: 'First Name',
				placeholder: 'Please enter your first name'
			});

			var node_9 = $.sibling(node_8, 2);

			TextField(node_9, {
				label: 'Last Name',
				placeholder: 'Please enter your last name'
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 4);

	Preview(node_10, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Password',
				placeholder: 'Please enter your password',
				error: true
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 4);

	Preview(node_11, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Password',
				placeholder: 'Please enter your password',
				error: 'This is a required field'
			});
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_11, 4);

	Preview(node_12, {
		children: ($$anchor, $$slotProps) => {
			var div_3 = root();
			var node_13 = $.child(div_3);

			TextField(node_13, {
				label: 'First Name',
				placeholder: 'Please enter your first name',
				dense: true
			});

			var node_14 = $.sibling(node_13, 2);

			TextField(node_14, {
				label: 'Last Name',
				placeholder: 'Please enter your last name',
				dense: true
			});

			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_12, 4);

	Preview(node_15, {
		children: ($$anchor, $$slotProps) => {
			var div_4 = root();
			var node_16 = $.child(div_4);

			TextField(node_16, { label: 'First Name', labelPlacement: 'float' });

			var node_17 = $.sibling(node_16, 2);

			TextField(node_17, { label: 'Last Name', labelPlacement: 'float' });
			$.reset(div_4);
			$.append($$anchor, div_4);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_15, 4);

	Preview(node_18, {
		children: ($$anchor, $$slotProps) => {
			var div_5 = root();
			var node_19 = $.child(div_5);

			TextField(node_19, {
				label: 'First Name',
				labelPlacement: 'float',
				placeholder: 'Please enter your first name'
			});

			var node_20 = $.sibling(node_19, 2);

			TextField(node_20, {
				label: 'Last Name',
				labelPlacement: 'float',
				placeholder: 'Please enter your last name'
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_18, 4);

	Preview(node_21, {
		children: ($$anchor, $$slotProps) => {
			var div_6 = root();
			var node_22 = $.child(div_6);

			TextField(node_22, { label: 'First Name', labelPlacement: 'top' });

			var node_23 = $.sibling(node_22, 2);

			TextField(node_23, { label: 'Last Name', labelPlacement: 'top' });
			$.reset(div_6);
			$.append($$anchor, div_6);
		},
		$$slots: { default: true }
	});

	var node_24 = $.sibling(node_21, 4);

	Preview(node_24, {
		children: ($$anchor, $$slotProps) => {
			var div_7 = root();
			var node_25 = $.child(div_7);

			TextField(node_25, {
				label: 'First Name',
				labelPlacement: 'top',
				placeholder: 'Please enter your first name'
			});

			var node_26 = $.sibling(node_25, 2);

			TextField(node_26, {
				label: 'Last Name',
				labelPlacement: 'top',
				placeholder: 'Please enter your last name'
			});

			$.reset(div_7);
			$.append($$anchor, div_7);
		},
		$$slots: { default: true }
	});

	var node_27 = $.sibling(node_24, 4);

	Preview(node_27, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Password',
				labelPlacement: 'top',
				placeholder: 'Please enter your password',
				error: 'This is a required field'
			});
		},
		$$slots: { default: true }
	});

	var node_28 = $.sibling(node_27, 4);

	Preview(node_28, {
		children: ($$anchor, $$slotProps) => {
			var div_8 = root();
			var node_29 = $.child(div_8);

			TextField(node_29, { label: 'First Name', labelPlacement: 'left' });

			var node_30 = $.sibling(node_29, 2);

			TextField(node_30, { label: 'Last Name', labelPlacement: 'left' });
			$.reset(div_8);
			$.append($$anchor, div_8);
		},
		$$slots: { default: true }
	});

	var node_31 = $.sibling(node_28, 4);

	Preview(node_31, {
		children: ($$anchor, $$slotProps) => {
			var div_9 = root();
			var node_32 = $.child(div_9);

			TextField(node_32, {
				label: 'First Name',
				labelPlacement: 'left',
				placeholder: 'Please enter your first name'
			});

			var node_33 = $.sibling(node_32, 2);

			TextField(node_33, {
				label: 'Last Name',
				labelPlacement: 'left',
				placeholder: 'Please enter your last name'
			});

			$.reset(div_9);
			$.append($$anchor, div_9);
		},
		$$slots: { default: true }
	});

	var node_34 = $.sibling(node_31, 4);

	Preview(node_34, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Password',
				labelPlacement: 'left',
				placeholder: 'Please enter your password',
				error: 'This is a required field'
			});
		},
		$$slots: { default: true }
	});

	var node_35 = $.sibling(node_34, 4);

	Preview(node_35, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, { label: 'Password', hint: 'At least 8 characters' });
		},
		$$slots: { default: true }
	});

	var node_36 = $.sibling(node_35, 4);

	Preview(node_36, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, { label: 'Name', disabled: true });
		},
		$$slots: { default: true }
	});

	var node_37 = $.sibling(node_36, 4);

	Preview(node_37, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Name',
				$$events: { change: (e) => console.log(e.detail) }
			});
		},
		$$slots: { default: true }
	});

	var node_38 = $.sibling(node_37, 4);

	Preview(node_38, {
		children: ($$anchor, $$slotProps) => {
			var div_10 = root_1();
			var node_39 = $.child(div_10);

			TextField(node_39, {
				label: 'Name',
				debounceChange: true,
				$$events: { change: (e) => console.log(e.detail) }
			});

			var node_40 = $.sibling(node_39, 2);

			TextField(node_40, {
				label: 'Name',
				debounceChange: 1000,
				$$events: { change: (e) => console.log(e.detail) }
			});

			$.reset(div_10);
			$.append($$anchor, div_10);
		},
		$$slots: { default: true }
	});

	var node_41 = $.sibling(node_38, 4);

	Preview(node_41, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Name',
				actions: (node) => [
					debounceEvent(node, {
						type: 'input',
						listener: (e) => {
							// @ts-expect-error
							console.log(e.target.value);
						},
						timeout: 500
					})
				]
			});
		},
		$$slots: { default: true }
	});

	var node_42 = $.sibling(node_41, 4);

	Preview(node_42, {
		children: ($$anchor, $$slotProps) => {
			var div_11 = root_3();
			var node_43 = $.child(div_11);

			Button(node_43, {
				$$events: { click: () => inputEl?.focus() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Manually Focus');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_44 = $.sibling(node_43, 2);

			Toggle(node_44, {
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$anchor, $$slotProps) => {
						const multiline = $.derived(() => $$slotProps.on);
						const toggle = $.derived(() => $$slotProps.toggle);
						var fragment_9 = root_2();
						var node_45 = $.first_child(fragment_9);

						Button(node_45, {
							$$events: {
								click: function (...$$args) {
									$.get(toggle)?.apply(this, $$args);
								}
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, $.get(multiline) ? 'To single line' : 'To multiline'));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_46 = $.sibling(node_45, 2);

						TextField(node_46, {
							label: 'Name',
							get multiline() {
								return $.get(multiline);
							},

							get inputEl() {
								return inputEl;
							},

							set inputEl($$value) {
								inputEl = $$value;
							}
						});

						$.append($$anchor, fragment_9);
					}
				}
			});

			$.reset(div_11);
			$.append($$anchor, div_11);
		},
		$$slots: { default: true }
	});

	var node_47 = $.sibling(node_42, 2);

	SectionDivider(node_47, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Type');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_48 = $.sibling(node_47, 6);

	Preview(node_48, {
		children: ($$anchor, $$slotProps) => {
			var div_12 = root_4();
			var node_49 = $.child(div_12);

			TextField(node_49, {
				label: 'default',
				$$events: { change: (e) => console.log(e.detail) }
			});

			var node_50 = $.sibling(node_49, 2);

			TextField(node_50, {
				label: 'text',
				type: 'text',
				$$events: { change: (e) => console.log(e.detail) }
			});

			var node_51 = $.sibling(node_50, 2);

			TextField(node_51, {
				label: 'password',
				type: 'password',
				$$events: { change: (e) => console.log(e.detail) }
			});

			var node_52 = $.sibling(node_51, 2);

			TextField(node_52, {
				label: 'integer',
				type: 'integer',
				$$events: { change: (e) => console.log(e.detail) }
			});

			var node_53 = $.sibling(node_52, 2);

			TextField(node_53, {
				label: 'decimal',
				type: 'decimal',
				$$events: { change: (e) => console.log(e.detail) }
			});

			var node_54 = $.sibling(node_53, 2);

			TextField(node_54, {
				label: 'currency',
				type: 'currency',
				$$events: { change: (e) => console.log(e.detail) }
			});

			var node_55 = $.sibling(node_54, 2);

			TextField(node_55, {
				label: 'percent',
				type: 'percent',
				$$events: { change: (e) => console.log(e.detail) }
			});

			var node_56 = $.sibling(node_55, 2);

			TextField(node_56, {
				label: 'email',
				type: 'email',
				$$events: { change: (e) => console.log(e.detail) }
			});

			var node_57 = $.sibling(node_56, 2);

			TextField(node_57, {
				label: 'search',
				type: 'search',
				$$events: { change: (e) => console.log(e.detail) }
			});

			$.reset(div_12);
			$.append($$anchor, div_12);
		},
		$$slots: { default: true }
	});

	var node_58 = $.sibling(node_48, 2);

	SectionDivider(node_58, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Adornments');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var div_13 = $.sibling(node_58, 2);
	var div_14 = $.child(div_13);
	var node_59 = $.sibling($.child(div_14), 2);

	Preview(node_59, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'User Search',
				$$slots: {
					prepend: ($$anchor, $$slotProps) => {
						var div_15 = root_5();
						var node_60 = $.child(div_15);

						Icon(node_60, {
							get data() {
								return mdiAccountSearch;
							},
							class: 'text-surface-content/50 mr-2'
						});

						$.reset(div_15);
						$.append($$anchor, div_15);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_14);

	var div_16 = $.sibling(div_14, 2);
	var node_61 = $.sibling($.child(div_16), 2);

	Preview(node_61, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Start Date',
				$$slots: {
					prepend: ($$anchor, $$slotProps) => {
						var div_17 = root_6();
						var select = $.child(div_17);
						var option = $.child(select);

						option.textContent = '=';
						option.__value = '=';

						var option_1 = $.sibling(option);

						option_1.textContent = '!=';
						option_1.__value = '!=';

						var option_2 = $.sibling(option_1);

						option_2.textContent = '>';
						option_2.__value = '>';

						var option_3 = $.sibling(option_2);

						option_3.textContent = '>=';
						option_3.__value = '>=';

						var option_4 = $.sibling(option_3);

						option_4.textContent = '<';
						option_4.__value = '<';

						var option_5 = $.sibling(option_4);

						option_5.textContent = '<=';
						option_5.__value = '<=';
						$.reset(select);
						$.reset(div_17);
						$.append($$anchor, div_17);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_16);
	$.reset(div_13);

	var node_62 = $.sibling(div_13, 4);

	Preview(node_62, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Name',
				$$slots: {
					append: ($$anchor, $$slotProps) => {
						var span = root_7();
						var node_63 = $.child(span);

						Button(node_63, {
							get icon() {
								return mdiRefresh;
							},
							class: 'text-surface-content/50 p-2'
						});

						$.reset(span);
						$.append($$anchor, span);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_64 = $.sibling(node_62, 4);

	Preview(node_64, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Amount',
				$$slots: {
					prefix: ($$anchor, $$slotProps) => {
						var div_18 = root_8();
						var node_65 = $.child(div_18);

						Icon(node_65, {
							get data() {
								return mdiCurrencyUsd;
							},
							size: '1.1em',
							class: 'text-surface-content/50 -mt-1'
						});

						$.reset(div_18);
						$.append($$anchor, div_18);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var div_19 = $.sibling(node_64, 2);
	var div_20 = $.child(div_19);
	var node_66 = $.sibling($.child(div_20), 2);

	Preview(node_66, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Weight',
				$$slots: {
					suffix: ($$anchor, $$slotProps) => {
						var div_21 = root_9();

						$.append($$anchor, div_21);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_20);

	var div_22 = $.sibling(div_20, 2);
	var node_67 = $.sibling($.child(div_22), 2);

	Preview(node_67, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Ratio',
				align: 'right',
				$$slots: {
					suffix: ($$anchor, $$slotProps) => {
						var div_23 = root_10();
						var node_68 = $.child(div_23);

						Icon(node_68, {
							get data() {
								return mdiPercent;
							},
							size: '1.1em',
							class: 'text-surface-content/50 -mt-1 ml-1'
						});

						$.reset(div_23);
						$.append($$anchor, div_23);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_22);
	$.reset(div_19);

	var node_69 = $.sibling(div_19, 4);

	Preview(node_69, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Search',
				get icon() {
					return mdiMagnify;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_70 = $.sibling(node_69, 4);

	Preview(node_70, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Search',
				get iconRight() {
					return mdiMagnify;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_71 = $.sibling(node_70, 4);

	Preview(node_71, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, { label: 'Search', clearable: true });
		},
		$$slots: { default: true }
	});

	var node_72 = $.sibling(node_71, 4);

	Preview(node_72, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Search',
				clearable: true,
				$$slots: {
					append: ($$anchor, $$slotProps) => {
						var span_1 = root_7();
						var node_73 = $.child(span_1);

						Button(node_73, {
							get icon() {
								return mdiArrowRight;
							},
							class: 'text-surface-content/50 p-2'
						});

						$.reset(span_1);
						$.append($$anchor, span_1);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_74 = $.sibling(node_72, 4);

	Preview(node_74, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Search',
				get operators() {
					return numberOperators;
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

	var node_75 = $.sibling(node_74, 4);

	Preview(node_75, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Search',
				get operators() {
					return stringOperators;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_76 = $.sibling(node_75, 4);

	Preview(node_76, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Transfer amount',
				$$slots: {
					prepend: ($$anchor, $$slotProps) => {
						var div_24 = root_5();
						var node_77 = $.child(div_24);

						Icon(node_77, {
							get data() {
								return mdiCreditCardOutline;
							},
							class: 'text-surface-content/50 mr-2'
						});

						$.reset(div_24);
						$.append($$anchor, div_24);
					},

					append: ($$anchor, $$slotProps) => {
						var div_25 = root_11();
						var node_78 = $.child(div_25);

						Button(node_78, {
							get icon() {
								return mdiArrowRight;
							},
							class: 'text-surface-content/50 p-2'
						});

						$.reset(div_25);
						$.append($$anchor, div_25);
					},

					prefix: ($$anchor, $$slotProps) => {
						var div_26 = root_8();
						var node_79 = $.child(div_26);

						Icon(node_79, {
							get data() {
								return mdiCurrencyUsd;
							},
							size: '1.1em',
							class: 'text-surface-content/50 -mt-1'
						});

						$.reset(div_26);
						$.append($$anchor, div_26);
					},

					suffix: ($$anchor, $$slotProps) => {
						var div_27 = root_12();

						$.append($$anchor, div_27);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_80 = $.sibling(node_76, 4);

	Preview(node_80, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Date Range',
				$$slots: {
					prepend: ($$anchor, $$slotProps) => {
						var div_28 = root_13();
						var node_81 = $.child(div_28);

						Button(node_81, {
							get icon() {
								return mdiChevronLeft;
							},
							class: 'text-surface-content/50 p-2'
						});

						var node_82 = $.sibling(node_81, 2);

						Icon(node_82, {
							get data() {
								return mdiCalendar;
							},
							class: 'text-surface-content/50 mr-2'
						});

						$.reset(div_28);
						$.append($$anchor, div_28);
					},

					append: ($$anchor, $$slotProps) => {
						var div_29 = root_14();
						var node_83 = $.child(div_29);

						Icon(node_83, {
							get data() {
								return mdiRefresh;
							},
							class: 'text-surface-content/50 mr-2'
						});

						var node_84 = $.sibling(node_83, 2);

						Button(node_84, {
							get icon() {
								return mdiChevronRight;
							},
							class: 'text-surface-content/50 p-2'
						});

						$.reset(div_29);
						$.append($$anchor, div_29);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_85 = $.sibling(node_80, 2);

	SectionDivider(node_85, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Multiline');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_86 = $.sibling(node_85, 4);

	Preview(node_86, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, { label: 'Comment', multiline: true });
		},
		$$slots: { default: true }
	});

	var node_87 = $.sibling(node_86, 4);

	Preview(node_87, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Comment',
				multiline: true,
				placeholder: 'Please leave a comment'
			});
		},
		$$slots: { default: true }
	});

	var node_88 = $.sibling(node_87, 4);

	Preview(node_88, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Comment',
				multiline: true,
				actions: (node) => {
					// @ts-expect-error
					return [autoHeight(node)];
				},

				get value() {
					return multilineValue;
				},

				set value($$value) {
					multilineValue = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_89 = $.sibling(node_88, 4);

	Preview(node_89, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Comment',
				multiline: true,
				classes: { input: 'h-[100px]' }
			});
		},
		$$slots: { default: true }
	});

	var node_90 = $.sibling(node_89, 2);

	SectionDivider(node_90, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Mask & Accept');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_91 = $.sibling(node_90, 4);

	Preview(node_91, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, { mask: 'mm/dd/yyyy', replace: 'dmyh' });
		},
		$$slots: { default: true }
	});

	var node_92 = $.sibling(node_91, 4);

	Preview(node_92, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, { mask: '+1 (___) ___-____', replace: '_' });
		},
		$$slots: { default: true }
	});

	var node_93 = $.sibling(node_92, 4);

	Preview(node_93, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, { label: 'Zip code', accept: /[0-9]{0,5}/ });
		},
		$$slots: { default: true }
	});

	var node_94 = $.sibling(node_93, 2);

	Blockquote(node_94, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_32 = root_15();

			$.next(2);
			$.append($$anchor, fragment_32);
		},
		$$slots: { default: true }
	});

	var node_95 = $.sibling(node_94, 2);

	SectionDivider(node_95, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Style');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_96 = $.sibling(node_95, 4);

	Preview(node_96, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, { label: 'Search', rounded: true });
		},
		$$slots: { default: true }
	});

	var node_97 = $.sibling(node_96, 4);

	Preview(node_97, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				label: 'Search',
				rounded: true,
				get icon() {
					return mdiMagnify;
				}
			});
		},
		$$slots: { default: true }
	});

	var node_98 = $.sibling(node_97, 2);

	SectionDivider(node_98, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Examples');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_99 = $.sibling(node_98, 4);

	Preview(node_99, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				get icon() {
					return mdiInformationOutline;
				},

				$$slots: {
					prefix: ($$anchor, $$slotProps) => {
						var div_30 = root_16();

						$.append($$anchor, div_30);
					},

					append: ($$anchor, $$slotProps) => {
						var div_31 = root_11();
						var node_100 = $.child(div_31);

						Button(node_100, {
							get icon() {
								return mdiStarOutline;
							},
							class: 'text-surface-content/50 p-2'
						});

						$.reset(div_31);
						$.append($$anchor, div_31);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	var node_101 = $.sibling(node_99, 4);

	Preview(node_101, {
		children: ($$anchor, $$slotProps) => {
			TextField($$anchor, {
				type: 'integer',
				align: 'center',
				class: 'w-24',
				get value() {
					return numberValue;
				},

				set value($$value) {
					numberValue = $$value;
				},

				$$slots: {
					prepend: ($$anchor, $$slotProps) => {
						var div_32 = root_17();
						var node_102 = $.child(div_32);

						Button(node_102, {
							get icon() {
								return mdiMinus;
							},
							size: 'sm',
							$$events: { click: () => numberValue -= 1 }
						});

						$.reset(div_32);
						$.append($$anchor, div_32);
					},

					append: ($$anchor, $$slotProps) => {
						var div_33 = root_18();
						var node_103 = $.child(div_33);

						Button(node_103, {
							get icon() {
								return mdiPlus;
							},
							size: 'sm',
							$$events: { click: () => numberValue += 1 }
						});

						$.reset(div_33);
						$.append($$anchor, div_33);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}