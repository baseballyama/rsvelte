import * as $ from 'svelte/internal/server';
import { ChevronDown } from "$lib/icons/index.js";
import { getContext } from "svelte";

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// oxlint-disable-next-line svelte/no-unused-props -- false positive: quoted renamed prop is used in the template
		let {
			onclick = undefined,
			"aria-label": ariaLabel = undefined,
			shape = undefined,
			size = "medium",
			type = "primary",
			disabled = false,
			children = undefined
		} = $$props;

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
			return sizeObj[size];
		});

		// Button
		const typeButtonObj = {
			...typeObj,
			secondary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-bg dark:bg-kui-dark-bg border-l border-y
		border-kui-light-gray-200 dark:border-kui-dark-gray-400 hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`
		};

		let typeButtonClass = $.derived(() => {
			return typeButtonObj[type];
		});

		const radiusButtonObj = {
			tiny: "rounded-l-[4px]",
			small: "rounded-l-[6px]",
			medium: "rounded-l-[6px]",
			large: "rounded-l-[8px]"
		};

		let roundedButtonWithShapeClass = $.derived(() => {
			if (shape == "circle") {
				return "rounded-full";
			}

			return radiusButtonObj[size];
		});

		let buttonClass = $.derived(() => {
			return `${sizeClass()}  ${typeButtonClass()} ${roundedButtonWithShapeClass()}`;
		});

		// The divider between the buttons
		const sizeDivideObj = {
			tiny: "h-[24px]",
			small: "h-8",
			medium: "h-[40px]",
			large: "h-[48px]"
		};

		let sizeDivideClass = $.derived(() => {
			return sizeDivideObj[size];
		});

		const typeDivideObj = {
			primary: "border-kui-light-gray-900 dark:border-kui-dark-gray-900",
			secondary: "border-kui-light-gray-200 dark:border-kui-dark-gray-400",
			tertiary: "border-kui-light-gray-200 dark:border-kui-dark-gray-400",
			error: "border-kui-light-red-900 dark:border-kui-dark-red-900",
			warning: "border-kui-light-amber-800 dark:border-kui-dark-amber-800"
		};

		let typeDivideClass = $.derived(() => {
			return typeDivideObj[type];
		});

		// The menu button with the icon
		const typeMenuObj = {
			...typeObj,
			secondary: `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-bg dark:bg-kui-dark-bg border-r border-y
		border-kui-light-gray-200 dark:border-kui-dark-gray-400 hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100`
		};

		let typeMenuClass = $.derived(() => {
			return typeMenuObj[type];
		});

		const radiusMenuObj = {
			tiny: "rounded-r-[4px]",
			small: "rounded-r-[6px]",
			medium: "rounded-r-[6px]",
			large: "rounded-r-[8px]"
		};

		let roundedMenuWithShapeClass = $.derived(() => {
			if (shape == "circle") {
				return "rounded-full";
			}

			return radiusMenuObj[size];
		});

		let menuClass = $.derived(() => {
			return `${sizeClass()} ${typeMenuClass()} ${roundedMenuWithShapeClass()}`;
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

		$$renderer.push(`<div class="flex"><button${$.attr('aria-label', ariaLabel)} type="button"${$.attr('disabled', disabled, true)}${$.attr_class($.clsx(buttonClass()))}>`);

		if (children) {
			$$renderer.push(`<!--[0--><span class="px-[6px] font-medium capitalize">`);
			children($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></button> <div${$.attr_class(`${$.stringify(sizeDivideClass())} border-l ${$.stringify(typeDivideClass())}`)}></div> <button${$.attr('aria-label', ariaLabel)} type="button"${$.attr('disabled', disabled, true)}${$.attr_class($.clsx(menuClass()))}><span class="flex px-[6px]"><span class="h-4 w-4">`);
		ChevronDown($$renderer, {});
		$$renderer.push(`<!----></span></span></button></div>`);
	});
}