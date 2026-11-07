import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import { EmptyState } from "$lib/index.js";
import { emptyStateDefault, blankStateDocs, informationalDocs } from "$lib/../docs/data/emptyState.js";
import Pagination from "$lib/pagination/pagination.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";
import Text from "$lib/text/text.svelte";
import { ChartBarPeak } from "$lib/icons/index.js";
import Button from "$lib/button/button.svelte";

const emptyState = ($$anchor) => {
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

const defaultEmptyState = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_6();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/empty-state#default',
				'aria-label': 'default',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Empty state Design framework');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 4);

			Text(node_3, {
				size: 16,
				class: 'mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_4 = root_2();

					$.next();
					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Text(node_4, {
				size: 16,
				class: 'mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_5 = root_3();

					$.next();
					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Text(node_5, {
				size: 16,
				class: 'mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_6 = root_4();

					$.next();
					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Text(node_6, {
				size: 16,
				class: 'mt-2 xl:mt-4',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_7 = root_5();

					$.next();
					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_6, 2);

			{
				const demo = ($$anchor) => {
					var fragment_8 = $.comment();
					var node_7 = $.first_child(fragment_8);

					$.component(node_7, () => EmptyState.Root, ($$anchor, EmptyState_Root) => {
						EmptyState_Root($$anchor, {
							description: 'A message conveying the state of the product.',
							get icon() {
								return ChartBarPeak;
							},
							title: 'Title'
						});
					});

					$.append($$anchor, fragment_8);
				};

				var node_8 = $.child(div_3);

				demoAndCode(node_8, () => demo, () => emptyStateDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const blank = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_10 = root_7();
			var node_9 = $.first_child(fragment_10);

			LinkH2(node_9, {
				href: '/empty-state#blank-state',
				'aria-label': 'blank-state',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('blank state');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_4 = $.sibling(node_9, 4);

			{
				const demo = ($$anchor) => {
					var fragment_11 = $.comment();
					var node_10 = $.first_child(fragment_11);

					$.component(node_10, () => EmptyState.Root, ($$anchor, EmptyState_Root_1) => {
						EmptyState_Root_1($$anchor, {
							description: 'A message conveying the state of the product.',
							get icon() {
								return ChartBarPeak;
							},
							title: 'Title'
						});
					});

					$.append($$anchor, fragment_11);
				};

				var node_11 = $.child(div_4);

				demoAndCode(node_11, () => demo, () => blankStateDocs);
				$.reset(div_4);
			}

			$.append($$anchor, fragment_10);
		},
		$$slots: { default: true }
	});
};

const informational = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_8();
			var node_12 = $.first_child(fragment_13);

			LinkH2(node_12, {
				href: '/empty-state#informational',
				'aria-label': 'informational',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Informational');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var div_5 = $.sibling(node_12, 6);

			{
				const demo = ($$anchor) => {
					var fragment_14 = $.comment();
					var node_13 = $.first_child(fragment_14);

					$.component(node_13, () => EmptyState.Root, ($$anchor, EmptyState_Root_2) => {
						EmptyState_Root_2($$anchor, {
							description: 'This should detail the actions you can take on this screen, as well as why it’s valuable.',
							get icon() {
								return ChartBarPeak;
							},
							title: 'Title',
							children: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									variant: 'secondary',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Primary Action');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_14);
				};

				var node_14 = $.child(div_5);

				demoAndCode(node_14, () => demo, () => informationalDocs);
				$.reset(div_5);
			}

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "description", href: "/description" },
				next: { title: "error", href: "/error" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_18 = root_9();
	var node_15 = $.first_child(fragment_18);

	emptyState(node_15);

	var node_16 = $.sibling(node_15, 2);

	defaultEmptyState(node_16);

	var node_17 = $.sibling(node_16, 2);

	blank(node_17);

	var node_18 = $.sibling(node_17, 2);

	informational(node_18);

	var node_19 = $.sibling(node_18, 2);

	prevAndNext(node_19);
	$.append($$anchor, fragment_18);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(
	`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">Empty State</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Fill spaces when no content has been added yet, or is temporarily empty due to the nature
			of the feature and should be designed to prevent confusion.</p>`,
	1
);

var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`- Blank Slate <span class="text-kui-light-gray-900 dark:text-kui-dark-gray-900">- Basic empty state for first run experience</span>`, 1);

var root_3 = $.from_html(
	`- Informationa <span class="text-kui-light-gray-900 dark:text-kui-dark-gray-900">- Alternative for first use empty state, including in-line CTAs and supplemental
				documentation links</span>`,
	1
);

var root_4 = $.from_html(
	`- Educational <span class="text-kui-light-gray-900 dark:text-kui-dark-gray-900">- Launch a contextual onboarding flow to gain deeper understanding about that area of
				the app</span>`,
	1
);

var root_5 = $.from_html(
	`- Guide <span class="text-kui-light-gray-900 dark:text-kui-dark-gray-900">- Starter content that allows users to interact with data and learn the system by
				tinkering or setting up their environment</span>`,
	1
);

var root_6 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">When designed thoughtfully, empty states become an essential part of a smooth user
			experience, providing enough context to keep users working in a productive way. There are
			several approaches to explore that will match the needs a developer in different
			situations:</p> <!> <!> <!> <!> <div class="mt-4 xl:mt-7"><!></div>`,
	1
);

var root_7 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The most basic empty state should convey the state of the view.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);

var root_8 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Help users by clearly explaining the benefit and utility of a product or feature, with a
			call to action and link to more information to help users progress.</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Default to showing rather than telling the value of a feature. Certain entry points to a
			product may call for a unique empty state and a call to upgrade. Informational empty
			states will include a call to action.</p> <div class="mt-4 xl:mt-7"><!></div>`,
	1
);

var root_9 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('1yyp1pq', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Empty State';
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