import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import CodeSnippet from "$lib/snippet/snippet.svelte";

import {
	snippetCallback,
	snippetDefault,
	snippetInverted,
	snippetMultiline,
	snippetNoPrompt,
	snippetVariants
} from "$lib/../docs/data/snippet.js";

import Pagination from "$lib/pagination/pagination.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const error = ($$anchor) => {
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

const defaultErr = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/snippet#default',
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
					CodeSnippet($$anchor, { text: 'npm init next-app', class: 'w-full lg:w-[300px]' });
				};

				var node_3 = $.child(div_3);

				demoAndCode(node_3, () => demo, () => snippetDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const inverted = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_2();
			var node_4 = $.first_child(fragment_6);

			LinkH2(node_4, {
				href: '/error#custome-label',
				'aria-label': 'custom-label',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('inverted');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_4 = $.sibling(node_4, 2);

			{
				const demo = ($$anchor) => {
					CodeSnippet($$anchor, {
						type: 'inverted',
						text: 'npm init next-app',
						class: 'w-full lg:w-[300px]'
					});
				};

				var node_5 = $.child(div_4);

				demoAndCode(node_5, () => demo, () => snippetInverted);
				$.reset(div_4);
			}

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});
};

const multiline = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_2();
			var node_6 = $.first_child(fragment_9);

			LinkH2(node_6, {
				href: '/snippet#multiline',
				'aria-label': 'multiline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('multiline');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var div_5 = $.sibling(node_6, 2);

			{
				const demo = ($$anchor) => {
					CodeSnippet($$anchor, { text: ["cd project", "now"], class: 'w-full' });
				};

				var node_7 = $.child(div_5);

				demoAndCode(node_7, () => demo, () => snippetMultiline);
				$.reset(div_5);
			}

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});
};

const noPrompt = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_2();
			var node_8 = $.first_child(fragment_12);

			LinkH2(node_8, {
				href: '/snippet#no-prompt',
				'aria-label': 'no-prompt',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('no prompt');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var div_6 = $.sibling(node_8, 2);

			{
				const demo = ($$anchor) => {
					CodeSnippet($$anchor, {
						prompt: false,
						text: 'npm init next-app',
						class: 'w-full lg:w-[300px]'
					});
				};

				var node_9 = $.child(div_6);

				demoAndCode(node_9, () => demo, () => snippetNoPrompt);
				$.reset(div_6);
			}

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});
};

const callback = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root_2();
			var node_10 = $.first_child(fragment_15);

			LinkH2(node_10, {
				href: '/snippet#callback',
				'aria-label': 'callback',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('callback');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var div_7 = $.sibling(node_10, 2);

			{
				const demo = ($$anchor) => {
					CodeSnippet($$anchor, {
						onCopy: () => alert("You copied the text!"),
						text: 'npm init next-app',
						class: 'w-full lg:w-[300px]'
					});
				};

				var node_11 = $.child(div_7);

				demoAndCode(node_11, () => demo, () => snippetCallback);
				$.reset(div_7);
			}

			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});
};

const size = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_18 = root_2();
			var node_12 = $.first_child(fragment_18);

			LinkH2(node_12, {
				href: '/snippet#variants',
				'aria-label': 'variants',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('variants');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var div_8 = $.sibling(node_12, 2);

			{
				const demo = ($$anchor) => {
					var div_9 = root_3();
					var node_13 = $.child(div_9);

					CodeSnippet(node_13, {
						type: 'success',
						text: 'npm init next-app',
						class: 'w-full lg:w-[300px]'
					});

					var node_14 = $.sibling(node_13, 2);

					CodeSnippet(node_14, {
						type: 'error',
						text: 'npm init next-app',
						class: 'w-full lg:w-[300px]'
					});

					var node_15 = $.sibling(node_14, 2);

					CodeSnippet(node_15, {
						type: 'warning',
						text: 'npm init next-app',
						class: 'w-full lg:w-[300px]'
					});

					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				var node_16 = $.child(div_8);

				demoAndCode(node_16, () => demo, () => snippetVariants);
				$.reset(div_8);
			}

			$.append($$anchor, fragment_18);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "spinner", href: "/spinner" },
				next: { title: "split button", href: "/split-button" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_21 = root_4();
	var node_17 = $.first_child(fragment_21);

	error(node_17);

	var node_18 = $.sibling(node_17, 2);

	defaultErr(node_18);

	var node_19 = $.sibling(node_18, 2);

	inverted(node_19);

	var node_20 = $.sibling(node_19, 2);

	multiline(node_20);

	var node_21 = $.sibling(node_20, 2);

	noPrompt(node_21);

	var node_22 = $.sibling(node_21, 2);

	callback(node_22);

	var node_23 = $.sibling(node_22, 2);

	size(node_23);

	var node_24 = $.sibling(node_23, 2);

	prevAndNext(node_24);
	$.append($$anchor, fragment_21);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Snippet</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display a snippet of copyable code for the command line.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_3 = $.from_html(`<div class="flex w-full flex-col flex-wrap gap-3"><!> <!> <!></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('1el55rq', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Snippet';
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