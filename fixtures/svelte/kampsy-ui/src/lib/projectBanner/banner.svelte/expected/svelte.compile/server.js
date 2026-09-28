import * as $ from 'svelte/internal/server';

export default function Banner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			icon = undefined,
			callToAction = undefined,
			label = undefined,
			variant = "gray"
		} = $$props;

		const variantAsideObj = {
			gray: `text-kui-light-gray-900 dark:text-kui-dark-gray-900 bg-kui-light-gray-100
		dark:bg-kui-dark-gray-100 border-kui-light-gray-400 dark:border-kui-dark-gray-400`,

			warning: `text-kui-light-amber-900 dark:text-kui-dark-amber-900 bg-kui-light-amber-100
		dark:bg-kui-dark-amber-100 border-kui-light-amber-400 dark:border-kui-dark-amber-400`,

			error: `text-kui-light-red-900 dark:text-kui-dark-red-900 bg-kui-light-red-100
		dark:bg-kui-dark-red-100 border-kui-light-red-400 dark:border-kui-dark-red-400`,

			success: `text-kui-light-blue-900 dark:text-kui-dark-blue-900 bg-kui-light-blue-100
		dark:bg-kui-dark-blue-100 border-kui-light-blue-400 dark:border-kui-dark-blue-400`
		};

		const variantCallToActionObj = {
			gray: `hover:text-kui-light-gray-900 dark:hover:text-kui-dark-gray-900
		hover:decoration-kui-light-gray-500 dark:hover:decoration-kui-dark-gray-500
		decoration-kui-light-gray-500 dark:decoration-kui-dark-gray-500 text-kui-light-gray-1000
		dark:text-kui-dark-gray-1000`,

			warning: `hover:text-kui-light-amber-900 dark:hover:text-kui-dark-amber-900
		hover:decoration-kui-light-amber-500 dark:hover:decoration-kui-dark-amber-500
		decoration-kui-light-amber-400 dark:decoration-kui-dark-amber-400 text-kui-light-amber-1000
		dark:text-kui-dark-amber-1000`,

			error: `hover:text-kui-light-red-900 dark:hover:text-kui-dark-red-900
		hover:decoration-kui-light-red-500 dark:hover:decoration-kui-dark-red-500
		decoration-kui-light-red-400 dark:decoration-kui-dark-red-400 text-kui-light-red-1000
		dark:text-kui-dark-red-1000`,

			success: `hover:text-kui-light-blue-900 dark:hover:text-kui-dark-blue-900
		hover:decoration-kui-light-blue-500 dark:hover:decoration-kui-dark-blue-500
		decoration-kui-light-blue-400 dark:decoration-kui-dark-blue-400 text-kui-light-blue-1000
		dark:text-kui-dark-blue-1000`
		};

		const variantLabelObj = {
			gray: `text-kui-light-gray-900 dark:text-kui-dark-gray-900`,
			warning: `text-kui-light-amber-900 dark:text-kui-dark-amber-900`,
			error: `text-kui-light-red-900 dark:text-kui-dark-red-900`,
			success: `text-kui-light-blue-900 dark:text-kui-dark-blue-900`
		};

		let asideClass = $.derived(() => {
			return `${variantAsideObj[variant]}`;
		});

		let callToActionClass = $.derived(() => {
			return `${variantCallToActionObj[variant]}`;
		});

		let labelClass = $.derived(() => {
			return `${variantLabelObj[variant]}`;
		});

		function labelSnip($$renderer) {
			if (label) {
				$$renderer.push('<!--[0-->');

				if (typeof label === "string") {
					$$renderer.push(`<!--[0--><p${$.attr_class(`text-sm ${$.stringify(labelClass())}`)}>${$.escape(label)}</p>`);
				} else if (typeof label === "function") {
					$$renderer.push(`<!--[1--><p${$.attr_class(`text-sm ${$.stringify(labelClass())}`)}>`);
					label?.($$renderer);
					$$renderer.push(`<!----></p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function callToActionSnip($$renderer) {
			if (callToAction) {
				$$renderer.push('<!--[0-->');

				if (callToAction.href) {
					$$renderer.push(`<!--[0--><div class="ml-6 md:ml-0"><a${$.attr('href', callToAction.href)}${$.attr_class(`-my-px h-6 cursor-pointer rounded-xs border-none bg-transparent px-0 py-1 font-medium capitalize underline underline-offset-[5px] outline-hidden ${$.stringify(callToActionClass())}`)}>${$.escape(callToAction.label)}</a></div>`);
				} else if (callToAction.onClick) {
					$$renderer.push(`<!--[1--><div class="ml-6 md:ml-0"><button${$.attr_class(`-my-px h-6 cursor-pointer rounded-xs border-none bg-transparent px-0 py-1 font-medium capitalize underline underline-offset-[5px] outline-hidden ${$.stringify(callToActionClass())}`)}>${$.escape(callToAction.label)}</button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<div class="w-full"><aside${$.attr_class(`z-30 flex min-h-[40px] w-full -translate-y-px items-center justify-center gap-x-2 border-t border-b py-2 text-[14px] leading-5 ${$.stringify(asideClass())} `)}><div class="flex w-full flex-col gap-2 px-6 md:flex-row md:items-center md:justify-center"><div class="flex items-center gap-2">`);

		if (icon) {
			$$renderer.push('<!--[0-->');

			const Icon = icon;

			$$renderer.push(`<div class="shrink-0"><div class="h-4 w-4"><div class="h-4 w-4">`);

			if (Icon) {
				$$renderer.push('<!--[-->');
				Icon($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		labelSnip($$renderer);
		$$renderer.push(`<!----></div> `);
		callToActionSnip($$renderer);
		$$renderer.push(`<!----></div></aside></div>`);
	});
}