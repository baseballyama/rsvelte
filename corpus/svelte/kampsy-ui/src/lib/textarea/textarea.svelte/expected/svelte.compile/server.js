import * as $ from 'svelte/internal/server';
import Error from "$lib/icons/error.svelte";
import { randomString } from "$lib/utils/random.js";

export default function Textarea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// oxlint-disable-next-line svelte/no-unused-props -- false positive: quoted renamed prop is used in the template
		let {
			"aria-labelledby": araiLabelledBy = undefined,
			id = undefined,
			name = undefined,
			value = "",
			label = undefined,
			defaultValue = "",
			error = undefined,
			size = "medium",
			placeholder = undefined,
			disabled = false
		} = $$props;

		// The focus and blur state of the input
		let hasRing = false;

		// The name is used on the label and input name
		let inputID = $.derived(() => {
			if (id) {
				return id;
			}

			return randomString(8);
		});

		// Assign defaultValue if it is not ''
		if (defaultValue !== "") {
			value = defaultValue;
		}

		const textObj = {
			tiny: "text-[12px] leading-[16px]",
			small: "text-[13px] leading-5",
			medium: "text-[14px] leading-5",
			large: "text-[16px] leading-6"
		};

		let text = $.derived(() => {
			return textObj[size];
		});

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
			text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 placeholder-kui-light-gray-600 dark:placeholder-kui-dark-gray-600`;
			}

			return `border-kui-light-gray-400 dark:border-kui-dark-gray-400 hover:border-kui-light-gray-500
		dark:hover:border-kui-dark-gray-500 text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 placeholder-kui-light-gray-600
		dark:placeholder-kui-dark-gray-600`;
		});

		let textareaClass = $.derived(() => {
			return `${text()}  ${ringClass()}`;
		});

		function textAreaSnip($$renderer) {
			$$renderer.push(`<div class="w-full"><textarea${$.attr('id', inputID())}${$.attr('name', name)}${$.attr('aria-labelledby', araiLabelledBy)} autocapitalize="off" autocomplete="off" rows="4"${$.attr_class(` border transition-all ${$.stringify(textareaClass())} bg-kui-light-bg dark:bg-kui-dark-bg block w-full rounded-md px-[12px] py-[10px] outline-hidden`)}${$.attr('placeholder', placeholder)}${$.attr('disabled', disabled, true)}>`);

			const $$body = $.escape(value);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea> `);

			if (error) {
				$$renderer.push(`<!--[0--><div class="mt-2"><div class="flex items-center gap-2"><div class="text-kui-light-red-900 dark:text-kui-dark-red-900 h-4 w-4">`);
				Error($$renderer, {});
				$$renderer.push(`<!----></div> <div${$.attr_class(`font-medium ${$.stringify(text())} text-kui-light-red-900 dark:text-kui-dark-red-900`)}>${$.escape(error)}</div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		function textAreaLabel($$renderer) {
			$$renderer.push(`<label${$.attr('for', inputID())}><div class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-2 inline-block text-sm">${$.escape(label)}</div> `);
			textAreaSnip($$renderer);
			$$renderer.push(`<!----></label>`);
		}

		if (label) {
			$$renderer.push('<!--[0-->');
			textAreaLabel($$renderer);
		} else {
			$$renderer.push('<!--[-1-->');
			textAreaSnip($$renderer);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { value });
	});
}