import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import Tooltip from "$lib/tooltip/tooltip.svelte";
import { tooltipComponents, toolTipCustomType, toolTipDefault } from "../../docs/data/tooltip.js";
import Button from "$lib/button/button.svelte";
import { Badge } from "$lib/index.js";
import Spinner from "$lib/spinner/spinner.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function tooltip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Tooltip</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">A set of headings, vertically stacked, that each reveal an related section of content.
			Commonly referred to as an accordion.</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4">`);
	demo($$renderer);
	$$renderer.push(`<!----></div></div> <div class="overflow-hidden rounded-b-xl">`);
	CollapseCode($$renderer, { code });
	$$renderer.push(`<!----></div></div>`);
}

function defaultTooltip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div>`);

				Tooltip($$renderer, {
					text: 'The Evil Rabbit Jumped over the Fence',
					position: 'top',
					children: ($$renderer) => {
						$$renderer.push(`<span>Top</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Tooltip($$renderer, {
					text: 'The Evil Rabbit Jumped over the Fence',
					position: 'bottom',
					children: ($$renderer) => {
						$$renderer.push(`<span>Bottom</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Tooltip($$renderer, {
					text: 'The Evil Rabbit Jumped over the Fence',
					position: 'right',
					children: ($$renderer) => {
						$$renderer.push(`<span>Right</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Tooltip($$renderer, {
					text: 'The Evil Rabbit Jumped over the Fence',
					position: 'left',
					children: ($$renderer) => {
						$$renderer.push(`<span>Left</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/tooltip#default',
				'aria-label': 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, toolTipDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function customType($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div>`);

				Tooltip($$renderer, {
					text: 'The Evil Rabbit Jumped over the Fence',
					position: 'top',
					type: 'success',
					children: ($$renderer) => {
						$$renderer.push(`<span>Top</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Tooltip($$renderer, {
					text: 'The Evil Rabbit Jumped over the Fence',
					position: 'bottom',
					type: 'error',
					children: ($$renderer) => {
						$$renderer.push(`<span>Bottom</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Tooltip($$renderer, {
					text: 'The Evil Rabbit Jumped over the Fence',
					position: 'right',
					type: 'warning',
					children: ($$renderer) => {
						$$renderer.push(`<span>Right</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <div>`);

				Tooltip($$renderer, {
					text: 'The Evil Rabbit Jumped over the Fence',
					position: 'left',
					type: 'violet',
					children: ($$renderer) => {
						$$renderer.push(`<span>Left</span>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/tooltip#custom-type',
				'aria-label': 'custom type',
				children: ($$renderer) => {
					$$renderer.push(`<!---->custom type`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, toolTipCustomType);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function components($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Tooltip($$renderer, {
					position: 'bottom',
					text: 'The Evil Rabbit Jumped over the Fence',
					children: ($$renderer) => {
						Button($$renderer, {
							size: 'small',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Bottom`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					position: 'right',
					text: 'The Evil Rabbit Jumped over the Fence',
					children: ($$renderer) => {
						Spinner($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tooltip($$renderer, {
					position: 'left',
					text: 'The Evil Rabbit Jumped over the Fence',
					children: ($$renderer) => {
						Badge($$renderer, {
							size: 'sm',
							children: ($$renderer) => {
								$$renderer.push(`<!---->LEFT`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			LinkH2($$renderer, {
				href: '/tooltip#components',
				'aria-label': 'components',
				children: ($$renderer) => {
					$$renderer.push(`<!---->components`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, tooltipComponents);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, { previous: { title: "toggle", href: "/toggle" } });
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	tooltip($$renderer);
	$$renderer.push(`<!----> `);
	defaultTooltip($$renderer);
	$$renderer.push(`<!----> `);
	customType($$renderer);
	$$renderer.push(`<!----> `);
	components($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('52ybyk', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Tooltip</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}