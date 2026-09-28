import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ChevronDown } from "$lib/icons/index.js";
import { getContext } from "svelte";

var root = $.from_html(`<span class="px-[6px] font-medium capitalize"><!></span>`);
var root_1 = $.from_html(`<div class="flex"><button type="button"><!></button> <div></div> <button type="button"><span class="flex px-[6px]"><span class="h-4 w-4"><!></span></span></button></div>`);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	// oxlint-disable-next-line svelte/no-unused-props -- false positive: quoted renamed prop is used in the template
	let onclick = $.prop($$props, 'onclick', 3, undefined),
		ariaLabel = $.prop($$props, 'aria-label', 3, undefined),
		shape = $.prop($$props, 'shape', 3, undefined),
		size = $.prop($$props, 'size', 3, "medium"),
		type = $.prop($$props, 'type', 3, "primary"),
		disabled = $.prop($$props, 'disabled', 3, false),
		children = $.prop($$props, 'children', 3, undefined);

	const typeObj = {
		primary: `text-white dark:text-kui-dark-bg bg-kui-light-gray-1000 dark:bg-kui-dark-gray-1000 
		hover:opacity-85 hover:dark:opacity-90`,

		tertiary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 hover:bg-kui-light-gray-200 
		dark:hover:bg-kui-dark-gray-200`,

		error: `text-[#F5F5F5] bg-kui-light-red-800 dark:bg-kui-dark-red-800 hover:bg-kui-light-red-900 
		dark:hover:bg-kui-dark-red-900 `,

		warning: `text-kui-light-gray-1000 bg-kui-light-amber-700 dark:bg-kui-dark-amber-700 
		hover:bg-kui-light-amber-800 dark:hover:bg-kui-dark-amber-800`
	};

	const sizeObj = {
		tiny: "h-[24px] text-xs leading-3",
		small: "h-8 px-[6px] text-sm leading-4",
		medium: "h-[40px] px-[10px] text-sm leading-5",
		large: "h-[48px] px-[14px] text-base leading-6"
	};

	let sizeClass = $.derived(() => {
		return sizeObj[size()];
	});

	// Button
	const typeButtonObj = {
		...typeObj,
		secondary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-bg dark:bg-kui-dark-bg border-l border-y
		border-kui-light-gray-200 dark:border-kui-dark-gray-400 hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`
	};

	let typeButtonClass = $.derived(() => {
		return typeButtonObj[type()];
	});

	const radiusButtonObj = {
		tiny: "rounded-l-[4px]",
		small: "rounded-l-[6px]",
		medium: "rounded-l-[6px]",
		large: "rounded-l-[8px]"
	};

	let roundedButtonWithShapeClass = $.derived(() => {
		if (shape() == "circle") {
			return "rounded-full";
		}

		return radiusButtonObj[size()];
	});

	let buttonClass = $.derived(() => {
		return `${$.get(sizeClass)}  ${$.get(typeButtonClass)} ${$.get(roundedButtonWithShapeClass)}`;
	});

	// The divider between the buttons
	const sizeDivideObj = {
		tiny: "h-[24px]",
		small: "h-8",
		medium: "h-[40px]",
		large: "h-[48px]"
	};

	let sizeDivideClass = $.derived(() => {
		return sizeDivideObj[size()];
	});

	const typeDivideObj = {
		primary: "border-kui-light-gray-900 dark:border-kui-dark-gray-900",
		secondary: "border-kui-light-gray-200 dark:border-kui-dark-gray-400",
		tertiary: "border-kui-light-gray-200 dark:border-kui-dark-gray-400",
		error: "border-kui-light-red-900 dark:border-kui-dark-red-900",
		warning: "border-kui-light-amber-800 dark:border-kui-dark-amber-800"
	};

	let typeDivideClass = $.derived(() => {
		return typeDivideObj[type()];
	});

	// The menu button with the icon
	const typeMenuObj = {
		...typeObj,
		secondary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-bg dark:bg-kui-dark-bg border-r border-y
		border-kui-light-gray-200 dark:border-kui-dark-gray-400 hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`
	};

	let typeMenuClass = $.derived(() => {
		return typeMenuObj[type()];
	});

	const radiusMenuObj = {
		tiny: "rounded-r-[4px]",
		small: "rounded-r-[6px]",
		medium: "rounded-r-[6px]",
		large: "rounded-r-[8px]"
	};

	let roundedMenuWithShapeClass = $.derived(() => {
		if (shape() == "circle") {
			return "rounded-full";
		}

		return radiusMenuObj[size()];
	});

	let menuClass = $.derived(() => {
		return `${$.get(sizeClass)} ${$.get(typeMenuClass)} ${$.get(roundedMenuWithShapeClass)}`;
	});

	const rootState = getContext("split-button");

	const toogle = (evt) => {
		const target = evt.currentTarget;
		const position = target.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const positionFromTop = position.top;
		const positionFromBottom = viewportHeight - position.bottom;

		if (positionFromTop > positionFromBottom) {
			rootState.setContentPosition(`bottom-[112%]`);
			rootState.setTransY(10);
		} else {
			rootState.setContentPosition(`top-[112%]`);
			rootState.setTransY(-10);
		}

		rootState.setIsActive(!rootState.getIsActive());
	};

	var div = root_1();
	var button = $.child(div);
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var node_1 = $.child(span);

			$.snippet(node_1, children);
			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (children()) $$render(consequent);
		});
	}

	$.reset(button);

	var div_1 = $.sibling(button, 2);
	var button_1 = $.sibling(div_1, 2);
	var span_1 = $.child(button_1);
	var span_2 = $.child(span_1);
	var node_2 = $.child(span_2);

	ChevronDown(node_2, {});
	$.reset(span_2);
	$.reset(span_1);
	$.reset(button_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-label', ariaLabel());
		button.disabled = disabled();
		$.set_class(button, 1, $.clsx($.get(buttonClass)));
		$.set_class(div_1, 1, `${$.get(sizeDivideClass) ?? ''} border-l ${$.get(typeDivideClass) ?? ''}`);
		$.set_attribute(button_1, 'aria-label', ariaLabel());
		button_1.disabled = disabled();
		$.set_class(button_1, 1, $.clsx($.get(menuClass)));
	});

	$.delegated('click', button, function (...$$args) {
		onclick()?.apply(this, $$args);
	});

	$.delegated('click', button_1, toogle);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);