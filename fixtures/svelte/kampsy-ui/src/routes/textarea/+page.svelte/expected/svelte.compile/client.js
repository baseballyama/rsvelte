import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import Textarea from "$lib/textarea/textarea.svelte";

import {
	textareaDefault,
	textareaDisabled,
	textareaWithLabel,
	textareError
} from "../../docs/data/textarea.js";

import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const textarea = ($$anchor) => {
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

const defaultTextarea = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/textarea#default',
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
					Textarea($$anchor, {
						placeholder: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
					});
				};

				var node_3 = $.child(div_3);

				demoAndCode(node_3, () => demo, () => textareaDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const disabled = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_2();
			var node_4 = $.first_child(fragment_6);

			LinkH2(node_4, {
				href: '/textarea#disabled',
				'aria-label': 'disabled',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('disabled');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_4 = $.sibling(node_4, 2);

			{
				const demo = ($$anchor) => {
					Textarea($$anchor, {
						disabled: true,
						placeholder: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
					});
				};

				var node_5 = $.child(div_4);

				demoAndCode(node_5, () => demo, () => textareaDisabled);
				$.reset(div_4);
			}

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});
};

const withLabel = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_2();
			var node_6 = $.first_child(fragment_9);

			LinkH2(node_6, {
				href: '/textarea#label',
				'aria-label': 'label',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('label');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var div_5 = $.sibling(node_6, 2);

			{
				const demo = ($$anchor) => {
					var div_6 = root_3();
					var node_7 = $.child(div_6);

					Textarea(node_7, {
						label: 'Label',
						placeholder: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
					});

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				var node_8 = $.child(div_5);

				demoAndCode(node_8, () => demo, () => textareaWithLabel);
				$.reset(div_5);
			}

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});
};

const withError = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root_2();
			var node_9 = $.first_child(fragment_11);

			LinkH2(node_9, {
				href: '/textarea#error',
				'aria-label': 'error',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('error');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var div_7 = $.sibling(node_9, 2);

			{
				const demo = ($$anchor) => {
					var div_8 = root_4();
					var node_10 = $.child(div_8);

					Textarea(node_10, {
						defaultValue: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequa',
						error: 'There has been an error.',
						size: 'tiny'
					});

					var node_11 = $.sibling(node_10, 2);

					Textarea(node_11, {
						defaultValue: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequa',
						error: 'There has been an error.',
						size: 'small'
					});

					var node_12 = $.sibling(node_11, 2);

					Textarea(node_12, {
						defaultValue: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequa',
						error: 'There has been an error.',
						size: 'medium'
					});

					var node_13 = $.sibling(node_12, 2);

					Textarea(node_13, {
						defaultValue: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequa',
						error: 'There has been an error.',
						size: 'large'
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				var node_14 = $.child(div_7);

				demoAndCode(node_14, () => demo, () => textareError);
				$.reset(div_7);
			}

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "text", href: "/text" },
				next: { title: "theme switcher", href: "/theme-switcher" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_14 = root_5();
	var node_15 = $.first_child(fragment_14);

	textarea(node_15);

	var node_16 = $.sibling(node_15, 2);

	defaultTextarea(node_16);

	var node_17 = $.sibling(node_16, 2);

	disabled(node_17);

	var node_18 = $.sibling(node_17, 2);

	withLabel(node_18);

	var node_19 = $.sibling(node_18, 2);

	withError(node_19);

	var node_20 = $.sibling(node_19, 2);

	prevAndNext(node_20);
	$.append($$anchor, fragment_14);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Textarea</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Retrieve multi-line user input.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="p-4 lg:p-6"><div class="flex flex-nowrap justify-between gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_3 = $.from_html(`<div class="w-full"><!></div>`);
var root_4 = $.from_html(`<div class="w-full space-y-6"><!> <!> <!> <!></div>`);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('1kfepxb', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Textarea';
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