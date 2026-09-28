import * as $ from 'svelte/internal/server';
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

function projectBanner($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Project Banner</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Used for temporary, project-wide notifications that require resolution.</p>`);
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

function roundedCode($$renderer, rct) {
	$$renderer.push(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs">${$.escape(rct)}</code>`);
}

function success($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

				ProjectBanner($$renderer, {
					icon: ShieldCheck,
					callToAction: { label: "Disable", href: "/project-banner" },
					label: 'Attack Challenge Mode is enabled for this project',
					variant: 'success'
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/project-banner#success',
				'aria-label': 'success',
				children: ($$renderer) => {
					$$renderer.push(`<!---->success`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">For positive, temporary mitigations put in place to protect a project, e.g., Attack
			Challenge Mode.</p> <div class="mt-4 xl:mt-7">`);

			demoAndCode($$renderer, demo, projectBannerSuccess);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function warning($$renderer) {
	function labelSnip($$renderer) {
		$$renderer.push(`<!---->This project was rolled back by `);

		Tooltip($$renderer, {
			class: 'underline decoration-dashed underline-offset-[5px]',
			text: 'Yesterday for project marketing-website',
			children: ($$renderer) => {
				$$renderer.push(`<!---->@johnphamous`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

				ProjectBanner($$renderer, {
					icon: RotateCounterClockWise,
					callToAction: {
						label: "Undo Rollback",
						onClick: () => {
							alert("Button clicked");
						}
					},
					label: labelSnip,
					variant: 'warning'
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/project-banner#warning',
				'aria-label': 'warning',
				children: ($$renderer) => {
					$$renderer.push(`<!---->warning`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">When a project is in an exceptional state which requires non-immediate action to exit,
			e.g., during a rollback. The `);

			roundedCode($$renderer, "label");
			$$renderer.push(`<!----> prop accepts either a `);
			roundedCode($$renderer, "string");
			$$renderer.push(`<!----> or a `);
			roundedCode($$renderer, "Snippet");
			$$renderer.push(`<!---->.</p> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, projectBannerWarning);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function error($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

				ProjectBanner($$renderer, {
					icon: Warning,
					callToAction: { label: "Add Credit Card", href: "/project-banner" },
					label: 'Payment failed, update credit card information before your account is shut down',
					variant: 'error'
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/project-banner#error',
				'aria-label': 'error',
				children: ($$renderer) => {
					$$renderer.push(`<!---->error`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">When a project is approaching or experiencing critical downtime which requires immediate
			attention, e.g., when payment is overdue.</p> <div class="mt-4 xl:mt-7">`);

			demoAndCode($$renderer, demo, projectBannerError);
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
				previous: { title: "progress", href: "/progress" },
				next: { title: "select", href: "/select" }
			});
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	projectBanner($$renderer);
	$$renderer.push(`<!----> `);
	success($$renderer);
	$$renderer.push(`<!----> `);
	warning($$renderer);
	$$renderer.push(`<!----> `);
	error($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('1wpo9xr', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Project Banner</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}