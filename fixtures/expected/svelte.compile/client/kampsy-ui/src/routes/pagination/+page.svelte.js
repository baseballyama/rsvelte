import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { paginationDefault } from "$lib/../docs/data/pagination.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const pagination = ($$anchor) => {
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

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "note", href: "/note" },
				next: { title: "progress", href: "/progress" }
			});
		},
		$$slots: { default: true }
	});
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">pagination</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Navigate to the previous or next page.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor) {
	const defaultComp = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_2();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/pagination#default',
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
						Pagination($$anchor, {
							get previous() {
								return prev;
							},

							get next() {
								return next;
							}
						});
					};

					var node_3 = $.child(div_3);

					demoAndCode(node_3, () => demo, () => paginationDefault);
					$.reset(div_3);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_7 = root_3();
		var node_4 = $.first_child(fragment_7);

		pagination(node_4);

		var node_5 = $.sibling(node_4, 2);

		defaultComp(node_5);

		var node_6 = $.sibling(node_5, 2);

		prevAndNext(node_6);
		$.append($$anchor, fragment_7);
	};

	const prev = { title: "Home", href: "#" };
	const next = { title: "Introduction", href: "#" };

	$.head('1sugu9l', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Pagination';
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