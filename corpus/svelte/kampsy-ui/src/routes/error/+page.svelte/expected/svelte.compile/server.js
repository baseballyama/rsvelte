import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Error from "$lib/error/error.svelte";
import { errorCustomLabel, errorDefault, errorSize, errorWithProp } from "$lib/../docs/data/error.js";
import Pagination from "$lib/pagination/pagination.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function error($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">error</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Good error design is clear, useful, and friendly. Designing concise and accurate error
			messages unblocks users and builds trust by meeting people where they are.</p>`);
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

			LinkH2($$renderer, {
				href: '/error#default',
				'aria-label': 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, errorDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function customLabel($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div>`);

				Error($$renderer, {
					label: 'Email Error',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This email address is already in use.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/error#custome-label',
				'aria-label': 'custom-label',
				children: ($$renderer) => {
					$$renderer.push(`<!---->custom label`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, errorCustomLabel);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function size($$renderer) {
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

			LinkH2($$renderer, {
				href: '/error#size',
				'aria-label': 'size',
				children: ($$renderer) => {
					$$renderer.push(`<!---->size`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
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
						link: "https://ui.kampsy.xyz/error"
					}
				});
			}

			LinkH2($$renderer, {
				href: '/error#with-an-error-property',
				'aria-label': 'With an error property',
				children: ($$renderer) => {
					$$renderer.push(`<!---->With an error property`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
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
				previous: { title: "empty state", href: "/empty-state" },
				next: { title: "input", href: "/input" }
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
	customLabel($$renderer);
	$$renderer.push(`<!----> `);
	size($$renderer);
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
	$.head('1oztu9', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Error</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}