import * as $ from 'svelte/internal/server';
import { Tooltip } from "$lib/index.js";

export default function Tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			disabled = false,
			selected = "",
			tabs = undefined,
			type = "default"
		} = $$props;

		const isSelected = (value) => {
			if (value === selected) {
				return true;
			}

			return false;
		};

		const tabButtonFunc = (isActive, isDisabled, isDisabledSpecific) => {
			if (type === "secondary") {
				// if the tab is disabled does not matter if active or not
				if (isDisabled || isDisabledSpecific) {
					return `cursor-not-allowed px-1.5 py-1 text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 rounded-md bg-kui-light-gray-alpha-400 
            dark:bg-kui-dark-gray-alpha-400`;
				}

				if (isActive) {
					return `px-1.5 py-1 text-kui-light-bg dark:text-kui-dark-bg rounded-md bg-kui-light-gray-1000 
                dark:bg-kui-dark-gray-1000`;
				}

				return `px-1.5 py-1 text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 rounded-md bg-kui-light-gray-alpha-400 
            dark:bg-kui-dark-gray-alpha-400 hover:bg-kui-light-gray-300 dark:hover:bg-kui-dark-gray-300`;
			}

			if (type === "default") {
				if (isActive) {
					// Active but the tab is disabled
					if (isDisabled || isDisabledSpecific) {
						return `cursor-not-allowed px-[2px] py-3 border-b-2 border-kui-light-gray-1000 dark:border-kui-dark-gray-1000 
                text-kui-light-gray-900 dark:text-kui-dark-gray-900`;
					}

					return `px-[2px] py-3 border-b-2 border-kui-light-gray-1000 dark:border-kui-dark-gray-1000 
                text-kui-light-gray-1000 dark:text-kui-dark-gray-1000`;
				}

				// Not active and the tab is disabled
				if (isDisabled || isDisabledSpecific) {
					return `cursor-not-allowed px-[2px] py-3 border-b-2 border-transparent text-kui-light-gray-900 
                dark:text-kui-dark-gray-900`;
				}

				return `px-[2px] py-3 border-b-2 border-transparent text-kui-light-gray-900 dark:text-kui-dark-gray-900 
            hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000`;
			}

			return "";
		};

		let contClass = $.derived(() => {
			if (type === "secondary") {
				return "gap-3";
			}

			return "gap-6 border-b border-kui-light-gray-200 dark:border-kui-dark-gray-400";
		});

		function tabButton($$renderer, isActive, tab) {
			$$renderer.push(`<button${$.attr('disabled', disabled || tab.disabled, true)}${$.attr_class(`flex items-center justify-center gap-x-[6px] text-xs transition-all ${$.stringify(tabButtonFunc(isActive, disabled, tab.disabled))} `)}>`);

			if (tab.icon) {
				$$renderer.push('<!--[0-->');

				const Icon = tab.icon;

				$$renderer.push(`<div class="flex h-4 w-4 items-center justify-center"><div class="h-4 w-4">`);

				if (Icon) {
					$$renderer.push('<!--[-->');
					Icon($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> ${$.escape(tab.title)}</button>`);
		}

		$$renderer.push(`<div${$.attr_class(`flex w-full items-center ${$.stringify(contClass())}`)}>`);

		if (tabs) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(tabs);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let tab = each_array[$$index];

				$$renderer.push(`<div class="-mb-px">`);

				if (tab.disabled) {
					$$renderer.push('<!--[0-->');

					Tooltip($$renderer, {
						text: tab.tooltip,
						children: ($$renderer) => {
							tabButton($$renderer, isSelected(tab.value), tab);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
					tabButton($$renderer, isSelected(tab.value), tab);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { selected });
	});
}