import * as $ from 'svelte/internal/server';
import CheckIcon from "./CheckIcon.svelte";
import { buttonToggle } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { getButtonToggleContext } from "$lib/context";
import { untrack } from "svelte";

export default function ButtonToggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			selected = false,
			children,
			iconSlot,
			color,
			class: className,
			iconClass,
			txtClass,
			contentClass,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("ButtonToggle", untrack(() => ({ iconClass, txtClass, contentClass })), { iconClass: "icon", txtClass: "text", contentClass: "content" });

		// button(className), content, text, icon
		const styling = $.derived(() => classes ?? { icon: iconClass, text: txtClass, content: contentClass });

		const theme = $.derived(() => getTheme("buttonToggle"));

		// Get context - it will be undefined if used outside ButtonToggleGroup
		const ctx = getButtonToggleContext();

		// Extract context values with fallbacks
		const {
			toggleSelected,
			isSelected,
			multiSelect,
			size,
			roundedSize,
			ctxIconClass,
			ctxBtnClass
		} = {
			toggleSelected: ctx?.toggleSelected ?? (() => {}),
			isSelected: ctx?.isSelected ?? (() => false),
			multiSelect: ctx?.multiSelect ?? false,
			size: ctx?.size,
			roundedSize: ctx?.roundedSize,
			ctxIconClass: ctx?.ctxIconClass,
			ctxBtnClass: ctx?.ctxBtnClass
		};

		// Use context color if available, otherwise use prop color, otherwise default to "primary"
		const actualColor = $.derived(() => ctx?.color ?? color ?? "primary");

		const actualIconClass = ctxIconClass;

		// Filter size to only valid buttonToggle sizes (no 'xs')
		const actualSize = size === "xs" ? "sm" : size;

		// roundedSize is already validated by type system
		const actualRoundedSize = roundedSize;

		function handleClick() {
			toggleSelected(value);
		}

		const $$d = $.derived(() => buttonToggle({ selected, color: actualColor(), size: actualSize })),
			button = $.derived(() => $$d().button),
			content = $.derived(() => $$d().content),
			text = $.derived(() => $$d().text),
			icon = $.derived(() => $$d().icon);

		$$renderer.push(`<button${$.attributes({
			type: 'button',
			class: $.clsx(button()({
				selected,
				color: actualColor(),
				size: actualSize,
				roundedSize: actualRoundedSize,
				class: clsx(theme()?.button, ctxBtnClass, className)
			})),
			'data-selected': selected,
			role: multiSelect ? "checkbox" : "radio",
			'aria-checked': selected,
			...restProps
		})}><div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, styling().content) })))}>`);

		if (selected) {
			$$renderer.push('<!--[0-->');

			if (iconSlot) {
				$$renderer.push('<!--[0-->');
				iconSlot($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push('<!--[-1-->');

				CheckIcon($$renderer, {
					class: icon()({
						class: clsx(theme()?.icon ?? actualIconClass, styling().icon)
					})
				});
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span${$.attr_class($.clsx(text()({ selected, class: clsx(theme()?.text, styling().text) })))}>`);
		children($$renderer);
		$$renderer.push(`<!----></span></div></button>`);
	});
}