import * as $ from 'svelte/internal/server';
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

function error($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Snippet</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display a snippet of copyable code for the command line.</p>`);
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
				CodeSnippet($$renderer, { text: 'npm init next-app', class: 'w-full lg:w-[300px]' });
			}

			LinkH2($$renderer, {
				href: '/snippet#default',
				'aria-label': 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, snippetDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function inverted($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				CodeSnippet($$renderer, {
					type: 'inverted',
					text: 'npm init next-app',
					class: 'w-full lg:w-[300px]'
				});
			}

			LinkH2($$renderer, {
				href: '/error#custome-label',
				'aria-label': 'custom-label',
				children: ($$renderer) => {
					$$renderer.push(`<!---->inverted`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, snippetInverted);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function multiline($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				CodeSnippet($$renderer, { text: ["cd project", "now"], class: 'w-full' });
			}

			LinkH2($$renderer, {
				href: '/snippet#multiline',
				'aria-label': 'multiline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->multiline`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, snippetMultiline);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function noPrompt($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				CodeSnippet($$renderer, {
					prompt: false,
					text: 'npm init next-app',
					class: 'w-full lg:w-[300px]'
				});
			}

			LinkH2($$renderer, {
				href: '/snippet#no-prompt',
				'aria-label': 'no-prompt',
				children: ($$renderer) => {
					$$renderer.push(`<!---->no prompt`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, snippetNoPrompt);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function callback($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				CodeSnippet($$renderer, {
					onCopy: () => alert("You copied the text!"),
					text: 'npm init next-app',
					class: 'w-full lg:w-[300px]'
				});
			}

			LinkH2($$renderer, {
				href: '/snippet#callback',
				'aria-label': 'callback',
				children: ($$renderer) => {
					$$renderer.push(`<!---->callback`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, snippetCallback);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function size($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex w-full flex-col flex-wrap gap-3">`);

				CodeSnippet($$renderer, {
					type: 'success',
					text: 'npm init next-app',
					class: 'w-full lg:w-[300px]'
				});

				$$renderer.push(`<!----> `);

				CodeSnippet($$renderer, {
					type: 'error',
					text: 'npm init next-app',
					class: 'w-full lg:w-[300px]'
				});

				$$renderer.push(`<!----> `);

				CodeSnippet($$renderer, {
					type: 'warning',
					text: 'npm init next-app',
					class: 'w-full lg:w-[300px]'
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/snippet#variants',
				'aria-label': 'variants',
				children: ($$renderer) => {
					$$renderer.push(`<!---->variants`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, snippetVariants);
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
				previous: { title: "spinner", href: "/spinner" },
				next: { title: "split button", href: "/split-button" }
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
	inverted($$renderer);
	$$renderer.push(`<!----> `);
	multiline($$renderer);
	$$renderer.push(`<!----> `);
	noPrompt($$renderer);
	$$renderer.push(`<!----> `);
	callback($$renderer);
	$$renderer.push(`<!----> `);
	size($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('1el55rq', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Snippet</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}