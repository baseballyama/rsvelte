import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CodeSnip from "$lib/code/codeSnip.svelte";
import Pagination from "$lib/pagination/pagination.svelte";

import {
	installationConfig,
	installationKampsy,
	installationSveltekit
} from "../../docs/data/installation.js";

import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function gettingStarted($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">Getting started</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Begin your journey with Kampsy-ui by following the quickstart guide to unlock the power
			of interactive Svelte 5 components, seamlessly integrated with Tailwind CSS.</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCodeSnip($$renderer, code, lang = "tsx", language = "language-tsx") {
	$$renderer.push(`<div class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border">`);
	CodeSnip($$renderer, { code, lang, language });
	$$renderer.push(`<!----></div>`);
}

function sveltekit($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			LinkH2($$renderer, {
				href: '/installation#using-svelteKit',
				'aria-label': 'Using SvelteKit',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Using SvelteKit`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">We recommend using `);
			roundedCode($$renderer, "SvelteKit");

			$$renderer.push(`<!----> , the official application framework
			from the Svelte team powered by `);

			roundedCode($$renderer, "Vite");
			$$renderer.push(`<!----> .</p> <div class="mt-4 xl:mt-7">`);
			demoAndCodeSnip($$renderer, installationSveltekit, "bash", "language-bash");
			$$renderer.push(`<!----></div> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">After running the above command, you’ll be asked: `);
			roundedCode($$renderer, "Which template would you like?");
			$$renderer.push(`<!----> Select `);
			roundedCode($$renderer, "SvelteKit minimal");
			$$renderer.push(`<!----> and press Enter.</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Next, you’ll see the prompt: `);
			roundedCode($$renderer, "Add type checking with Typescript?");

			$$renderer.push(`<!----> We
			recommend keeping the default option: `);

			roundedCode($$renderer, "Yes, using TypeScript syntax.");
			$$renderer.push(`<!----> Press Enter to confirm.</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">You will then see the question: `);
			roundedCode($$renderer, "What would you like to add to your project?");
			$$renderer.push(`<!----> Use the arrow keys to navigate, and spacebar to select or deselect options. Choose the following: `);
			roundedCode($$renderer, "prettier");
			$$renderer.push(`<!----> , `);
			roundedCode($$renderer, "eslint");
			$$renderer.push(`<!----> , `);
			roundedCode($$renderer, "vitest");
			$$renderer.push(`<!----> , `);
			roundedCode($$renderer, "playwright");
			$$renderer.push(`<!---->, `);
			roundedCode($$renderer, "tailwindcss");

			$$renderer.push(`<!----> .</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">SvelteKit now includes Tailwind CSS 4 by default, which uses a simpler configuration
			approach. Press enter to confirm</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Tailwindcss plugins (optional): For the question: `);

			roundedCode($$renderer, "Tailwindcss: Which plugins would you like to add?");
			$$renderer.push(`<!----> Press Enter if no plugins are needed.</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Finally, you’ll be asked: `);
			roundedCode($$renderer, "Which package manager do you want to install dependencies with?");
			$$renderer.push(`<!----> Choose `);
			roundedCode($$renderer, "pnpm,");

			$$renderer.push(`<!----> as it is preferred. Press Enter to confirm.</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Once the dependencies are installed, your SvelteKit project with Tailwindcss is ready!
			Navigate to your project directory `);

			roundedCode($$renderer, "cd my-app");

			$$renderer.push(`<!----> . From here, you can
			proceed to the next step.</p>`);
		},
		$$slots: { default: true }
	});
}

function kampsyui($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			LinkH2($$renderer, {
				href: '/installation#install-kampsy-ui',
				'aria-label': 'install kampsy-ui',
				children: ($$renderer) => {
					$$renderer.push(`<!---->install kampsy-ui`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Run the following command to install kampsy-ui:</p> <div class="mt-4 xl:mt-7">`);
			demoAndCodeSnip($$renderer, installationKampsy, "bash", "language-bash");
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function roundedCode($$renderer, rct) {
	$$renderer.push(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs">${$.escape(rct)}</code>`);
}

function config($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			LinkH2($$renderer, {
				href: '/installation#configuration',
				'aria-label': 'Configuration',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Configuration`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Add the following to your `);
			roundedCode($$renderer, "layout.css");
			$$renderer.push(`<!----> file.</p> <div class="mt-4 xl:mt-7">`);
			demoAndCodeSnip($$renderer, installationConfig);
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
				previous: { title: "introduction", href: "/" },
				next: { title: "colors", href: "/colors" }
			});
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	gettingStarted($$renderer);
	$$renderer.push(`<!----> `);
	sveltekit($$renderer);
	$$renderer.push(`<!----> `);
	kampsyui($$renderer);
	$$renderer.push(`<!----> `);
	config($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('t06thp', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Installation</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}