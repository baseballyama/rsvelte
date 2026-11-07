import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import P from "$lib/typography/paragraph/P.svelte";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { tags } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { computePosition, offset, flip, shift, autoUpdate } from "@floating-ui/dom";
import { onDestroy, untrack } from "svelte";

export default function Tags($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = [],
			placeholder = "Enter tags",
			class: className,
			classes,
			itemClass,
			spanClass,
			closeClass,
			inputClass,
			closeBtnSize = "xs",
			unique = false,
			availableTags = [],
			showHelper = false,
			showAvailableTags = false,
			allowNewTags = true,
			inputProps = {},
			disabled,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Tags", untrack(() => ({ itemClass, spanClass, closeClass, inputClass })), {
			itemClass: "tag",
			spanClass: "span",
			closeClass: "close",
			inputClass: "input"
		});

		const styling = $.derived(() => classes ?? {
			tag: itemClass,
			span: spanClass,
			close: closeClass,
			input: inputClass
		});

		const theme = $.derived(() => getTheme("tags"));

		const $$d = $.derived(tags),
			base = $.derived(() => $$d().base),
			tagCls = $.derived(() => $$d().tag),
			spanCls = $.derived(() => $$d().span),
			close = $.derived(() => $$d().close),
			inputCls = $.derived(() => $$d().input),
			info = $.derived(() => $$d().info),
			warning = $.derived(() => $$d().warning),
			error = $.derived(() => $$d().error);

		let contents = "";
		let errorMessage = "";
		let inputElement;
		let inputContainer;

		// svelte-ignore non_reactive_update
		let dropdownElement = null;

		let cleanupFloating;

		function updateDropdownPosition() {
			if (!inputContainer || !dropdownElement) return;

			cleanupFloating?.();

			cleanupFloating = autoUpdate(inputContainer, dropdownElement, async () => {
				const { x, y } = await computePosition(inputContainer, dropdownElement, {
					placement: "bottom-start",
					middleware: [offset(4), flip(), shift()]
				});

				Object.assign(dropdownElement.style, { position: "absolute", left: `${x}px`, top: `${y}px` });
			});
		}

		const handleKeys = (event) => {
			if (event.key === "Enter") {
				event.preventDefault();

				const newTag = contents.trim();

				if (newTag.length === 0) return;

				// Add validation: if allowNewTags is false and availableTags is empty, show error
				if (!allowNewTags && availableTags.length === 0) {
					errorMessage = "No available tags provided. Please add available tags or enable allowNewTags.";

					return;
				}

				const isInAvailable = availableTags.length === 0 || availableTags.some((tag) => tag.toLowerCase() === newTag.toLowerCase());
				const alreadyExists = value.some((tag) => tag.toLowerCase() === newTag.toLowerCase());

				if (!allowNewTags && !isInAvailable) {
					errorMessage = `"${newTag}" is not in the available tags.`;

					return;
				}

				if (unique && alreadyExists) {
					errorMessage = `"${newTag}" is already added.`;

					return;
				}

				value = [...value, newTag];
				contents = "";

				if (inputElement) {
					inputElement.value = "";
				}

				errorMessage = "";
			}

			if (event.key === "Backspace" && contents.length === 0) {
				event.preventDefault();

				const lastTag = value[value.length - 1] ?? "";

				value = value.slice(0, -1);
				contents = lastTag;

				if (inputElement) {
					inputElement.value = lastTag;
				}

				errorMessage = "";
			}
		};

		const deleteField = (index) => {
			value = value.filter((_, i) => i !== index);
			errorMessage = "";
		};

		onDestroy(() => {
			cleanupFloating?.();
		});

		if (showAvailableTags && availableTags.length > 0) {
			$$renderer.push('<!--[0-->');

			P($$renderer, {
				class: clsx(info()(), classes?.info),
				children: ($$renderer) => {
					$$renderer.push(`<!---->Available tags: ${$.escape(availableTags.join(", "))}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (showHelper && contents.trim().length > 0) {
			$$renderer.push('<!--[0-->');

			if (unique && value.some((tag) => tag.toLowerCase() === contents.trim().toLowerCase())) {
				$$renderer.push('<!--[0-->');

				P($$renderer, {
					class: clsx(warning()(), classes?.warning),
					children: ($$renderer) => {
						$$renderer.push(`<!---->"${$.escape(contents.trim())}" is already added.`);
					},
					$$slots: { default: true }
				});
			} else if (availableTags.length > 0 && !allowNewTags && !availableTags.some((tag) => tag.toLowerCase() === contents.trim().toLowerCase())) {
				$$renderer.push('<!--[1-->');

				P($$renderer, {
					class: clsx(error()(), classes?.error),
					children: ($$renderer) => {
						$$renderer.push(`<!---->"${$.escape(contents.trim())}" is not in the available tags.`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (errorMessage) {
			$$renderer.push('<!--[0-->');

			P($$renderer, {
				class: clsx(error()(), classes?.error),
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(errorMessage)}`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}><!--[-->`);

		const each_array = $.ensure_array_like(value);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let tag = each_array[index];

			$$renderer.push(`<div${$.attr_class($.clsx(tagCls()({ class: clsx(theme()?.tag, styling().tag) })))}><span${$.attr_class($.clsx(spanCls()({ class: clsx(theme()?.span, styling().span) })))}>${$.escape(tag)}</span> `);

			CloseButton($$renderer, {
				disabled,
				size: closeBtnSize,
				class: close()({ class: clsx(theme()?.close, styling().close) }),
				onclick: () => deleteField(index)
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--> <div class="relative min-w-[8rem] flex-1 self-center"><input${$.attributes(
			{
				...inputProps,
				disabled,
				value: contents,
				placeholder: value.length === 0 ? placeholder : "",
				type: 'text',
				autocomplete: 'off',
				class: $.clsx(inputCls()({ class: clsx(styling().input) }))
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> `);

		if (availableTags.length > 0 && contents.trim() !== "") {
			$$renderer.push('<!--[0-->');

			const filteredSuggestions = availableTags.filter((tag) => tag.toLowerCase().includes(contents.trim().toLowerCase()) && (!unique || !value.some((t) => t.toLowerCase() === tag.toLowerCase())));

			if (filteredSuggestions.length > 0) {
				$$renderer.push(`<!--[0--><ul class="z-10 max-h-48 w-full overflow-auto rounded border border-gray-300 bg-white shadow" style="position: absolute;"><!--[-->`);

				const each_array_1 = $.ensure_array_like(filteredSuggestions);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let suggestion = each_array_1[$$index_1];

					$$renderer.push(`<li><button type="button" class="block w-full cursor-pointer px-3 py-2 text-left hover:bg-gray-100">${$.escape(suggestion)}</button></li>`);
				}

				$$renderer.push(`<!--]--></ul>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);
		$.bind_props($$props, { value });
	});
}