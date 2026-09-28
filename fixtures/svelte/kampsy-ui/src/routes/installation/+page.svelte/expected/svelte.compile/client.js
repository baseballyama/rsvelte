import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

const gettingStarted = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCodeSnip = ($$anchor, code = $.noop, $$arg1, $$arg2) => {
	let lang = $.derived_safe_equal(() => $.fallback($$arg1?.(), "tsx"));
	let language = $.derived_safe_equal(() => $.fallback($$arg2?.(), "language-tsx"));
	var div = root_1();
	var node = $.child(div);

	CodeSnip(node, {
		get code() {
			return code();
		},

		get lang() {
			return $.get(lang);
		},

		get language() {
			return $.get(language);
		}
	});

	$.reset(div);
	$.append($$anchor, div);
};

const sveltekit = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_1 = $.first_child(fragment_3);

			LinkH2(node_1, {
				href: '/installation#using-svelteKit',
				'aria-label': 'Using SvelteKit',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Using SvelteKit');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var p = $.sibling(node_1, 2);
			var node_2 = $.sibling($.child(p));

			roundedCode(node_2, () => "SvelteKit");

			var node_3 = $.sibling(node_2, 2);

			roundedCode(node_3, () => "Vite");
			$.next();
			$.reset(p);

			var div_1 = $.sibling(p, 2);
			var node_4 = $.child(div_1);

			demoAndCodeSnip(node_4, () => installationSveltekit, () => "bash", () => "language-bash");
			$.reset(div_1);

			var p_1 = $.sibling(div_1, 2);
			var node_5 = $.sibling($.child(p_1));

			roundedCode(node_5, () => "Which template would you like?");

			var node_6 = $.sibling(node_5, 2);

			roundedCode(node_6, () => "SvelteKit minimal");
			$.next();
			$.reset(p_1);

			var p_2 = $.sibling(p_1, 2);
			var node_7 = $.sibling($.child(p_2));

			roundedCode(node_7, () => "Add type checking with Typescript?");

			var node_8 = $.sibling(node_7, 2);

			roundedCode(node_8, () => "Yes, using TypeScript syntax.");
			$.next();
			$.reset(p_2);

			var p_3 = $.sibling(p_2, 2);
			var node_9 = $.sibling($.child(p_3));

			roundedCode(node_9, () => "What would you like to add to your project?");

			var node_10 = $.sibling(node_9, 2);

			roundedCode(node_10, () => "prettier");

			var node_11 = $.sibling(node_10, 2);

			roundedCode(node_11, () => "eslint");

			var node_12 = $.sibling(node_11, 2);

			roundedCode(node_12, () => "vitest");

			var node_13 = $.sibling(node_12, 2);

			roundedCode(node_13, () => "playwright");

			var node_14 = $.sibling(node_13, 2);

			roundedCode(node_14, () => "tailwindcss");
			$.next();
			$.reset(p_3);

			var p_4 = $.sibling(p_3, 4);
			var node_15 = $.sibling($.child(p_4));

			roundedCode(node_15, () => "Tailwindcss: Which plugins would you like to add?");
			$.next();
			$.reset(p_4);

			var p_5 = $.sibling(p_4, 2);
			var node_16 = $.sibling($.child(p_5));

			roundedCode(node_16, () => "Which package manager do you want to install dependencies with?");

			var node_17 = $.sibling(node_16, 2);

			roundedCode(node_17, () => "pnpm,");
			$.next();
			$.reset(p_5);

			var p_6 = $.sibling(p_5, 2);
			var node_18 = $.sibling($.child(p_6));

			roundedCode(node_18, () => "cd my-app");
			$.next();
			$.reset(p_6);
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const kampsyui = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_3();
			var node_19 = $.first_child(fragment_5);

			LinkH2(node_19, {
				href: '/installation#install-kampsy-ui',
				'aria-label': 'install kampsy-ui',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('install kampsy-ui');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var div_2 = $.sibling(node_19, 4);
			var node_20 = $.child(div_2);

			demoAndCodeSnip(node_20, () => installationKampsy, () => "bash", () => "language-bash");
			$.reset(div_2);
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});
};

const roundedCode = ($$anchor, rct = $.noop) => {
	var code_1 = root_4();
	var text_2 = $.only_child(code_1, true);

	$.template_effect(() => $.set_text(text_2, rct()));
	$.append($$anchor, code_1);
};

const config = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_5();
			var node_21 = $.first_child(fragment_7);

			LinkH2(node_21, {
				href: '/installation#configuration',
				'aria-label': 'Configuration',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Configuration');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var p_7 = $.sibling(node_21, 2);
			var node_22 = $.sibling($.child(p_7));

			roundedCode(node_22, () => "layout.css");
			$.next();
			$.reset(p_7);

			var div_3 = $.sibling(p_7, 2);
			var node_23 = $.child(div_3);

			demoAndCodeSnip(node_23, () => installationConfig);
			$.reset(div_3);
			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "introduction", href: "/" },
				next: { title: "colors", href: "/colors" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_10 = root_6();
	var node_24 = $.first_child(fragment_10);

	gettingStarted(node_24);

	var node_25 = $.sibling(node_24, 2);

	sveltekit(node_25);

	var node_26 = $.sibling(node_25, 2);

	kampsyui(node_26);

	var node_27 = $.sibling(node_26, 2);

	config(node_27);

	var node_28 = $.sibling(node_27, 2);

	prevAndNext(node_28);
	$.append($$anchor, fragment_10);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(
	`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">Getting started</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Begin your journey with Kampsy-ui by following the quickstart guide to unlock the power
			of interactive Svelte 5 components, seamlessly integrated with Tailwind CSS.</p>`,
	1
);

var root_1 = $.from_html(`<div class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><!></div>`);

var root_2 = $.from_html(
	`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">We recommend using <!> , the official application framework
			from the Svelte team powered by <!> .</p> <div class="mt-4 xl:mt-7"><!></div> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">After running the above command, you’ll be asked: <!> Select <!> and press Enter.</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Next, you’ll see the prompt: <!> We
			recommend keeping the default option: <!> Press Enter to confirm.</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">You will then see the question: <!> Use the arrow keys to navigate, and spacebar to select or deselect options. Choose the following: <!> , <!> , <!> , <!>, <!> .</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">SvelteKit now includes Tailwind CSS 4 by default, which uses a simpler configuration
			approach. Press enter to confirm</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Tailwindcss plugins (optional): For the question: <!> Press Enter if no plugins are needed.</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Finally, you’ll be asked: <!> Choose <!> as it is preferred. Press Enter to confirm.</p> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Once the dependencies are installed, your SvelteKit project with Tailwindcss is ready!
			Navigate to your project directory <!> . From here, you can
			proceed to the next step.</p>`,
	1
);

var root_3 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Run the following command to install kampsy-ui:</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs"> </code>`);
var root_5 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Add the following to your <!> file.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_6 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('t06thp', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Installation';
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