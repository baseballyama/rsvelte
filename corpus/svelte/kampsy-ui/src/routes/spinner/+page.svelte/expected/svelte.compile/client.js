import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import Spinner from "$lib/spinner/spinner.svelte";
import { spinnerCustom, spinnerDefault } from "../../docs/data/spinner.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const spinner = ($$anchor) => {
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

const defaultSize = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/spinner#default-size',
				'aria-label': 'default-size',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('default size');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_2, 2);

			{
				const demo = ($$anchor) => {
					Spinner($$anchor, {});
				};

				var node_3 = $.child(div_3);

				demoAndCode(node_3, () => demo, () => spinnerDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const custom = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_2();
			var node_4 = $.first_child(fragment_6);

			LinkH2(node_4, {
				href: '/spinner#custom-size',
				'aria-label': 'custom-size',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('custom size');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_4 = $.sibling(node_4, 2);

			{
				const demo = ($$anchor) => {
					var div_5 = root_3();
					var node_5 = $.child(div_5);

					Spinner(node_5, { size: 12 });

					var node_6 = $.sibling(node_5, 2);

					Spinner(node_6, { size: 32 });

					var node_7 = $.sibling(node_6, 2);

					Spinner(node_7, { size: 40 });
					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				var node_8 = $.child(div_4);

				demoAndCode(node_8, () => demo, () => spinnerCustom);
				$.reset(div_4);
			}

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "show more", href: "/show-more" },
				next: { title: "snippet", href: "/snippet" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_9 = root_4();
	var node_9 = $.first_child(fragment_9);

	spinner(node_9);

	var node_10 = $.sibling(node_9, 2);

	defaultSize(node_10);

	var node_11 = $.sibling(node_10, 2);

	custom(node_11);

	var node_12 = $.sibling(node_11, 2);

	prevAndNext(node_12);
	$.append($$anchor, fragment_9);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(
	`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">spinner</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Indicate an action running in the background. Unlike the loading dots, this should
			generally be used to indicate loading feedback in response to a user action, like for
			buttons, pagination, etc.</p>`,
	1
);

var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_3 = $.from_html(`<div class="flex items-center gap-8"><!> <!> <!></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('1uvfshi', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Spinner';
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