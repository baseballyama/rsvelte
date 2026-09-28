import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import clsx from "clsx";
import { clampSize } from "$lib/forms/input-field";
import { getButtonGroupContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'size'
]);

var root = $.from_html(`<div><!></div>`);

export default function InputAddon($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
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
	let _size = $.derived(() => $$props.size || (group?.size ? clampSize(group.size) : undefined) || "md");

	let divClass = $.derived(() => clsx(textSizes[$.get(_size)], prefixPadding[$.get(_size)], "text-gray-500 bg-gray-200", background ? darkBgClasses.tinted : darkBgClasses.base, background ? divider.tinted : divider.base, background ? borderClasses["tinted"] : borderClasses["base"], "inline-flex items-center border", group && "not-first:-ms-px", "first:rounded-s-lg last:rounded-e-lg", $$props.class));
	var div = root();

	$.attribute_effect(div, () => ({ ...restProps, class: $.get(divClass) }));

	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}