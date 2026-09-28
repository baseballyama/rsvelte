import * as $ from 'svelte/internal/server';

export default function ExampleRTL($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { rtl = "auto" } = $$props;

		if (rtl === "auto" && document.dir) {
			rtl = document.dir;
		}

		const transitions = { ltr: "rtl", rtl: "ltr", auto: "rtl" };

		function toggle() {
			rtl = transitions[rtl ?? "auto"];
		}

		$$renderer.push(`<button type="button" class="hover:text-primary-700 me-2 flex items-center rounded-lg border border-gray-200 bg-white p-2 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-gray-300 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-500">`);

		if (rtl === "rtl") {
			$$renderer.push(`<!--[0-->LTR`);
		} else {
			$$renderer.push(`<!--[-1-->RTL`);
		}

		$$renderer.push(`<!--]--> <span class="sr-only">Toggle direction</span></button>`);
		$.bind_props($$props, { rtl });
	});
}