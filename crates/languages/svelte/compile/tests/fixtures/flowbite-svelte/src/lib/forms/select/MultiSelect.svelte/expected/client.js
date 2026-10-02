import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import clsx from "clsx";
import Badge from "$lib/badge/Badge.svelte";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { multiSelect } from "./theme";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { onMount, untrack } from "svelte";
import { createDismissableContext } from "$lib/utils/dismissable";
import { getButtonGroupContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'items',
	'value',
	'size',
	'dropdownClass',
	'placeholder',
	'disabled',
	'onchange',
	'onblur',
	'class',
	'classes',
	'id',
	'name',
	'form',
	'required',
	'autocomplete'
]);

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<div role="presentation"> </div>`);
var root_3 = $.from_html(`<div role="presentation"></div>`);
var root_4 = $.from_html(`<div><select hidden="" multiple=""></select> <!> <span><!></span> <div class="ms-auto flex items-center gap-2"><!> <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg></div> <!></div>`);

export default function MultiSelect($$anchor, $$props) {
	$.push($$props, true);

	// Consider reusing that component - https://svelecte.vercel.app/
	let items = $.prop($$props, 'items', 19, () => []),
		value = $.prop($$props, 'value', 15),
		size = $.prop($$props, 'size', 3, "md"),
		dropdownClass = $.prop($$props, 'dropdownClass', 3, ""),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		// Extract select-specific props
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation("MultiSelect", untrack(() => ({ dropdownClass: dropdownClass() })), { dropdownClass: "dropdown" });

	const styling = $.derived(() => $$props.classes ?? { dropdown: dropdownClass() });
	const theme = $.derived(() => getTheme("multiSelect"));
	let selectItems = $.derived(() => items().filter((x) => value().includes(x.value)));
	let show = $.state(false);
	const group = getButtonGroupContext();

	// Active item
	let activeIndex = $.state(null);

	let activeItem = $.derived(() => $.get(activeIndex) !== null
		? items()[($.get(activeIndex) % items().length + items().length) % items().length]
		: null);

	let multiSelectContainer; // Reference to the main div

	const selectOption = (select, event) => {
		// Prevent the click from propagating to the parent div
		event.stopPropagation();

		if (disabled()) return;
		if (select.disabled) return;

		const oldValue = [...value()];

		if (value().includes(select.value)) {
			clearThisOption(select);
		} else if (!value().includes(select.value)) {
			value([...value(), select.value]);
		}

		// Trigger onchange if value actually changed
		if (JSON.stringify(oldValue) !== JSON.stringify(value())) {
			triggerChange();
		}
	};

	const clearAll = (e) => {
		if (disabled()) return;

		e.stopPropagation();

		const oldValue = [...value()];

		value([]);

		if (oldValue.length > 0) {
			triggerChange();
		}
	};

	createDismissableContext(clearAll);

	const clearThisOption = (select) => {
		if (disabled()) return;

		if (value().includes(select.value)) {
			const oldValue = [...value()];

			value(value().filter((o) => o !== select.value));

			if (oldValue.length !== value().length) {
				triggerChange();
			}
		}
	};

	// Helper function to trigger change events
	const triggerChange = () => {
		if ($$props.onchange) {
			// Create a proper change event for the hidden select element
			const changeEvent = new Event("change", { bubbles: true });

			Object.defineProperty(changeEvent, "target", { value: { value: value() }, enumerable: true });
			Object.defineProperty(changeEvent, "currentTarget", { value: { value: value() }, enumerable: true });
			$$props.onchange(changeEvent);
		}
	};

	const closeDropdown = () => !disabled() && $.set(show, false);

	const toggleDropdown = (event) => {
		if (disabled()) return;

		// Prevent immediate closing if the click originated from within the component itself
		// This is useful if the click triggers a re-render and focus is lost momentarily.
		if (multiSelectContainer && multiSelectContainer.contains(event.target)) {
			$.set(show, !$.get(show));
			event.preventDefault();
		} else {
			$.set(show, false // Close if clicked outside
			);
		}
	};

	// Handle blur event for validation
	const handleBlur = (event) => {
		// We'll rely more on the global click listener for closing, but keep this for standard blur behavior
		if (event.currentTarget && event.currentTarget.contains && !event.currentTarget.contains(event.relatedTarget)) {
			closeDropdown();
		}

		if ($$props.onblur) {
			$$props.onblur(event);
		}
	};

	// Keyboard navigation
	function handleToggleActiveItem() {
		if (disabled()) return;

		if (!$.get(show)) {
			$.set(show, true);
			$.set(activeIndex, 0);
		} else {
			if ($.get(activeItem // Pass a dummy MouseEvent
			) !== null) selectOption($.get(activeItem), new MouseEvent("click"));
		}
	}

	function handleArrowUpDown(offset) {
		if (disabled()) return;

		if (!$.get(show)) {
			$.set(show, true);
			$.set(activeIndex, 0);
		} else {
			if ($.get(activeIndex) !== null) {
				$.set(activeIndex, $.get(activeIndex) + offset);
			} else {
				$.set(activeIndex, 0);
			}
		}
	}

	function handleKeyDown(event) {
		if (disabled()) return;

		// Do not prevent default for tab key, allow it to move focus
		if (event.key !== "Tab") {
			event.preventDefault();
		}

		event.stopPropagation();

		const actions = {
			Escape: closeDropdown,
			Enter: handleToggleActiveItem,
			" ": handleToggleActiveItem,
			ArrowDown: () => handleArrowUpDown(1),
			ArrowUp: () => handleArrowUpDown(-1)
		};

		if (event.key in actions) {
			actions[event.key]?.();
		}
	}

	// Global click listener for closing the dropdown when clicking outside
	onMount(() => {
		const handleClickOutside = (event) => {
			if (multiSelectContainer && !multiSelectContainer.contains(event.target)) {
				closeDropdown();
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	});

	const $$d = $.derived(() => multiSelect({ disabled: disabled(), grouped: !!group })),
		base = $.derived(() => $.get($$d).base),
		dropdown = $.derived(() => $.get($$d).dropdown),
		dropdownItem = $.derived(() => $.get($$d).item),
		close = $.derived(() => $.get($$d).close),
		select = $.derived(() => $.get($$d).select),
		placeholderSpan = $.derived(() => $.get($$d).placeholder),
		svg = $.derived(() => $.get($$d).svg);

	var div = root_4();

	$.attribute_effect(
		div,
		($0) => ({
			...restProps,
			onclick: toggleDropdown,
			onblur: handleBlur,
			onkeydown: handleKeyDown,
			tabindex: '0',
			role: 'listbox',
			class: $0
		}),
		[
			() => $.get(base)({ size: size(), class: clsx($.get(theme)?.base, $$props.class) })
		]
	);

	var select_1 = $.child(div);

	$.each(select_1, 21, items, (item) => item.value, ($$anchor, item) => {
		var option = root();
		var text = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			option.disabled = $.get(item).disabled;
			$.set_text(text, $.get(item).name);

			if (option_value !== (option_value = $.get(item).value)) {
				option.value = (option.__value = option_value) ?? '';
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select_1);

	var select_1_value;

	$.init_select(select_1);

	var node = $.sibling(select_1, 2);

	{
		var consequent = ($$anchor) => {
			var span = root_1();
			var text_1 = $.only_child(span, true);

			$.template_effect(
				($0) => {
					$.set_class(span, 1, $0);
					$.set_text(text_1, placeholder());
				},
				[
					() => $.clsx($.get(placeholderSpan)({ class: clsx($$props.classes?.placeholder) }))
				]
			);

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (!$.get(selectItems).length) $$render(consequent);
		});
	}

	var span_1 = $.sibling(node, 2);
	var node_1 = $.child(span_1);

	{
		var consequent_2 = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.each(node_2, 17, () => $.get(selectItems), (item) => item.value, ($$anchor, item) => {
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_4 = $.first_child(fragment_2);

						$.snippet(node_4, () => $$props.children, () => ({ item: $.get(item), clear: () => clearThisOption($.get(item)) }));
						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						{
							let $0 = $.derived(() => size() === "lg");
							let $1 = $.derived(() => ["mx-0.5 px-2 py-0", disabled() && "pointer-events-none"]);

							Badge($$anchor, {
								color: 'gray',
								get large() {
									return $.get($0);
								},
								dismissable: true,
								params: { duration: 100 },
								onclose: () => clearThisOption($.get(item)),
								get class() {
									return $.get($1);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text();

									$.template_effect(() => $.set_text(text_2, $.get(item).name));
									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						}
					};

					$.if(node_3, ($$render) => {
						if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if ($.get(selectItems).length) $$render(consequent_2);
		});
	}

	$.reset(span_1);

	var div_1 = $.sibling(span_1, 2);
	var node_5 = $.child(div_1);

	{
		var consequent_3 = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(close)({ class: clsx($.get(theme)?.close, $$props.classes?.close) }));

				CloseButton($$anchor, {
					get size() {
						return size();
					},
					color: 'none',
					get class() {
						return $.get($0);
					},

					get disabled() {
						return disabled();
					}
				});
			}
		};

		$.if(node_5, ($$render) => {
			if ($.get(selectItems).length) $$render(consequent_3);
		});
	}

	var svg_1 = $.sibling(node_5, 2);
	var path = $.only_child(svg_1);

	$.reset(div_1);

	var node_6 = $.sibling(div_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_2 = root_3();

			$.each(div_2, 21, items, (item) => item.value, ($$anchor, item) => {
				const isSelected = $.derived(() => $.get(selectItems).includes($.get(item)));
				const isActive = $.derived(() => $.get(activeItem) === $.get(item));
				var div_3 = root_2();
				var text_3 = $.only_child(div_3, true);

				$.template_effect(
					($0) => {
						$.set_class(div_3, 1, $0);
						$.set_attribute(div_3, 'data-selected', $.get(isSelected) ? "true" : undefined);
						$.set_attribute(div_3, 'data-active', $.get(isActive) ? "true" : undefined);
						$.set_text(text_3, $.get(item).name);
					},
					[
						() => $.clsx($.get(dropdownItem)({
							selected: $.get(isSelected),
							active: $.get(isActive),
							disabled: $.get(item).disabled,
							class: clsx($$props.classes?.item)
						}))
					]
				);

				$.delegated('click', div_3, (e) => selectOption($.get(item), e));
				$.append($$anchor, div_3);
			});

			$.reset(div_2);

			$.template_effect(($0) => $.set_class(div_2, 1, $0), [
				() => $.clsx($.get(dropdown)({ class: clsx($.get(styling).dropdown) }))
			]);

			$.append($$anchor, div_2);
		};

		$.if(node_6, ($$render) => {
			if ($.get(show)) $$render(consequent_4);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => multiSelectContainer = $$value, () => multiSelectContainer);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(select_1, 'id', $$props.id);
			$.set_attribute(select_1, 'name', $$props.name);
			$.set_attribute(select_1, 'form', $$props.form);
			select_1.required = $$props.required;
			$.set_attribute(select_1, 'autocomplete', $$props.autocomplete);

			if (select_1_value !== (select_1_value = value())) {
				(
					select_1.value = (select_1.__value = select_1_value) ?? '',
					$.select_option(select_1, select_1_value)
				);
			}

			$.set_class(span_1, 1, $0);
			$.set_class(svg_1, 0, $1);
			$.set_attribute(path, 'd', $.get(show) ? "m1 5 4-4 4 4" : "m9 1-4 4-4-4");
		},
		[
			() => $.clsx($.get(select)({ class: clsx($.get(theme)?.select, $$props.classes?.span) })),
			() => $.clsx(clsx($.get(svg)(), disabled() && "cursor-not-allowed", $$props.classes?.svg))
		]
	);

	$.delegated('change', select_1, function (...$$args) {
		$$props.onchange?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['change', 'click']);