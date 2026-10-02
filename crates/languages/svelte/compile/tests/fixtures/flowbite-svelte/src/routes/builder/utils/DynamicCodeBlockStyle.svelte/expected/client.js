import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from "$app/environment";
import { toUpperSnakeCase } from "./helpers";

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select aria-label="Code block style"></select>`);

export default function DynamicCodeBlockStyle($$anchor, $$props) {
	$.push($$props, true);

	const stylesImport = import.meta.glob("./highlight/styles/*.css");
	const localStorageName = toUpperSnakeCase(__NAME__) + "_CODE_BLOCK_STYLE";

	let selected = $.state($.proxy(browser
		? localStorage.getItem(localStorageName) ?? "gigavolt"
		: "gigavolt"));

	const styles = Object.entries(stylesImport).map(([path]) => ({
		value: path.slice(path.lastIndexOf("/") + 1, -4),
		name: path.slice(path.lastIndexOf("/") + 1, -4)
	}));

	$.user_effect(() => {
		let link;

		(async () => {
			const css = await import(`./highlight/styles/${$.get(selected)}.css?url`);

			link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = css.default;
			document.head.append(link);
		})();

		if (browser) {
			// get selected style from localStorage
			localStorage.setItem(localStorageName, $.get(selected));
		}

		return () => {
			// clean up
			link.remove();
		};
	});

	var select = root_1();

	$.each(select, 21, () => styles, $.index, ($$anchor, theme) => {
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text, $.get(theme).value);

			if (option_value !== (option_value = $.get(theme).value)) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.init_select(select);
	$.template_effect(() => $.set_class(select, 1, `w-48 border border-gray-200 p-1 text-gray-800 dark:text-gray-800 ${$$props.class ?? ''}`));
	$.bind_select_value(select, () => $.get(selected), ($$value) => $.set(selected, $$value));
	$.append($$anchor, select);
	$.pop();
}