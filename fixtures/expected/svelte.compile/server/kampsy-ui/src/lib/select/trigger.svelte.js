import * as $ from 'svelte/internal/server';
import Error from "$lib/error/error.svelte";
import { getContext } from "svelte";

export default function Trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: klass = "", children } = $$props;

		// Get the state of the select from the context
		const rootState = getContext("select");

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

		const sizeObj = {
			tiny: "h-[24px] text-xs leading-3",
			small: "h-8 px-[6px] text-sm leading-4",
			medium: "h-[40px] px-[10px] text-sm leading-5",
			large: "h-[48px] px-[14px] text-base leading-6"
		};

		let sizeClass = $.derived(() => {
			return sizeObj[rootState.size];
		});

		let ringClass = $.derived(() => {
			if (rootState.getError()) {
				return `bg-kui-light-bg dark:bg-kui-dark-bg border border-kui-light-red-700 dark:border-kui-dark-red-700
			hover:border-kui-light-gray-500 dark:hover:border-kui-dark-gray-500 ring ring-kui-light-red-400
			dark:ring-kui-dark-red-400 hover:ring-0 dark:hover:ring-0`;
			}

			return `bg-kui-light-bg dark:bg-kui-dark-bg border border-kui-light-gray-200 dark:border-kui-dark-gray-400
		hover:border-kui-light-gray-500 dark:hover:border-kui-dark-gray-500`;
		});

		let cursorClass = $.derived(() => {
			return rootState.getLoading() ? "cursor-not-allowed" : "cursor-auto";
		});

		let triggerClass = $.derived(() => {
			return `${sizeClass()}  ${ringClass()} ${cursorClass()}`;
		});

		// The size of the error text
		const errorTextObj = {
			tiny: "text-[12px] leading-[16px]",
			small: "text-[13px] leading-5",
			medium: "text-[14px] leading-5",
			large: "text-[16px] leading-6"
		};

		let errorText = $.derived(() => {
			return errorTextObj[rootState.size];
		});

		$$renderer.push(`<button${$.attr('disabled', rootState.getLoading(), true)}${$.attr_class(`group transition-all ${$.stringify(triggerClass())} rounded-md ${$.stringify(klass)} `)}>`);
		children($$renderer);
		$$renderer.push(`<!----></button> `);

		if (rootState.getError()) {
			$$renderer.push(`<!--[0--><div class="mt-2"><div class="flex items-center gap-2"><div class="text-kui-light-red-900 dark:text-kui-dark-red-900 h-4 w-4">`);
			Error($$renderer, {});
			$$renderer.push(`<!----></div> <div${$.attr_class(`font-medium ${$.stringify(errorText())} text-kui-light-red-900 dark:text-kui-dark-red-900`)}>${$.escape(rootState.getError())}</div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}