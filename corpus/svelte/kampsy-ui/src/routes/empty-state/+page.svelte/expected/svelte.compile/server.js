import * as $ from 'svelte/internal/server';
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

function emptyState($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">Empty State</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Fill spaces when no content has been added yet, or is temporarily empty due to the nature
			of the feature and should be designed to prevent confusion.</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4">`);
	demo($$renderer);
	$$renderer.push(`<!----></div></div> `);
	CollapseCode($$renderer, { code });
	$$renderer.push(`<!----></div>`);
}

function defaultEmptyState($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				if (EmptyState.Root) {
					$$renderer.push('<!--[-->');

					EmptyState.Root($$renderer, {
						description: 'A message conveying the state of the product.',
						icon: ChartBarPeak,
						title: 'Title'
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			LinkH2($$renderer, {
				href: '/empty-state#default',
				'aria-label': 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Empty state Design framework`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">When designed thoughtfully, empty states become an essential part of a smooth user
			experience, providing enough context to keep users working in a productive way. There are
			several approaches to explore that will match the needs a developer in different
			situations:</p> `);

			Text($$renderer, {
				size: 16,
				class: 'mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->- Blank Slate <span class="text-kui-light-gray-900 dark:text-kui-dark-gray-900">- Basic empty state for first run experience</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: 16,
				class: 'mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->- Informationa <span class="text-kui-light-gray-900 dark:text-kui-dark-gray-900">- Alternative for first use empty state, including in-line CTAs and supplemental
				documentation links</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: 16,
				class: 'mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->- Educational <span class="text-kui-light-gray-900 dark:text-kui-dark-gray-900">- Launch a contextual onboarding flow to gain deeper understanding about that area of
				the app</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: 16,
				class: 'mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->- Guide <span class="text-kui-light-gray-900 dark:text-kui-dark-gray-900">- Starter content that allows users to interact with data and learn the system by
				tinkering or setting up their environment</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, emptyStateDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function blank($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				if (EmptyState.Root) {
					$$renderer.push('<!--[-->');

					EmptyState.Root($$renderer, {
						description: 'A message conveying the state of the product.',
						icon: ChartBarPeak,
						title: 'Title'
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			LinkH2($$renderer, {
				href: '/empty-state#blank-state',
				'aria-label': 'blank-state',
				children: ($$renderer) => {
					$$renderer.push(`<!---->blank state`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The most basic empty state should convey the state of the view.</p> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, blankStateDocs);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function informational($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				if (EmptyState.Root) {
					$$renderer.push('<!--[-->');

					EmptyState.Root($$renderer, {
						description: 'This should detail the actions you can take on this screen, as well as why it’s valuable.',
						icon: ChartBarPeak,
						title: 'Title',
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'secondary',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Primary Action`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			LinkH2($$renderer, {
				href: '/empty-state#informational',
				'aria-label': 'informational',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Informational`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Help users by clearly explaining the benefit and utility of a product or feature, with a
			call to action and link to more information to help users progress.</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Default to showing rather than telling the value of a feature. Certain entry points to a
			product may call for a unique empty state and a call to upgrade. Informational empty
			states will include a call to action.</p> <div class="mt-4 xl:mt-7">`);

			demoAndCode($$renderer, demo, informationalDocs);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "description", href: "/description" },
				next: { title: "error", href: "/error" }
			});
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	emptyState($$renderer);
	$$renderer.push(`<!----> `);
	defaultEmptyState($$renderer);
	$$renderer.push(`<!----> `);
	blank($$renderer);
	$$renderer.push(`<!----> `);
	informational($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('1yyp1pq', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Empty State</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}