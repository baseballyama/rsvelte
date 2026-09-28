import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import clsx from "clsx";
import { clampSize } from "$lib/forms/input-field";
import { getButtonGroupContext } from "$lib/context";

export default function InputAddon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			class: className,
			size,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let background = getContext("background");
		const group = getButtonGroupContext();

		const borderClasses = {
			base: "border-gray-300 dark:border-gray-600",
			tinted: "border-gray-300 dark:border-gray-500"
		};

		const darkBgClasses = {
			base: "dark:bg-gray-600 dark:text-gray-400",
			tinted: "dark:bg-gray-500 dark:text-gray-300"
		};

		const divider = {
			base: "dark:border-e-gray-700 dark:last:border-e-gray-600",
			tinted: "dark:border-e-gray-600 dark:last:border-e-gray-500"
		};

		const textSizes = { sm: "sm:text-xs", md: "text-sm", lg: "sm:text-base" };
		const prefixPadding = { sm: "px-2", md: "px-3", lg: "px-4" };

		// size: explicit, inherited, default
		let _size = $.derived(() => size || (group?.size ? clampSize(group.size) : undefined) || "md");

		let divClass = $.derived(() => clsx(textSizes[_size()], prefixPadding[_size()], "text-gray-500 bg-gray-200", background ? darkBgClasses.tinted : darkBgClasses.base, background ? divider.tinted : divider.base, background ? borderClasses["tinted"] : borderClasses["base"], "inline-flex items-center border", group && "not-first:-ms-px", "first:rounded-s-lg last:rounded-e-lg", className));

		$$renderer.push(`<div${$.attributes({ ...restProps, class: $.clsx(divClass()) })}>`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}