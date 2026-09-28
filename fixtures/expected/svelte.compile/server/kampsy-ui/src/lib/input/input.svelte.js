import * as $ from 'svelte/internal/server';
import Error from "$lib/icons/error.svelte";

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const // The focus and blur state of the input
		uid = $.props_id($$renderer);

		let {
			name = undefined,
			value = "",
			label = undefined,
			error = undefined,
			size = "medium",
			contPrefix = undefined,
			prefixStyling = true,
			contSuffix = undefined,
			suffixStyling = true,
			spellcheck = false,
			placeholder = undefined,
			disabled = false,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let hasRing = false;

		const sizeObj = {
			small: "h-8 text-sm",
			medium: "h-[40px] text-sm",
			large: "h-[48px] text-base"
		};

		let sizeClass = $.derived(() => {
			return sizeObj[size];
		});

		// Show the ring when the input is focused
		let ringClass = $.derived(() => {
			if (disabled) {
				return `cursor-not-allowed border-kui-light-gray-400 dark:border-kui-dark-gray-400
			bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 text-kui-light-gray-600 dark:text-kui-dark-gray-600
			placeholder-kui-light-gray-600 dark:placeholder-kui-dark-gray-600`;
			}

			if (error) {
				return `border-kui-light-red-700 dark:border-kui-dark-red-700 hover:border-kui-light-gray-500
			dark:hover:border-kui-dark-gray-500 ring ring-kui-light-red-400 dark:ring-kui-dark-red-400
			hover:ring-0 dark:hover:ring-0 `;
			}

			if (hasRing) {
				return `border-kui-light-gray-700 dark:border-kui-dark-gray-700 ring ring-kui-light-gray-400
            dark:ring-kui-dark-gray-400 hover:border-kui-light-gray-700 dark:hover:border-kui-dark-gray-700
			placeholder:text-kui-light-gray-600 dark:placeholder:text-kui-dark-gray-600`;
			}

			return `border-kui-light-gray-400 dark:border-kui-dark-gray-400 hover:border-kui-light-gray-500
		dark:hover:border-kui-dark-gray-500`;
		});

		let inputClass = $.derived(() => {
			if (disabled) {
				return `cursor-not-allowed text-kui-light-gray-600 dark:text-kui-dark-gray-600`;
			}

			return `text-kui-light-gray-1000 dark:text-kui-dark-gray-1000`;
		});

		let inputContClass = $.derived(() => {
			if (prefixStyling && suffixStyling) {
				return `px-3`;
			}

			if (prefixStyling) {
				return "pl-3";
			}

			if (suffixStyling) {
				return "pr-3";
			}

			return ``;
		});

		// will the prefix have a bg and a border?
		let prefixClass = $.derived(() => {
			if (prefixStyling) {
				return `bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary border-r border-kui-light-gray-200
     dark:border-kui-dark-gray-400`;
			}

			return ``;
		});

		// will the prefix have a bg and a border?
		let suffixClass = $.derived(() => {
			if (suffixStyling) {
				return `bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary border-l border-kui-light-gray-200
     dark:border-kui-dark-gray-400`;
			}

			return ``;
		});

		const errorTextObj = {
			tiny: "text-[12px] leading-[16px]",
			small: "text-[13px] leading-5",
			medium: "text-[14px] leading-5",
			large: "text-[16px] leading-6"
		};

		let errorText = $.derived(() => {
			return errorTextObj[size];
		});

		function prefixSnip($$renderer) {
			if (contPrefix) {
				$$renderer.push(`<!--[0--><span${$.attr_class(`text-kui-light-gray-700 dark:text-kui-dark-gray-700 flex h-full items-center px-3 ${$.stringify(prefixClass())}`)}>`);

				if (typeof contPrefix === "string") {
					$$renderer.push(`<!--[0-->${$.escape(contPrefix)}`);
				} else if (typeof contPrefix === "function") {
					$$renderer.push('<!--[1-->');

					const PrefixIcon = contPrefix;

					$$renderer.push(`<div class="h-4 w-4">`);

					if (PrefixIcon) {
						$$renderer.push('<!--[-->');
						PrefixIcon($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function suffixSnip($$renderer) {
			if (contSuffix) {
				$$renderer.push(`<!--[0--><span${$.attr_class(`text-kui-light-gray-700 dark:text-kui-dark-gray-700 flex h-full items-center px-3 ${$.stringify(suffixClass())}`)}>`);

				if (typeof contSuffix === "string") {
					$$renderer.push(`<!--[0-->${$.escape(contSuffix)}`);
				} else if (typeof contSuffix === "function") {
					$$renderer.push('<!--[1-->');

					const SuffixIcon = contSuffix;

					$$renderer.push(`<div class="h-4 w-4">`);

					if (SuffixIcon) {
						$$renderer.push('<!--[-->');
						SuffixIcon($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(`</div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function inputSnip($$renderer) {
			$$renderer.push(`<div><div${$.attr_class(`flex items-center ${$.stringify(sizeClass())} overflow-hidden border transition-all ${$.stringify(ringClass())} bg-kui-light-bg dark:bg-kui-dark-bg rounded-md`)}>`);
			prefixSnip($$renderer);

			$$renderer.push(`<!----> <div${$.attr_class(`h-full w-full ${$.stringify(inputContClass())}`)}><input${$.attributes(
				{
					value,
					id: uid,
					name,
					spellcheck,
					placeholder,
					disabled,
					class: `${$.stringify(inputClass())} h-full w-full bg-transparent outline-hidden`,
					...rest
				},
				void 0,
				void 0,
				void 0,
				4
			)}/></div> `);

			suffixSnip($$renderer);
			$$renderer.push(`<!----></div> `);

			if (error) {
				$$renderer.push(`<!--[0--><div class="mt-2"><div class="flex items-center gap-2"><div class="text-kui-light-red-900 dark:text-kui-dark-red-900 h-4 w-4">`);
				Error($$renderer, {});
				$$renderer.push(`<!----></div> <div${$.attr_class(`${$.stringify(errorText())} text-kui-light-red-900 dark:text-kui-dark-red-900`)}>${$.escape(error)}</div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		function inputLabel($$renderer) {
			$$renderer.push(`<label${$.attr('for', uid)}><div class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-2 inline-block text-sm">${$.escape(label)}</div> `);
			inputSnip($$renderer);
			$$renderer.push(`<!----></label>`);
		}

		$$renderer.push(`<div>`);

		if (label) {
			$$renderer.push('<!--[0-->');
			inputLabel($$renderer);
		} else {
			$$renderer.push('<!--[-1-->');
			inputSnip($$renderer);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}