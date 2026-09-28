import * as $ from 'svelte/internal/server';
import { search } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

export default function Search($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			inputClass,
			size,
			placeholder = "Search",
			value = void 0,
			elementRef = void 0,
			clearable = false,
			clearableSvgClass,
			clearableColor = "none",
			clearableClass,
			clearableOnClick,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Search", untrack(() => ({ inputClass, clearableSvgClass, clearableClass })), {
			inputClass: "input",
			clearableSvgClass: "svg",
			clearableClass: "close"
		});

		const styling = $.derived(() => classes ?? {
			input: inputClass,
			svg: clearableSvgClass,
			close: clearableClass
		});

		const theme = $.derived(() => getTheme("search"));

		const $$d = $.derived(() => search({ size })),
			base = $.derived(() => $$d().base),
			content = $.derived(() => $$d().content),
			icon = $.derived(() => $$d().icon),
			close = $.derived(() => $$d().close),
			inputCls = $.derived(() => $$d().input),
			left = $.derived(() => $$d().left);

		const clearAll = () => {
			if (elementRef) {
				elementRef.value = "";
				value = undefined;
			}

			if (clearableOnClick) clearableOnClick();
		};

		createDismissableContext(clearAll);

		$$renderer.push(`<div${$.attr_class($.clsx(base()({ class: clsx(theme()?.base, className) })))}><div${$.attr_class($.clsx(left()({ class: clsx(theme()?.left, classes?.left) })))}><svg${$.attr_class($.clsx(icon()({ class: clsx(theme()?.icon, classes?.icon) })))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"></path></svg></div> <input${$.attributes(
			{
				type: 'search',
				value,
				class: $.clsx(inputCls()({ class: clsx(theme()?.input, styling().input) })),
				placeholder,
				required: true,
				...restProps
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> `);

		if (children) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, classes?.content) })))}>`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (value !== undefined && value !== "" && clearable) {
			$$renderer.push('<!--[0-->');

			CloseButton($$renderer, {
				class: close()({ class: clsx(theme()?.close, styling().close) }),
				color: clearableColor,
				'aria-label': 'Clear search value',
				svgClass: clsx(styling().svg)
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value, elementRef });
	});
}