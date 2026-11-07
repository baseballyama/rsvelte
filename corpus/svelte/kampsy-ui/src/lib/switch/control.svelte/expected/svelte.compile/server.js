import * as $ from 'svelte/internal/server';
import { randomString } from "$lib/utils/random.js";
import { getContext } from "svelte";

export default function Control($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			defaultChecked,
			disabled = undefined,
			label,
			icon = undefined,
			value
		} = $$props;

		const rootState = getContext("switch");
		const { name, size, fullWidth } = rootState;

		// If defaultChecked is set and value
		if (defaultChecked) {
			rootState.setSelected(value);
		}

		const onchange = (evt) => {
			const target = evt.currentTarget;

			rootState.setSelected(target.value);
		};

		// random string for unique id
		const unique = `${randomString(4)}_${value}`;

		const sizeObj = {
			small: "text-sm h-[24px] px-[12px] rounded-xs",
			medium: "text-sm h-8 px-[12px] rounded-xs",
			large: "text-base  h-[40px] px-[12px] rounded-sm"
		};

		let sizeClass = $.derived(() => {
			return sizeObj[size];
		});

		// Seting the width and height values to the label
		const iconSizeObj = {
			small: "h-[24px] px-[8px] py-[4px] rounded-xs",
			medium: "h-8 px-[12px] py-[8px] rounded-xs",
			large: "w-[40px] h-[40px] p-3 rounded-sm"
		};

		let iconSizeClass = $.derived(() => {
			return iconSizeObj[size];
		});

		// Container seting the icon width and height
		const iconCont = {
			small: "w-4 h-4",
			medium: "w-4 h-4",
			large: "w-[20px] h-[20px]"
		};

		let iconContClass = $.derived(() => {
			return iconCont[size];
		});

		// Wthen the selected value is the same as the value
		let selectedClass = $.derived(() => {
			// If the switch is disabled
			if (disabled) {
				if (rootState.getSelected() === value) {
					return `text-kui-light-gray-700 dark:text-kui-dark-gray-700 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100`;
				}

				return `text-kui-light-gray-700 dark:text-kui-dark-gray-700`;
			}

			if (rootState.getSelected() === value) {
				return `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100`;
			}

			return `text-kui-light-gray-900 dark:text-kui-dark-gray-900 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000`;
		});

		let disabledClass = $.derived(() => {
			if (disabled) {
				return `cursor-not-allowed`;
			}

			return "cursor-pointer";
		});

		let controlClass = $.derived(() => {
			if (fullWidth) {
				if (icon) {
					return `w-full ${disabledClass()} ${iconSizeClass()} ${selectedClass()}`;
				}

				return `w-full ${disabledClass()} ${sizeClass()} ${selectedClass()}`;
			}

			if (icon) {
				return `${disabledClass()} ${iconSizeClass()} ${selectedClass()}`;
			}

			return `${disabledClass()} ${sizeClass()} ${selectedClass()}`;
		});

		function withLabel($$renderer) {
			if (label && !icon) {
				$$renderer.push(`<!--[0--><div>${$.escape(label)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function withIcon($$renderer) {
			if (icon && !label) {
				$$renderer.push('<!--[0-->');

				const Icon = icon;

				$$renderer.push(`<div class="flex items-center justify-center"><div${$.attr_class($.clsx(iconContClass()))}>`);

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

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<label${$.attr('for', unique)}${$.attr_class(`${$.stringify(controlClass())} flex items-center justify-center`)}><input type="radio"${$.attr('checked', rootState.getSelected() == value, true)}${$.attr('id', unique)}${$.attr('name', name)}${$.attr('value', value)}${$.attr('disabled', disabled, true)} class="hidden"/> `);
		withLabel($$renderer);
		$$renderer.push(`<!----> `);
		withIcon($$renderer);
		$$renderer.push(`<!----></label>`);
	});
}