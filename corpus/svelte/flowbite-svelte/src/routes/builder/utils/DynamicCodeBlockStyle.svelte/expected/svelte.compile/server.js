import * as $ from 'svelte/internal/server';
import { browser } from "$app/environment";
import { toUpperSnakeCase } from "./helpers";

export default function DynamicCodeBlockStyle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className } = $$props;
		const stylesImport = import.meta.glob("./highlight/styles/*.css");
		const localStorageName = toUpperSnakeCase(__NAME__) + "_CODE_BLOCK_STYLE";

		let selected = browser
			? localStorage.getItem(localStorageName) ?? "gigavolt"
			: "gigavolt";

		const styles = Object.entries(stylesImport).map(([path]) => ({
			value: path.slice(path.lastIndexOf("/") + 1, -4),
			name: path.slice(path.lastIndexOf("/") + 1, -4)
		}));

		$$renderer.select(
			{
				'aria-label': 'Code block style',
				class: `w-48 border border-gray-200 p-1 text-gray-800 dark:text-gray-800 ${$.stringify(
					// get selected style from localStorage
					// clean up
					className
				)}`,
				value: selected
			},
			($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(styles);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let theme = each_array[$$index];

					$$renderer.option({ value: theme.value }, ($$renderer) => {
						$$renderer.push(`${$.escape(theme.value)}`);
					});
				}

				$$renderer.push(`<!--]-->`);
			}
		);
	});
}