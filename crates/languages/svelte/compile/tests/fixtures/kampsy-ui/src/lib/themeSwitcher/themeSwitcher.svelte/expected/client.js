import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { switcher } from "./themeSwitcher.svelte.js";
import DeviceAlternative from "$lib/icons/device-alternate.svelte";
import Sun from "$lib/icons/sun.svelte";
import Moon from "$lib/icons/moon.svelte";
import { randomString } from "$lib/utils/random.js";

var root = $.from_html(`<span><div><div class="h-8 w-8"><input type="radio" value="system" name="theme" class="hidden"/> <label><!></label></div> <div class="h-8 w-8"><input type="radio" value="light" name="theme" class="hidden"/> <label><!></label></div> <div class="h-8 w-8"><input type="radio" value="dark" name="theme" class="hidden"/> <label><!></label></div></div></span>`);

export default function ThemeSwitcher($$anchor, $$props) {
	$.push($$props, true);

	const randStr = randomString(8);

	const onchange = (evt) => {
		const target = evt.currentTarget;

		switcher.setTheme(target.value);
	};

	let contBorder = $.derived(() => {
		switch (switcher.theme) {
			case "system":
				return "border-r border-y";

			case "light":
				return "border";

			case "dark":
				return "border-l border-y";

			default:
				return "border-r border-y";
		}
	});

	let $$d = $.derived(() => {
			switch (switcher.theme) {
				case "system":
					return [
						"border border-kui-light-gray-200 dark:border-kui-dark-gray-400 text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 ",
						"text-kui-light-gray-900 dark:text-kui-dark-gray-900 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000",
						"text-kui-light-gray-900 dark:text-kui-dark-gray-900 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000"
					];

				case "light":
					return [
						"text-kui-light-gray-900 dark:text-kui-dark-gray-900 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000",
						"border border-kui-light-gray-200 dark:border-kui-dark-gray-400 text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
						"text-kui-light-gray-900 dark:text-kui-dark-gray-900 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000"
					];

				case "dark":
					return [
						"text-kui-light-gray-900 dark:text-kui-dark-gray-900 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000",
						"text-kui-light-gray-900 dark:text-kui-dark-gray-900 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000",
						"border border-kui-light-gray-200 dark:border-kui-dark-gray-400 text-kui-light-gray-1000 dark:text-kui-dark-gray-1000"
					];

				default:
					return [
						"border border-kui-light-gray-200 dark:border-kui-dark-gray-400 text-kui-light-gray-1000 dark:text-kui-dark-gray-1000",
						"dark:text-kui-dark-gray-900 hover:text-kui-dark-gray-1000 dark:hover:text-kui-dark-gray-1000",
						"dark:text-kui-dark-gray-900 hover:text-kui-dark-gray-1000 dark:hover:text-kui-dark-gray-1000"
					];
			}
		}),
		$$array = $.derived(() => $.to_array($.get($$d), 3)),
		system = $.derived(() => $.get($$array)[0]),
		light = $.derived(() => $.get($$array)[1]),
		dark = $.derived(() => $.get($$array)[2]);

	$.user_effect(() => {
		if (switcher.theme === "system") {
			const str = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

			document.body.className = `${str} text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary`;
		} else {
			document.body.className = `${switcher.theme} text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary`;
		}
	});

	var span = root();
	var div = $.child(span);
	var div_1 = $.child(div);
	var input = $.child(div_1);

	$.remove_input_defaults(input);

	var label = $.sibling(input, 2);
	var node = $.child(label);

	DeviceAlternative(node, {});
	$.reset(label);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var input_1 = $.child(div_2);

	$.remove_input_defaults(input_1);

	var label_1 = $.sibling(input_1, 2);
	var node_1 = $.child(label_1);

	Sun(node_1, {});
	$.reset(label_1);
	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var input_2 = $.child(div_3);

	$.remove_input_defaults(input_2);

	var label_2 = $.sibling(input_2, 2);
	var node_2 = $.child(label_2);

	Moon(node_2, {});
	$.reset(label_2);
	$.reset(div_3);
	$.reset(div);
	$.reset(span);

	$.template_effect(() => {
		$.set_class(div, 1, `flex h-8 w-[96px] items-center overflow-hidden rounded-full ${$.get(contBorder) ?? ''} border-kui-light-gray-200 dark:border-kui-dark-gray-400`);
		$.set_checked(input, switcher.theme === "system");
		$.set_attribute(input, 'id', `theme-switch-system-${randStr ?? ''}`);
		$.set_attribute(label, 'for', `theme-switch-system-${randStr ?? ''}`);
		$.set_class(label, 1, `h-full w-full rounded-full transition duration-0 ${$.get(system) ?? ''} flex cursor-pointer items-center justify-center`);
		$.set_checked(input_1, switcher.theme === "light");
		$.set_attribute(input_1, 'id', `theme-switch-light-${randStr ?? ''}`);
		$.set_attribute(label_1, 'for', `theme-switch-light-${randStr ?? ''}`);
		$.set_class(label_1, 1, `h-full w-full rounded-full transition duration-0 ${$.get(light) ?? ''} flex cursor-pointer items-center justify-center`);
		$.set_checked(input_2, switcher.theme === "dark");
		$.set_attribute(input_2, 'id', `theme-switch-dark-${randStr ?? ''}`);
		$.set_attribute(label_2, 'for', `theme-switch-dark-${randStr ?? ''}`);
		$.set_class(label_2, 1, `h-full w-full rounded-full transition duration-0 ${$.get(dark) ?? ''} flex cursor-pointer items-center justify-center`);
	});

	$.delegated('change', input, onchange);
	$.delegated('change', input_1, onchange);
	$.delegated('change', input_2, onchange);
	$.append($$anchor, span);
	$.pop();
}

$.delegate(['change']);