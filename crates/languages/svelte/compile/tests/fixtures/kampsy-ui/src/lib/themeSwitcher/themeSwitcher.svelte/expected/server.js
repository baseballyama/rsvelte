import * as $ from 'svelte/internal/server';
import { switcher } from "./themeSwitcher.svelte.js";
import DeviceAlternative from "$lib/icons/device-alternate.svelte";
import Sun from "$lib/icons/sun.svelte";
import Moon from "$lib/icons/moon.svelte";
import { randomString } from "$lib/utils/random.js";

export default function ThemeSwitcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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
			$$derived_array = $.derived(() => $.to_array($$d(), 3)),
			system = $.derived(() => $$derived_array()[0]),
			light = $.derived(() => $$derived_array()[1]),
			dark = $.derived(() => $$derived_array()[2]);

		$$renderer.push(`<span><div${$.attr_class(`flex h-8 w-[96px] items-center overflow-hidden rounded-full ${$.stringify(contBorder())} border-kui-light-gray-200 dark:border-kui-dark-gray-400`)}><div class="h-8 w-8"><input${$.attr('checked', switcher.theme === "system", true)}${$.attr('id', `theme-switch-system-${$.stringify(randStr)}`)} type="radio" value="system" name="theme" class="hidden"/> <label${$.attr('for', `theme-switch-system-${$.stringify(randStr)}`)}${$.attr_class(`h-full w-full rounded-full transition duration-0 ${$.stringify(system())} flex cursor-pointer items-center justify-center`)}>`);
		DeviceAlternative($$renderer, {});
		$$renderer.push(`<!----></label></div> <div class="h-8 w-8"><input${$.attr('checked', switcher.theme === "light", true)}${$.attr('id', `theme-switch-light-${$.stringify(randStr)}`)} type="radio" value="light" name="theme" class="hidden"/> <label${$.attr('for', `theme-switch-light-${$.stringify(randStr)}`)}${$.attr_class(`h-full w-full rounded-full transition duration-0 ${$.stringify(light())} flex cursor-pointer items-center justify-center`)}>`);
		Sun($$renderer, {});
		$$renderer.push(`<!----></label></div> <div class="h-8 w-8"><input${$.attr('checked', switcher.theme === "dark", true)}${$.attr('id', `theme-switch-dark-${$.stringify(randStr)}`)} type="radio" value="dark" name="theme" class="hidden"/> <label${$.attr('for', `theme-switch-dark-${$.stringify(randStr)}`)}${$.attr_class(`h-full w-full rounded-full transition duration-0 ${$.stringify(dark())} flex cursor-pointer items-center justify-center`)}>`);
		Moon($$renderer, {});
		$$renderer.push(`<!----></label></div></div></span>`);
	});
}