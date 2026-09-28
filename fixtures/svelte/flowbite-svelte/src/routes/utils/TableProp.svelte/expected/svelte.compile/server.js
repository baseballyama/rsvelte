import * as $ from 'svelte/internal/server';
import { twMerge } from "tailwind-merge";
import { setContext } from "svelte";

export default function TableProp($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			category = "props",
			tableClass = "w-full text-sm text-left text-gray-500 dark:text-gray-400",
			theadClass = "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400",
			thClass = "px-6 py-3",
			divClass = "w-full relative overflow-x-auto shadow-md sm:rounded-lg py-4",
			class: className
		} = $$props;

		const headerNames = {
			props: ["Name", "Default"],
			events: ["Names"],
			slots: ["Names"]
		};

		let header = $.derived(() => headerNames[category]);

		$$renderer.push(`<div${$.attr_class($.clsx(divClass))}><table${$.attr_class($.clsx(tableClass))}><thead${$.attr_class($.clsx(twMerge(theadClass, className)))}><tr>`);

		if (category === "props") {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(header());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let column = each_array[$$index];

				$$renderer.push(`<th scope="col"${$.attr_class($.clsx(thClass))}>${$.escape(column)}</th>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><th scope="col"${$.attr_class($.clsx(thClass))}>${$.escape(header())}</th>`);
		}

		$$renderer.push(`<!--]--></tr></thead><tbody>`);
		children($$renderer);
		$$renderer.push(`<!----></tbody></table></div>`);
	});
}