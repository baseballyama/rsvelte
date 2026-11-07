import * as $ from 'svelte/internal/server';
import { ChevronRight } from "$lib/icons/index.js";
import { getContext } from "svelte";

export default function Trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...rest } = $$props;
		let collapseItem = getContext("collapse");
		let { size, value, defaultExpanded } = getContext("collapseItem");

		if (defaultExpanded) {
			collapseItem.setItem(value);
		}

		let rotate = $.derived(() => {
			if (collapseItem.getItem().includes(value)) {
				return "rotate-90";
			}

			return "";
		});

		// accessibility if its true then set aria-expanded to true else false
		let button = void 0;

		const paddingObj = { small: `py-[12px]`, large: `py-4 lg:py-6` };

		let paddingClass = $.derived(() => {
			return paddingObj[size];
		});

		const textObj = { small: "text-4", large: "text-lg lg:text-[24px]" };

		let textClass = $.derived(() => {
			return textObj[size];
		});

		const onclick = () => {
			const items = collapseItem.getItem();
			const multiple = collapseItem.getMultiple();

			if (!value) return;

			if (multiple) {
				if (items.includes(value)) {
					collapseItem.deleteItem(value);
				} else {
					collapseItem.setItem(value);
				}

				return;
			}

			// single-select behaviour: toggle off if selected, otherwise clear and select the value
			if (items.includes(value)) {
				collapseItem.clearItems();
			} else {
				collapseItem.clearItems();
				collapseItem.setItem(value);
			}
		};

		$$renderer.push(`<button${$.attributes({
			class: `flex w-full items-center justify-between bg-transparent text-left ${$.stringify(paddingClass())}`,
			...rest
		})}>`);

		if (children) {
			$$renderer.push(`<!--[0--><span${$.attr_class(`${$.stringify(textClass())} text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 font-semibold`)}>`);
			children($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div><div class="h-4 w-4 overflow-hidden"><div${$.attr_class(`h-4 w-4 ${$.stringify(rotate())} text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 transform-gpu duration-200`)}>`);
		ChevronRight($$renderer, {});
		$$renderer.push(`<!----></div></div></div></button>`);
	});
}