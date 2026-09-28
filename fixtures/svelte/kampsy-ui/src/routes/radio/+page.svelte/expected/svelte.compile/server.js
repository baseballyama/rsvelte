import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Error from "$lib/error/error.svelte";
import { errorDefault, errorSize, errorWithProp } from "../../docs/data/error.js";
import Pagination from "$lib/pagination/pagination.svelte";

function error($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 llg:leading-12 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:tracking-[-2.4px]">radio</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Provides single user input from a selection of options.</p>`);
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

function defaultErr($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div>`);

				Error($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->This email address is already in use.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize"><a href="#default" id="default">default</a></h2> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, errorDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function disabled($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Error($$renderer, {
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This email is in use.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Error($$renderer, {
					size: 'md',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This email is in use.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Error($$renderer, {
					size: 'lg',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This email is in use.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize"><a href="#size" id="default">Radio disabled</a></h2> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, errorSize);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function withErrorProp($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Error($$renderer, {
					error: {
						message: "The request failed.",
						action: "Contact Us",
						link: "https://kampsy.kampsy.xyz/error"
					}
				});
			}

			$$renderer.push(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize"><a href="#size" id="default">With an error property</a></h2> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, errorWithProp);
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
				previous: { title: "button", href: "/button" },
				next: { title: "pagination", href: "/pagination" }
			});
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	error($$renderer);
	$$renderer.push(`<!----> `);
	defaultErr($$renderer);
	$$renderer.push(`<!----> `);
	disabled($$renderer);
	$$renderer.push(`<!----> `);
	withErrorProp($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('15sw65o', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Error</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}