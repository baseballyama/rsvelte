import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import StatusDot from "$lib/statusDot/statusDot.svelte";
import { statusDotDefault, statusDotLabel } from "../../docs/data/status-dot.js";
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
			var fragment_3 = root_3();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/status-dot#default',
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

					StatusDot(node_3, { state: 'QUEUED' });

					var node_4 = $.sibling(node_3, 2);

					StatusDot(node_4, { state: 'BUILDING' });

					var node_5 = $.sibling(node_4, 2);

					StatusDot(node_5, { state: 'ERROR' });

					var node_6 = $.sibling(node_5, 2);

					StatusDot(node_6, { state: 'READY' });

					var node_7 = $.sibling(node_6, 2);

					StatusDot(node_7, { state: 'CANCELED' });
					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				var node_8 = $.child(div_3);

				demoAndCode(node_8, () => demo, () => statusDotDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const customLabel = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_9 = $.first_child(fragment_5);

			LinkH2(node_9, {
				href: '/status-dot#label',
				'aria-label': 'label',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('label');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_5 = $.sibling(node_9, 2);

			{
				const demo = ($$anchor) => {
					var div_6 = root_2();
					var node_10 = $.child(div_6);

					StatusDot(node_10, { label: true, state: 'QUEUED' });

					var node_11 = $.sibling(node_10, 2);

					StatusDot(node_11, { label: true, state: 'BUILDING' });

					var node_12 = $.sibling(node_11, 2);

					StatusDot(node_12, { label: true, state: 'ERROR' });

					var node_13 = $.sibling(node_12, 2);

					StatusDot(node_13, { label: true, state: 'READY' });

					var node_14 = $.sibling(node_13, 2);

					StatusDot(node_14, { label: true, state: 'CANCELED' });
					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				var node_15 = $.child(div_5);

				demoAndCode(node_15, () => demo, () => statusDotLabel);
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
				previous: { title: "split button", href: "/split-button" },
				next: { title: "switch", href: "/switch" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_8 = root_4();
	var node_16 = $.first_child(fragment_8);

	error(node_16);

	var node_17 = $.sibling(node_16, 2);

	defaultErr(node_17);

	var node_18 = $.sibling(node_17, 2);

	customLabel(node_18);

	var node_19 = $.sibling(node_18, 2);

	prevAndNext(node_19);
	$.append($$anchor, fragment_8);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Status Dot</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display an indicator of deployment status.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<div class="space-y-6"><!> <!> <!> <!> <!></div>`);
var root_3 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('l8653d', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Status Dot';
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