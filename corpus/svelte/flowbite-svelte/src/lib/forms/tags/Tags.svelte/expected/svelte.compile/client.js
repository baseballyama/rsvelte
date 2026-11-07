import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import P from "$lib/typography/paragraph/P.svelte";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { tags } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { computePosition, offset, flip, shift, autoUpdate } from "@floating-ui/dom";
import { onDestroy, untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'value',
	'placeholder',
	'class',
	'classes',
	'itemClass',
	'spanClass',
	'closeClass',
	'inputClass',
	'closeBtnSize',
	'unique',
	'availableTags',
	'showHelper',
	'showAvailableTags',
	'allowNewTags',
	'inputProps',
	'disabled'
]);

var root = $.from_html(`<div><span> </span> <!></div>`);
var root_1 = $.from_html(`<li><button type="button" class="block w-full cursor-pointer px-3 py-2 text-left hover:bg-gray-100"> </button></li>`);
var root_2 = $.from_html(`<ul class="z-10 max-h-48 w-full overflow-auto rounded border border-gray-300 bg-white shadow" style="position: absolute;"></ul>`);
var root_3 = $.from_html(`<!> <!> <!> <div><!> <div class="relative min-w-[8rem] flex-1 self-center"><input/> <!></div></div>`, 1);

export default function Tags($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 31, () => $.proxy([])),
		placeholder = $.prop($$props, 'placeholder', 3, "Enter tags"),
		closeBtnSize = $.prop($$props, 'closeBtnSize', 3, "xs"),
		unique = $.prop($$props, 'unique', 3, false),
		availableTags = $.prop($$props, 'availableTags', 19, () => []),
		showHelper = $.prop($$props, 'showHelper', 3, false),
		showAvailableTags = $.prop($$props, 'showAvailableTags', 3, false),
		allowNewTags = $.prop($$props, 'allowNewTags', 3, true),
		inputProps = $.prop($$props, 'inputProps', 19, () => ({})),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Tags",
		untrack(() => ({
			itemClass: $$props.itemClass,
			spanClass: $$props.spanClass,
			closeClass: $$props.closeClass,
			inputClass: $$props.inputClass
		})),
		{
			itemClass: "tag",
			spanClass: "span",
			closeClass: "close",
			inputClass: "input"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		tag: $$props.itemClass,
		span: $$props.spanClass,
		close: $$props.closeClass,
		input: $$props.inputClass
	});

	const theme = $.derived(() => getTheme("tags"));

	const $$d = $.derived(tags),
		base = $.derived(() => $.get($$d).base),
		tagCls = $.derived(() => $.get($$d).tag),
		spanCls = $.derived(() => $.get($$d).span),
		close = $.derived(() => $.get($$d).close),
		inputCls = $.derived(() => $.get($$d).input),
		info = $.derived(() => $.get($$d).info),
		warning = $.derived(() => $.get($$d).warning),
		error = $.derived(() => $.get($$d).error);

	let contents = $.state("");
	let errorMessage = $.state("");
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

			const newTag = $.get(contents).trim();

			if (newTag.length === 0) return;

			// Add validation: if allowNewTags is false and availableTags is empty, show error
			if (!allowNewTags() && availableTags().length === 0) {
				$.set(errorMessage, "No available tags provided. Please add available tags or enable allowNewTags.");

				return;
			}

			const isInAvailable = availableTags().length === 0 || availableTags().some((tag) => tag.toLowerCase() === newTag.toLowerCase());
			const alreadyExists = value().some((tag) => tag.toLowerCase() === newTag.toLowerCase());

			if (!allowNewTags() && !isInAvailable) {
				$.set(errorMessage, `"${newTag}" is not in the available tags.`);

				return;
			}

			if (unique() && alreadyExists) {
				$.set(errorMessage, `"${newTag}" is already added.`);

				return;
			}

			value([...value(), newTag]);
			$.set(contents, "");

			if (inputElement) {
				inputElement.value = "";
			}

			$.set(errorMessage, "");
		}

		if (event.key === "Backspace" && $.get(contents).length === 0) {
			event.preventDefault();

			const lastTag = value()[value().length - 1] ?? "";

			value(value().slice(0, -1));
			$.set(contents, lastTag, true);

			if (inputElement) {
				inputElement.value = lastTag;
			}

			$.set(errorMessage, "");
		}
	};

	const deleteField = (index) => {
		value(value().filter((_, i) => i !== index));
		$.set(errorMessage, "");
	};

	$.user_effect(() => {
		const trimmed = $.get(contents).trim();
		const shouldShow = availableTags().length > 0 && trimmed !== "" && inputContainer && dropdownElement;

		if (!shouldShow) {
			cleanupFloating?.();

			return;
		}

		const filtered = availableTags().filter((tag) => tag.toLowerCase().includes(trimmed.toLowerCase()) && (!unique() || !value().some((t) => t.toLowerCase() === tag.toLowerCase())));

		if (filtered.length > 0) {
			updateDropdownPosition();
		} else {
			cleanupFloating?.();
		}
	});

	onDestroy(() => {
		cleanupFloating?.();
	});

	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => clsx($.get(info)(), $$props.classes?.info));

				P($$anchor, {
					get class() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(($0) => $.set_text(text, `Available tags: ${$0 ?? ''}`), [() => availableTags().join(", ")]);
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			}
		};

		$.if(node, ($$render) => {
			if (showAvailableTags() && availableTags().length > 0) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_2 = $.first_child(fragment_3);

			{
				var consequent_1 = ($$anchor) => {
					{
						let $0 = $.derived(() => clsx($.get(warning)(), $$props.classes?.warning));

						P($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(($0) => $.set_text(text_1, `"${$0 ?? ''}" is already added.`), [() => $.get(contents).trim()]);
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					}
				};

				var d = $.derived(() => unique() && value().some((tag) => tag.toLowerCase() === $.get(contents).trim().toLowerCase()));

				var consequent_2 = ($$anchor) => {
					{
						let $0 = $.derived(() => clsx($.get(error)(), $$props.classes?.error));

						P($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text();

								$.template_effect(($0) => $.set_text(text_2, `"${$0 ?? ''}" is not in the available tags.`), [() => $.get(contents).trim()]);
								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});
					}
				};

				var d_1 = $.derived(() => availableTags().length > 0 && !allowNewTags() && !availableTags().some((tag) => tag.toLowerCase() === $.get(contents).trim().toLowerCase()));

				$.if(node_2, ($$render) => {
					if ($.get(d)) $$render(consequent_1); else if ($.get(d_1)) $$render(consequent_2, 1);
				});
			}

			$.append($$anchor, fragment_3);
		};

		var d_2 = $.derived(() => showHelper() && $.get(contents).trim().length > 0);

		$.if(node_1, ($$render) => {
			if ($.get(d_2)) $$render(consequent_3);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			{
				let $0 = $.derived(() => clsx($.get(error)(), $$props.classes?.error));

				P($$anchor, {
					get class() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text();

						$.template_effect(() => $.set_text(text_3, $.get(errorMessage)));
						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});
			}
		};

		$.if(node_3, ($$render) => {
			if ($.get(errorMessage)) $$render(consequent_4);
		});
	}

	var div = $.sibling(node_3, 2);

	$.attribute_effect(div, ($0) => ({ ...restProps, class: $0 }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var node_4 = $.child(div);

	$.each(node_4, 17, value, $.index, ($$anchor, tag, index) => {
		var div_1 = root();
		var span = $.child(div_1);
		var text_4 = $.only_child(span, true);
		var node_5 = $.sibling(span, 2);

		{
			let $0 = $.derived(() => $.get(close)({ class: clsx($.get(theme)?.close, $.get(styling).close) }));

			CloseButton(node_5, {
				get disabled() {
					return $$props.disabled;
				},

				get size() {
					return closeBtnSize();
				},

				get class() {
					return $.get($0);
				},
				onclick: () => deleteField(index)
			});
		}

		$.reset(div_1);

		$.template_effect(
			($0, $1) => {
				$.set_class(div_1, 1, $0);
				$.set_class(span, 1, $1);
				$.set_text(text_4, $.get(tag));
			},
			[
				() => $.clsx($.get(tagCls)({ class: clsx($.get(theme)?.tag, $.get(styling).tag) })),
				() => $.clsx($.get(spanCls)({ class: clsx($.get(theme)?.span, $.get(styling).span) }))
			]
		);

		$.append($$anchor, div_1);
	});

	var div_2 = $.sibling(node_4, 2);
	var input = $.child(div_2);

	$.attribute_effect(
		input,
		($0) => ({
			...inputProps(),
			disabled: $$props.disabled,
			onkeydown: handleKeys,
			placeholder: value().length === 0 ? placeholder() : "",
			type: 'text',
			autocomplete: 'off',
			class: $0
		}),
		[() => $.get(inputCls)({ class: clsx($.get(styling).input) })],
		void 0,
		void 0,
		void 0,
		true
	);

	$.bind_this(input, ($$value) => inputElement = $$value, () => inputElement);

	var node_6 = $.sibling(input, 2);

	{
		var consequent_6 = ($$anchor) => {
			const filteredSuggestions = $.derived(() => availableTags().filter((tag) => tag.toLowerCase().includes($.get(contents).trim().toLowerCase()) && (!unique() || !value().some((t) => t.toLowerCase() === tag.toLowerCase()))));
			var fragment_10 = $.comment();
			var node_7 = $.first_child(fragment_10);

			{
				var consequent_5 = ($$anchor) => {
					var ul = root_2();

					$.each(ul, 20, () => $.get(filteredSuggestions), (suggestion) => suggestion, ($$anchor, suggestion) => {
						var li = root_1();
						var button = $.child(li);
						var text_5 = $.only_child(button, true);

						$.reset(li);
						$.template_effect(() => $.set_text(text_5, suggestion));

						$.delegated('click', button, () => {
							value([...value(), suggestion]);
							$.set(contents, "");

							if (inputElement) {
								inputElement.value = "";
							}
						});

						$.append($$anchor, li);
					});

					$.reset(ul);
					$.bind_this(ul, ($$value) => dropdownElement = $$value, () => dropdownElement);
					$.append($$anchor, ul);
				};

				$.if(node_7, ($$render) => {
					if ($.get(filteredSuggestions).length > 0) $$render(consequent_5);
				});
			}

			$.append($$anchor, fragment_10);
		};

		var d_3 = $.derived(() => availableTags().length > 0 && $.get(contents).trim() !== "");

		$.if(node_6, ($$render) => {
			if ($.get(d_3)) $$render(consequent_6);
		});
	}

	$.reset(div_2);
	$.bind_this(div_2, ($$value) => inputContainer = $$value, () => inputContainer);
	$.reset(div);
	$.bind_value(input, () => $.get(contents), ($$value) => $.set(contents, $$value));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);