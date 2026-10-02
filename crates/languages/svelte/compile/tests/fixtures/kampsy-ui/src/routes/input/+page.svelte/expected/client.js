import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Input, SearchInput } from "$lib/index.js";
import ArrowCircleUp from "$lib/icons/arrow-circle-up.svelte";

import {
	inputDefault,
	inputPrefixAndSuffix,
	inputDisabled,
	inputLabel,
	inputError,
	inputSearch
} from "$lib/../docs/data/input.js";

import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const input = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div);
	$.append($$anchor, div);
};

const defaultInput = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/input#default',
				'aria-label': 'default',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('default');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_2, 2);

			{
				const demo = ($$anchor) => {
					var div_4 = root_2();
					var node_3 = $.child(div_4);

					Input(node_3, {
						'aria-labelledby': 'Demo input',
						placeholder: 'small',
						size: 'small'
					});

					var node_4 = $.sibling(node_3, 2);

					Input(node_4, { 'aria-labelledby': 'Demo input', placeholder: 'default' });

					var node_5 = $.sibling(node_4, 2);

					Input(node_5, {
						'aria-labelledby': 'Demo input',
						placeholder: 'large',
						size: 'large'
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				var node_6 = $.child(div_3);

				demoAndCode(node_6, () => demo, () => inputDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const prefixAndSuffix = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_7 = $.first_child(fragment_5);

			LinkH2(node_7, {
				href: '/input#prefix-and-suffix',
				'aria-label': 'prefix and suffix',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('prefix and suffix');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_5 = $.sibling(node_7, 2);

			{
				const demo = ($$anchor) => {
					var fragment_6 = root_4();
					var div_6 = $.first_child(fragment_6);
					var node_8 = $.child(div_6);

					Input(node_8, {
						'aria-labelledby': 'Demo',
						get contPrefix() {
							return ArrowCircleUp;
						},
						placeholder: 'default'
					});

					$.reset(div_6);

					var div_7 = $.sibling(div_6, 2);
					var node_9 = $.child(div_7);

					Input(node_9, {
						'aria-labelledby': 'Demo',
						get contSuffix() {
							return ArrowCircleUp;
						},
						placeholder: 'default'
					});

					$.reset(div_7);

					var div_8 = $.sibling(div_7, 2);
					var node_10 = $.child(div_8);

					Input(node_10, {
						'aria-labelledby': 'Demo',
						contPrefix: 'https://',
						contSuffix: '.com',
						placeholder: 'default'
					});

					$.reset(div_8);

					var div_9 = $.sibling(div_8, 2);
					var node_11 = $.child(div_9);

					Input(node_11, {
						'aria-labelledby': 'Demo',
						get contPrefix() {
							return ArrowCircleUp;
						},
						prefixStyling: false,
						get contSuffix() {
							return ArrowCircleUp;
						},
						suffixStyling: false,
						placeholder: 'default'
					});

					$.reset(div_9);

					var div_10 = $.sibling(div_9, 2);
					var node_12 = $.child(div_10);

					Input(node_12, {
						'aria-labelledby': 'Demo',
						contPrefix: 'ui',
						placeholder: 'default'
					});

					$.reset(div_10);
					$.append($$anchor, fragment_6);
				};

				var node_13 = $.child(div_5);

				demoAndCode(node_13, () => demo, () => inputPrefixAndSuffix);
				$.reset(div_5);
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});
};

const inputDisabledSnip = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_3();
			var node_14 = $.first_child(fragment_8);

			LinkH2(node_14, {
				href: '/input#disabled',
				'aria-label': 'disabled',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('disabled');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var div_11 = $.sibling(node_14, 2);

			{
				const demo = ($$anchor) => {
					var fragment_9 = root_5();
					var div_12 = $.first_child(fragment_9);
					var node_15 = $.child(div_12);

					Input(node_15, {
						'aria-labelledby': 'Demo',
						placeholder: 'Disabled with placeholder',
						disabled: true
					});

					$.reset(div_12);

					var div_13 = $.sibling(div_12, 2);
					var node_16 = $.child(div_13);

					Input(node_16, {
						'aria-labelledby': 'Demo',
						value: 'Disabled with placeholder',
						disabled: true
					});

					$.reset(div_13);

					var div_14 = $.sibling(div_13, 2);
					var node_17 = $.child(div_14);

					Input(node_17, {
						'aria-labelledby': 'Demo',
						get contPrefix() {
							return ArrowCircleUp;
						},
						placeholder: 'Disabled with prefix',
						disabled: true
					});

					$.reset(div_14);

					var div_15 = $.sibling(div_14, 2);
					var node_18 = $.child(div_15);

					Input(node_18, {
						'aria-labelledby': 'Demo',
						get contSuffix() {
							return ArrowCircleUp;
						},
						placeholder: 'Disabled with suffix',
						disabled: true
					});

					$.reset(div_15);

					var div_16 = $.sibling(div_15, 2);
					var node_19 = $.child(div_16);

					Input(node_19, {
						'aria-labelledby': 'Demo',
						contPrefix: 'https://',
						contSuffix: '.com',
						placeholder: 'Disabled with prefix and suffix',
						disabled: true
					});

					$.reset(div_16);

					var div_17 = $.sibling(div_16, 2);
					var node_20 = $.child(div_17);

					Input(node_20, {
						'aria-labelledby': 'Demo',
						get contPrefix() {
							return ArrowCircleUp;
						},
						prefixStyling: false,
						get contSuffix() {
							return ArrowCircleUp;
						},
						suffixStyling: false,
						placeholder: 'Disabled with prefix and suffix',
						disabled: true
					});

					$.reset(div_17);
					$.append($$anchor, fragment_9);
				};

				var node_21 = $.child(div_11);

				demoAndCode(node_21, () => demo, () => inputDisabled);
				$.reset(div_11);
			}

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});
};

const searchSnip = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_7();
			var node_22 = $.first_child(fragment_11);

			LinkH2(node_22, {
				href: '/input#search',
				'aria-label': 'search',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('search');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var div_18 = $.sibling(node_22, 4);

			{
				const demo = ($$anchor) => {
					var div_19 = root_6();
					var node_23 = $.child(div_19);

					SearchInput(node_23, { placeholder: 'Enter some text...' });
					$.reset(div_19);
					$.append($$anchor, div_19);
				};

				var node_24 = $.child(div_18);

				demoAndCode(node_24, () => demo, () => inputSearch);
				$.reset(div_18);
			}

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});
};

const errorSnip = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_3();
			var node_25 = $.first_child(fragment_13);

			LinkH2(node_25, {
				href: '/input#error',
				'aria-label': 'error',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('error');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var div_20 = $.sibling(node_25, 2);

			{
				const demo = ($$anchor) => {
					var fragment_14 = root_8();
					var div_21 = $.first_child(fragment_14);
					var node_26 = $.child(div_21);

					Input(node_26, {
						'aria-labelledby': 'Demo input',
						error: 'An error message.',
						placeholder: 'long-error@gmail.com',
						size: 'small'
					});

					$.reset(div_21);

					var div_22 = $.sibling(div_21, 2);
					var node_27 = $.child(div_22);

					Input(node_27, {
						'aria-labelledby': 'Demo input',
						error: 'An error message.',
						placeholder: 'long-error@gmail.com'
					});

					$.reset(div_22);

					var div_23 = $.sibling(div_22, 2);
					var node_28 = $.child(div_23);

					Input(node_28, {
						'aria-labelledby': 'Demo input',
						error: 'An error message.',
						placeholder: 'long-error@gmail.com',
						size: 'large'
					});

					$.reset(div_23);
					$.append($$anchor, fragment_14);
				};

				var node_29 = $.child(div_20);

				demoAndCode(node_29, () => demo, () => inputError);
				$.reset(div_20);
			}

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});
};

const inputLabelSnip = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_3();
			var node_30 = $.first_child(fragment_16);

			LinkH2(node_30, {
				href: '/input#label',
				'aria-label': 'label',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('label');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var div_24 = $.sibling(node_30, 2);

			{
				const demo = ($$anchor) => {
					Input($$anchor, {
						'aria-labelledby': 'Demo input',
						label: 'Label',
						placeholder: 'Label'
					});
				};

				var node_31 = $.child(div_24);

				demoAndCode(node_31, () => demo, () => inputLabel);
				$.reset(div_24);
			}

			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "error", href: "/error" },
				next: { title: "keyboard input", href: "/keyboard-input" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_20 = root_9();
	var node_32 = $.first_child(fragment_20);

	input(node_32);

	var node_33 = $.sibling(node_32, 2);

	defaultInput(node_33);

	var node_34 = $.sibling(node_33, 2);

	prefixAndSuffix(node_34);

	var node_35 = $.sibling(node_34, 2);

	inputDisabledSnip(node_35);

	var node_36 = $.sibling(node_35, 2);

	searchSnip(node_36);

	var node_37 = $.sibling(node_36, 2);

	errorSnip(node_37);

	var node_38 = $.sibling(node_37, 2);

	inputLabelSnip(node_38);

	var node_39 = $.sibling(node_38, 2);

	prevAndNext(node_39);
	$.append($$anchor, fragment_20);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">input</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Retrieve text input from a user.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-3"><!> <!> <!></div>`);
var root_3 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div>`, 1);
var root_5 = $.from_html(`<div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div>`, 1);
var root_6 = $.from_html(`<div class="w-full"><!></div>`);
var root_7 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Automatically clears the input if escape is pressed.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_8 = $.from_html(`<div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3"><!></div>`, 1);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('rx1dtf', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Input';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});
}