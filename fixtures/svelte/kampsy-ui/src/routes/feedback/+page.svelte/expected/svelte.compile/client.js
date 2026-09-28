import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Error from "$lib/error/error.svelte";
import { errorDefault } from "../../docs/data/error.js";
import Pagination from "$lib/pagination/pagination.svelte";

const feedback = ($$anchor) => {
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

const defaultFeedback = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var div_3 = $.sibling($.first_child(fragment_3), 4);

			{
				const demo = ($$anchor) => {
					var div_4 = root_2();
					var node_2 = $.child(div_4);

					Error(node_2, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('This email address is already in use.');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				var node_3 = $.child(div_3);

				demoAndCode(node_3, () => demo, () => errorDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const inline = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_4();
			var div_5 = $.sibling($.first_child(fragment_5), 2);

			{
				const demo = ($$anchor) => {
					var div_6 = root_2();
					var node_4 = $.child(div_6);

					Error(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('This email address is already in use.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				var node_5 = $.child(div_5);

				demoAndCode(node_5, () => demo, () => errorDefault);
				$.reset(div_5);
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "button", href: "/button" },
				next: { title: "pagination", href: "/pagination" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_8 = root_5();
	var node_6 = $.first_child(fragment_8);

	feedback(node_6);

	var node_7 = $.sibling(node_6, 2);

	defaultFeedback(node_7);

	var node_8 = $.sibling(node_7, 2);

	inline(node_8);

	var node_9 = $.sibling(node_8, 2);

	prevAndNext(node_9);
	$.append($$anchor, fragment_8);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">feedback</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Gather text feedback with an associated emotion.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<div><!></div>`);
var root_3 = $.from_html(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize"><a href="#default" id="default">default</a></h2> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Should only be used on desktop.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize"><a href="#default" id="default">inline</a></h2> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('c3f7w', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Feedback';
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