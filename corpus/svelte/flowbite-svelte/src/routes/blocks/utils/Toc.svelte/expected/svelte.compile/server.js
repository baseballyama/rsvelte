import * as $ from 'svelte/internal/server';
import { afterNavigate } from "$app/navigation";
import { tick } from "svelte";

export default function Toc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/*
		  Inspired by 'svelte-toc'
		  Simplified version of Table of Contents.
		  */
		const aClass = "inline-block border-s border-white duration-200 hover:text-gray-900 transition-none dark:hover:text-white hover:border-gray-300 after:content-['#'] after:text-primary-700 dark:after:text-primary-700 dark:border-gray-900 dark:hover:border-gray-700 after:ms-2 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-100";

		let {
			extract = (x) => ({ name: x.textContent ?? "" }),
			headingSelector
		} = $$props;

		let headings = [];

		function indent(name) {
			return name === "H2" ? "ps-2.5" : "ps-6";
		}

		function toc(_) {
			// Delay initalization to post page load
			tick().then(() => {
				if (typeof document === `undefined`) return; // for SSR

				headings = [...document.querySelectorAll(headingSelector)].map(extract).filter((x) => x.name);
			});
		}

		afterNavigate(toc);
		$$renderer.push(`<div class="me-auto hidden w-64 flex-none ps-8 xl:block xl:text-sm">`);

		if (headings.length) {
			$$renderer.push(`<!--[0--><div class="sticky top-20 flex h-[calc(100vh-5rem)] flex-col justify-between overflow-y-auto pb-6"><div class="mb-40"><h4 class="my-4 ps-2.5 text-sm font-semibold tracking-wide text-gray-900 uppercase dark:text-white">On this page</h4> <nav><ul class="space-y-2.5 overflow-x-hidden font-medium text-gray-500 dark:text-gray-400"><!--[-->`);

			const each_array = $.ensure_array_like(headings);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let { rel, href, name } = each_array[$$index];

				$$renderer.push(`<li><a${$.attr('href', href)}${$.attr_class(`${$.stringify(indent(rel))} inline-block border-s border-white duration-200 hover:text-gray-900 transition-none dark:hover:text-white hover:border-gray-300 after:content-['#'] after:text-primary-700 dark:after:text-primary-700 dark:border-gray-900 dark:hover:border-gray-700 after:ms-2 after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-100`)}>${$.escape(name)}</a></li>`);
			}

			$$renderer.push(`<!--]--></ul></nav></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}