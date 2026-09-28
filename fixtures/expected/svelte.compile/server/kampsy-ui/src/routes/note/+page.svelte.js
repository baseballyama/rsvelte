import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Button, Note } from "$lib/index.js";

import {
	noteAction,
	noteDefault,
	noteSuccess,
	noteError,
	noteWarning,
	noteViolet,
	noteCyan,
	noteSecondary
} from "../../docs/data/note.js";

import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function note($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">note</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Display text that requires attention or provides additional information.</p>`);
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

function defaultNote($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-6 md:flex md:gap-6 md:space-y-0">`);

				Note($$renderer, {
					size: 'small',
					children: ($$renderer) => {
						$$renderer.push(`<!---->A small note`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->A default note`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					size: 'large',
					children: ($$renderer) => {
						$$renderer.push(`<!---->A large note`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/note#default',
				'aria-label': 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, noteDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function roundedCode($$renderer, rct) {
	$$renderer.push(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs">${$.escape(rct)}</code>`);
}

function actionSnip($$renderer) {
	Button($$renderer, {
		size: 'small',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Upgrade`);
		},
		$$slots: { default: true }
	});
}

function action($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-6">`);

				Note($$renderer, {
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details a large amount information that could potentially wrap into two
						or more lines, forcing the height of the Note to be larger.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/note#action',
				'aria-label': 'action',
				children: ($$renderer) => {
					$$renderer.push(`<!---->action`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The `);
			roundedCode($$renderer, "action");
			$$renderer.push(`<!----> prop accepts a `);
			roundedCode($$renderer, "Snippet");
			$$renderer.push(`<!---->.</p> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, noteAction);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function success($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-6">`);

				Note($$renderer, {
					type: 'success',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'success',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'success',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'success',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'success',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'success',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/note#success',
				'aria-label': 'success',
				children: ($$renderer) => {
					$$renderer.push(`<!---->success`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, noteSuccess);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function error($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-6">`);

				Note($$renderer, {
					type: 'error',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some error information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'error',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some error information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'error',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'error',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some error information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'error',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some error information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'error',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/note#error',
				'aria-label': 'error',
				children: ($$renderer) => {
					$$renderer.push(`<!---->error`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, noteError);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function warning($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-6">`);

				Note($$renderer, {
					type: 'warning',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some warning information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'warning',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some warning information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'warning',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'warning',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some warning information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'warning',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some warning information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'warning',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/note#warning',
				'aria-label': 'warning',
				children: ($$renderer) => {
					$$renderer.push(`<!---->warning`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, noteWarning);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function secondary($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-6">`);

				Note($$renderer, {
					type: 'secondary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some secondary information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'secondary',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some secondary information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'secondary',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'secondary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some secondary information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'secondary',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some secondary information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'secondary',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/note#secondary',
				'aria-label': 'secondary',
				children: ($$renderer) => {
					$$renderer.push(`<!---->secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, noteSecondary);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function violet($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-6">`);

				Note($$renderer, {
					type: 'violet',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some violet information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'violet',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some violet information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'violet',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'violet',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some violet information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'violet',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some violet information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'violet',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/note#violet',
				'aria-label': 'violet',
				children: ($$renderer) => {
					$$renderer.push(`<!---->violet`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, noteViolet);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function cyan($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-6">`);

				Note($$renderer, {
					type: 'cyan',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some cyan information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'cyan',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some cyan information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					type: 'cyan',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'cyan',
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some cyan information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'cyan',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some cyan information.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Note($$renderer, {
					fill: true,
					type: 'cyan',
					action: actionSnip,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/note#cyan',
				'aria-label': 'cyan',
				children: ($$renderer) => {
					$$renderer.push(`<!---->cyan`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, noteCyan);
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
				previous: { title: "modal", href: "/modal" },
				next: { title: "pagination", href: "/pagination" }
			});
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	note($$renderer);
	$$renderer.push(`<!----> `);
	defaultNote($$renderer);
	$$renderer.push(`<!----> `);
	action($$renderer);
	$$renderer.push(`<!----> `);
	success($$renderer);
	$$renderer.push(`<!----> `);
	error($$renderer);
	$$renderer.push(`<!----> `);
	warning($$renderer);
	$$renderer.push(`<!----> `);
	secondary($$renderer);
	$$renderer.push(`<!----> `);
	violet($$renderer);
	$$renderer.push(`<!----> `);
	cyan($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('1t249ed', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Note</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}