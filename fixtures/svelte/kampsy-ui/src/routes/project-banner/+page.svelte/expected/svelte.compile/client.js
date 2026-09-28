import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { ProjectBanner, Tooltip } from "$lib/index.js";

import {
	projectBannerError,
	projectBannerSuccess,
	projectBannerWarning
} from "../../docs/data/project-banner.js";

import { RotateCounterClockWise, ShieldCheck, Warning } from "$lib/icons/index.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const projectBanner = ($$anchor) => {
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

	var div_3 = $.sibling(div_1, 2);
	var node_1 = $.child(div_3);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
};

const roundedCode = ($$anchor, rct = $.noop) => {
	var code_1 = root_2();
	var text = $.only_child(code_1, true);

	$.template_effect(() => $.set_text(text, rct()));
	$.append($$anchor, code_1);
};

const success = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_4();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/project-banner#success',
				'aria-label': 'success',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('success');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_4 = $.sibling(node_2, 4);

			{
				const demo = ($$anchor) => {
					var div_5 = root_3();
					var node_3 = $.child(div_5);

					ProjectBanner(node_3, {
						get icon() {
							return ShieldCheck;
						},
						callToAction: { label: "Disable", href: "/project-banner" },
						label: 'Attack Challenge Mode is enabled for this project',
						variant: 'success'
					});

					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				var node_4 = $.child(div_4);

				demoAndCode(node_4, () => demo, () => projectBannerSuccess);
				$.reset(div_4);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const warning = ($$anchor) => {
	const labelSnip = ($$anchor) => {
		$.next();

		var fragment_4 = root_5();
		var node_5 = $.sibling($.first_child(fragment_4));

		Tooltip(node_5, {
			class: 'underline decoration-dashed underline-offset-[5px]',
			text: 'Yesterday for project marketing-website',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_2 = $.text('@johnphamous');

				$.append($$anchor, text_2);
			},
			$$slots: { default: true }
		});

		$.append($$anchor, fragment_4);
	};

	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_6();
			var node_6 = $.first_child(fragment_6);

			LinkH2(node_6, {
				href: '/project-banner#warning',
				'aria-label': 'warning',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('warning');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var p = $.sibling(node_6, 2);
			var node_7 = $.sibling($.child(p));

			roundedCode(node_7, () => "label");

			var node_8 = $.sibling(node_7, 2);

			roundedCode(node_8, () => "string");

			var node_9 = $.sibling(node_8, 2);

			roundedCode(node_9, () => "Snippet");
			$.next();
			$.reset(p);

			var div_6 = $.sibling(p, 2);

			{
				const demo = ($$anchor) => {
					var div_7 = root_3();
					var node_10 = $.child(div_7);

					ProjectBanner(node_10, {
						get icon() {
							return RotateCounterClockWise;
						},

						callToAction: {
							label: "Undo Rollback",
							onClick: () => {
								alert("Button clicked");
							}
						},

						get label() {
							return labelSnip;
						},
						variant: 'warning'
					});

					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				var node_11 = $.child(div_6);

				demoAndCode(node_11, () => demo, () => projectBannerWarning);
				$.reset(div_6);
			}

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});
};

const error = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_7();
			var node_12 = $.first_child(fragment_8);

			LinkH2(node_12, {
				href: '/project-banner#error',
				'aria-label': 'error',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('error');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var div_8 = $.sibling(node_12, 4);

			{
				const demo = ($$anchor) => {
					var div_9 = root_3();
					var node_13 = $.child(div_9);

					ProjectBanner(node_13, {
						get icon() {
							return Warning;
						},
						callToAction: { label: "Add Credit Card", href: "/project-banner" },
						label: 'Payment failed, update credit card information before your account is shut down',
						variant: 'error'
					});

					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				var node_14 = $.child(div_8);

				demoAndCode(node_14, () => demo, () => projectBannerError);
				$.reset(div_8);
			}

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "progress", href: "/progress" },
				next: { title: "select", href: "/select" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_11 = root_8();
	var node_15 = $.first_child(fragment_11);

	projectBanner(node_15);

	var node_16 = $.sibling(node_15, 2);

	success(node_16);

	var node_17 = $.sibling(node_16, 2);

	warning(node_17);

	var node_18 = $.sibling(node_17, 2);

	error(node_18);

	var node_19 = $.sibling(node_18, 2);

	prevAndNext(node_19);
	$.append($$anchor, fragment_11);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Project Banner</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Used for temporary, project-wide notifications that require resolution.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs"> </code>`);
var root_3 = $.from_html(`<div class="w-full"><!></div>`);

var root_4 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">For positive, temporary mitigations put in place to protect a project, e.g., Attack
			Challenge Mode.</p> <div class="mt-4 xl:mt-7"><!></div>`,
	1
);

var root_5 = $.from_html(`This project was rolled back by <!>`, 1);

var root_6 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">When a project is in an exceptional state which requires non-immediate action to exit,
			e.g., during a rollback. The <!> prop accepts either a <!> or a <!>.</p> <div class="mt-4 xl:mt-7"><!></div>`,
	1
);

var root_7 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">When a project is approaching or experiencing critical downtime which requires immediate
			attention, e.g., when payment is overdue.</p> <div class="mt-4 xl:mt-7"><!></div>`,
	1
);

var root_8 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('1wpo9xr', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Project Banner';
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