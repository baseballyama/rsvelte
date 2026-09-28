import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Input, SearchInput } from "$lib/index.js";
import ArrowCircleUp from "$lib/icons/arrow-circle-up.svelte";

import {
	inputDefault,
	inputPrefixAndSuffix,
	inputDisabled,
	inputLabel,
	inputError,
	inputSearch
} from "$lib/../docs/data/input.js";

import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function input($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">input</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Retrieve text input from a user.</p>`);
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

function defaultInput($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo input',
					placeholder: 'small',
					size: 'small'
				});

				$$renderer.push(`<!----> `);
				Input($$renderer, { 'aria-labelledby': 'Demo input', placeholder: 'default' });
				$$renderer.push(`<!----> `);

				Input($$renderer, {
					'aria-labelledby': 'Demo input',
					placeholder: 'large',
					size: 'large'
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/input#default',
				'aria-label': 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, inputDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function prefixAndSuffix($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					contPrefix: ArrowCircleUp,
					placeholder: 'default'
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					contSuffix: ArrowCircleUp,
					placeholder: 'default'
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					contPrefix: 'https://',
					contSuffix: '.com',
					placeholder: 'default'
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					contPrefix: ArrowCircleUp,
					prefixStyling: false,
					contSuffix: ArrowCircleUp,
					suffixStyling: false,
					placeholder: 'default'
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					contPrefix: 'ui',
					placeholder: 'default'
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/input#prefix-and-suffix',
				'aria-label': 'prefix and suffix',
				children: ($$renderer) => {
					$$renderer.push(`<!---->prefix and suffix`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, inputPrefixAndSuffix);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function inputDisabledSnip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					placeholder: 'Disabled with placeholder',
					disabled: true
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					value: 'Disabled with placeholder',
					disabled: true
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					contPrefix: ArrowCircleUp,
					placeholder: 'Disabled with prefix',
					disabled: true
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					contSuffix: ArrowCircleUp,
					placeholder: 'Disabled with suffix',
					disabled: true
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					contPrefix: 'https://',
					contSuffix: '.com',
					placeholder: 'Disabled with prefix and suffix',
					disabled: true
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo',
					contPrefix: ArrowCircleUp,
					prefixStyling: false,
					contSuffix: ArrowCircleUp,
					suffixStyling: false,
					placeholder: 'Disabled with prefix and suffix',
					disabled: true
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/input#disabled',
				'aria-label': 'disabled',
				children: ($$renderer) => {
					$$renderer.push(`<!---->disabled`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, inputDisabled);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function searchSnip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);
				SearchInput($$renderer, { placeholder: 'Enter some text...' });
				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/input#search',
				'aria-label': 'search',
				children: ($$renderer) => {
					$$renderer.push(`<!---->search`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Automatically clears the input if escape is pressed.</p> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, inputSearch);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function errorSnip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo input',
					error: 'An error message.',
					placeholder: 'long-error@gmail.com',
					size: 'small'
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo input',
					error: 'An error message.',
					placeholder: 'long-error@gmail.com'
				});

				$$renderer.push(`<!----></div> <div class="grid w-full grid-cols-1 lg:grid-cols-3">`);

				Input($$renderer, {
					'aria-labelledby': 'Demo input',
					error: 'An error message.',
					placeholder: 'long-error@gmail.com',
					size: 'large'
				});

				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/input#error',
				'aria-label': 'error',
				children: ($$renderer) => {
					$$renderer.push(`<!---->error`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, inputError);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function inputLabelSnip($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Input($$renderer, {
					'aria-labelledby': 'Demo input',
					label: 'Label',
					placeholder: 'Label'
				});
			}

			LinkH2($$renderer, {
				href: '/input#label',
				'aria-label': 'label',
				children: ($$renderer) => {
					$$renderer.push(`<!---->label`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, inputLabel);
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
				previous: { title: "error", href: "/error" },
				next: { title: "keyboard input", href: "/keyboard-input" }
			});
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	input($$renderer);
	$$renderer.push(`<!----> `);
	defaultInput($$renderer);
	$$renderer.push(`<!----> `);
	prefixAndSuffix($$renderer);
	$$renderer.push(`<!----> `);
	inputDisabledSnip($$renderer);
	$$renderer.push(`<!----> `);
	searchSnip($$renderer);
	$$renderer.push(`<!----> `);
	errorSnip($$renderer);
	$$renderer.push(`<!----> `);
	inputLabelSnip($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('rx1dtf', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Input</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}