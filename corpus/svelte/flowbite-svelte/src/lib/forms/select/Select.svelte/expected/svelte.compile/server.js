import * as $ from 'svelte/internal/server';
import { select as selectCls } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { getButtonGroupContext } from "$lib/context";
import { untrack } from "svelte";

export default function Select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			items,
			value = void 0,
			elementRef = void 0,
			underline,
			size = "md",
			disabled,
			placeholder = "Choose option ...",
			clearable,
			clearableColor = "none",
			clearableOnClick,
			onClear,
			clearableSvgClass,
			clearableClass,
			selectClass,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Select", untrack(() => ({ selectClass, clearableSvgClass, clearableClass })), {
			selectClass: "select",
			clearableSvgClass: "svg",
			clearableClass: "close"
		});

		const styling = $.derived(() => classes ?? {
			select: selectClass,
			svg: clearableSvgClass,
			close: clearableClass
		});

		const theme = $.derived(() => getTheme("select"));
		const group = getButtonGroupContext();

		const $$d = $.derived(() => selectCls({ underline, size, disabled, grouped: !!group })),
			base = $.derived(() => $$d().base),
			select = $.derived(() => $$d().select),
			close = $.derived(() => $$d().close);

		const clearAll = () => {
			if (elementRef) {
				// Set to empty string to show placeholder and trigger change event
				elementRef.value = "";

				// Dispatch a synthetic change event to notify listeners
				elementRef.dispatchEvent(new Event("change", { bubbles: true }));
			}

			// Set reactive value to empty string to match placeholder option
			value = "";

			// Support both old and new callback names for backward compatibility
			if (onClear) onClear();

			// remove this in next major version
			if (clearableOnClick) clearableOnClick();
		};

		createDismissableContext(clearAll);
		$$renderer.push(`<div${$.attr_class($.clsx(base()({ class: clsx(theme()?.base, className) })))}>`);

		$$renderer.select(
			{
				disabled,
				...restProps,
				value,
				this: elementRef,
				class: select()({ class: clsx(theme()?.select, styling().select) })
			},
			($$renderer) => {
				if (placeholder) {
					$$renderer.push('<!--[0-->');

					$$renderer.option(
						{
							disabled: true,
							selected: value === "" || value === undefined,
							value: ''
						},
						($$renderer) => {
							$$renderer.push(`${$.escape(placeholder)}`);
						}
					);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);

				if (items) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array = $.ensure_array_like(items);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let item = each_array[$$index];

						$$renderer.option({ value: item.value, disabled: item.disabled }, ($$renderer) => {
							$$renderer.push(`${$.escape(item.name)}`);
						});
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);

				if (children) {
					$$renderer.push('<!--[0-->');
					children($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);

		$$renderer.push(` `);

		if (value !== undefined && value !== "" && clearable) {
			$$renderer.push('<!--[0-->');

			CloseButton($$renderer, {
				class: close()({ class: clsx(theme()?.close, styling().close) }),
				color: clearableColor,
				'aria-label': 'Clear search value',
				svgClass: clsx(styling().svg),
				disabled
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value, elementRef });
	});
}