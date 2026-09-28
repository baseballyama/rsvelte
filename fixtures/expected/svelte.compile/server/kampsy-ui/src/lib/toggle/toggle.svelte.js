import * as $ from 'svelte/internal/server';
import { randomString } from "$lib/utils/random.js";

export default function Toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			"aria-label": ariaLabel,
			size = "small",
			color = "blue",
			checked = false,
			disabled = undefined,
			direction = "switch-last",
			icon = undefined,
			children = undefined
		} = $$props;

		const onchange = () => {
			checked = !checked;
		};

		// random string for unique id
		const unique = `${randomString(4)}`;

		const sizeContObj = { small: "w-7.5 h-4", large: "w-12.5 h-6.5" };

		let sizeContClass = $.derived(() => {
			return sizeContObj[size];
		});

		const sizeThumbObj = { small: "w-3 h-3", large: "w-[22px] h-[22px]" };

		let sizeThumbClass = $.derived(() => {
			return sizeThumbObj[size];
		});

		const iconSizeObj = { small: "w-2.5 h-2.5", large: "w-4 h-4" };

		let iconSizeClass = $.derived(() => {
			return iconSizeObj[size];
		});

		let childLableClass = $.derived(() => {
			if (direction === "switch-first") {
				return `order-last`;
			}

			return ``;
		});

		const colorObj = {
			blue: "bg-kui-light-blue-700 dark:bg-kui-dark-blue-700 border-kui-light-blue-800 dark:border-kui-dark-blue-800",
			purple: "bg-kui-light-purple-700 dark:bg-kui-dark-purple-700 border-kui-light-purple-800 dark:border-kui-dark-purple-800",
			amber: "bg-kui-light-amber-700 dark:bg-kui-dark-amber-700 border-kui-light-amber-800 dark:border-kui-dark-amber-800",
			red: "bg-kui-light-red-700 dark:bg-kui-dark-red-700 border-kui-light-red-800 dark:border-kui-dark-red-800",
			pink: "bg-kui-light-pink-700  dark:bg-kui-dark-pink-700 border-kui-light-pink-800 dark:border-kui-dark-pink-800",
			green: "bg-kui-light-green-700 dark:bg-kui-dark-green-700 border-kui-light-green-800 dark:border-kui-dark-green-800",
			teal: "bg-kui-light-teal-700 dark:bg-kui-dark-teal-700 border-kui-light-teal-800 dark:border-kui-dark-teal-800"
		};

		let toogleContClass = $.derived(() => {
			if (checked) {
				return `${colorObj[color]}`;
			}

			return `bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 border-black/8
		 dark:border-kui-dark-gray-400`;
		});

		let thumbClass = $.derived(() => {
			if (checked) {
				return `bg-white border-white dark:text-kui-light-gray-1000 dark:text-kui-dark-gray-1000
			translate-x-full`;
			}

			return `bg-kui-light-bg-secondary border-kui-light-gray-200 dark:bg-white dark:text-kui-light-gray-1000`;
		});

		function icons($$renderer) {
			if (icon) {
				$$renderer.push(`<!--[0--><div class="relative flex h-full w-full items-center justify-center rounded-full">`);

				if (checked) {
					$$renderer.push('<!--[0-->');

					const CheckedIcon = icon.checked;

					$$renderer.push(`<div${$.attr_class(`absolute ${$.stringify(iconSizeClass())}`)}>`);

					if (CheckedIcon) {
						$$renderer.push('<!--[-->');
						CheckedIcon($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				} else {
					$$renderer.push('<!--[-1-->');

					const UncheckedIcon = icon.unchecked;

					$$renderer.push(`<div${$.attr_class(`absolute ${$.stringify(iconSizeClass())}`)}>`);

					if (UncheckedIcon) {
						$$renderer.push('<!--[-->');
						UncheckedIcon($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<label${$.attr('for', unique)} class="inline-flex cursor-pointer items-center gap-3">`);

		if (children) {
			$$renderer.push(`<!--[0--><span${$.attr_class(`${$.stringify(childLableClass())} text-kui-light-gray-800 dark:text-kui-dark-gray-900 text-xs select-none`)}>`);
			children($$renderer);
			$$renderer.push(`<!----></span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <input${$.attr('checked', checked, true)}${$.attr('aria-label', ariaLabel)} type="checkbox"${$.attr('id', unique)}${$.attr('disabled', disabled, true)} class="hidden"/> <div><div${$.attr_class(`relative ${$.stringify(sizeContClass())} flex items-center rounded-full border ${$.stringify(toogleContClass())}`)}><div${$.attr_class(`absolute ${$.stringify(sizeThumbClass())} inset-s-0.5 rounded-full border transition-all ${$.stringify(thumbClass())}`)}>`);
		icons($$renderer);
		$$renderer.push(`<!----></div></div></div></label>`);
		$.bind_props($$props, { checked });
	});
}