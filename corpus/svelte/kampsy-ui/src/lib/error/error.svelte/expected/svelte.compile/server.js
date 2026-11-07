import * as $ from 'svelte/internal/server';
import Error from "$lib/icons/error.svelte";
import LinkExternal from "$lib/icons/link-external.svelte";

export default function Error_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label, size = "md", error = undefined, children } = $$props;

		const sizeObj = {
			sm: "text-[13px] leading-5",
			md: "text-[14px] leading-5",
			lg: "text-[16px] leading-6"
		};

		let sizeClass = $.derived(() => {
			return sizeObj[size];
		});

		function childrenLabelSizeSnip($$renderer) {
			$$renderer.push(`<div${$.attr_class(`space-x-1 ${$.stringify(sizeClass())}`)}>`);

			if (label) {
				$$renderer.push(`<!--[0--><span class="text-kui-light-red-900 dark:text-kui-dark-red-900 font-medium">${$.escape(label)}:</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (children) {
				$$renderer.push(`<!--[0--><span class="text-kui-light-red-900 dark:text-kui-dark-red-900 font-normal">`);
				children($$renderer);
				$$renderer.push(`<!----></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		function withErrorPropSnip($$renderer) {
			$$renderer.push(`<div class="text-kui-light-red-900 dark:text-kui-dark-red-900 flex items-center gap-1 text-[14px]">${$.escape(error?.message || "")} <div class="border-kui-light-red-900 dark:border-kui-dark-red-900 hover:text-kui-light-red-600 dark:hover:text-kui-dark-red-800 hover:border-kui-light-red-600 dark:hover:border-kui-dark-red-800 border-b leading-5 font-medium capitalize"><a${$.attr('href', error?.link || "")}><div class="flex items-center gap-1">${$.escape(error?.action || "")} <div class="h-3.5 w-3.5">`);
			LinkExternal($$renderer, {});
			$$renderer.push(`<!----></div></div></a></div></div>`);
		}

		function errorSnip($$renderer) {
			if (error) {
				$$renderer.push('<!--[0-->');
				withErrorPropSnip($$renderer);
			} else {
				$$renderer.push('<!--[-1-->');
				childrenLabelSizeSnip($$renderer);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<div class="flex items-center gap-2"><div class="text-kui-light-red-900 dark:text-kui-dark-red-900 h-4 w-4">`);
		Error($$renderer, {});
		$$renderer.push(`<!----></div> <div>`);
		errorSnip($$renderer);
		$$renderer.push(`<!----></div></div>`);
	});
}