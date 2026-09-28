import * as $ from 'svelte/internal/server';
import { textarea } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

export default function Textarea($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			header,
			footer,
			addon,
			value = void 0,
			elementRef = void 0,
			divClass,
			innerClass,
			headerClass,
			footerClass,
			addonClass,
			disabled,
			class: className,
			classes,
			clearable,
			clearableSvgClass,
			clearableColor = "none",
			clearableClass,
			clearableOnClick,
			textareaClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation(
			"Textarea",
			untrack(() => ({
				divClass,
				innerClass,
				headerClass,
				footerClass,
				addonClass,
				textareaClass,
				clearableClass,
				clearableSvgClass
			})),
			{
				divClass: "div",
				innerClass: "inner",
				headerClass: "header",
				footerClass: "footer",
				addonClass: "addon",
				textareaClass: "class",
				clearableClass: "close",
				clearableSvgClass: "svg"
			}
		);

		const styling = $.derived(() => classes ?? {
			div: divClass,
			inner: innerClass,
			header: headerClass,
			footer: footerClass,
			addon: addonClass,
			textarea: textareaClass,
			close: clearableClass,
			svg: clearableSvgClass
		});

		const theme = $.derived(() => getTheme("textarea"));
		let hasHeader = $.derived(() => !!header);
		let hasFooter = $.derived(() => !!footer);
		let hasAddon = $.derived(() => !!addon);
		let wrapped = $.derived(() => hasHeader() || hasFooter() || hasAddon());

		const $$d = $.derived(() => textarea({
				wrapped: wrapped(),
				hasHeader: hasHeader(),
				hasFooter: hasFooter()
			})),
			div = $.derived(() => $$d().div),
			base = $.derived(() => $$d().base),
			wrapper = $.derived(() => $$d().wrapper),
			inner = $.derived(() => $$d().inner),
			headerCls = $.derived(() => $$d().header),
			footerCls = $.derived(() => $$d().footer),
			addonCls = $.derived(() => $$d().addon),
			close = $.derived(() => $$d().close);

		const clearAll = () => {
			if (elementRef) {
				elementRef.value = "";
				value = undefined;
			}

			if (clearableOnClick) clearableOnClick();
		};

		createDismissableContext(clearAll);
		$$renderer.push(`<div${$.attr_class($.clsx(div()({ class: clsx(theme()?.div, styling().div) })))}>`);

		if (!wrapped()) {
			$$renderer.push(`<!--[0--><textarea${$.attributes({
				disabled,
				...restProps,
				class: $.clsx(wrapper()({ class: clsx(className, classes?.wrapper) }))
			})}>`);

			const $$body = $.escape(value);

			if ($$body) {
				$$renderer.push(`${$$body}`);
			} else {}

			$$renderer.push(`</textarea>`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(wrapper()({ class: clsx(theme()?.wrapper, classes?.wrapper) })))}>`);

			if (header) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(headerCls()({ class: clsx(theme()?.header, styling().header) })))}>`);
				header($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(inner()({ class: clsx(theme()?.inner, styling().inner) })))}>`);

			if (addon) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(addonCls()({ class: clsx(theme()?.addon, styling().addon) })))}>`);
				addon($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <textarea${$.attributes({
				disabled,
				...restProps,
				class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
			})}>`);

			const $$body_1 = $.escape(value);

			if ($$body_1) {
				$$renderer.push(`${$$body_1}`);
			} else {}

			$$renderer.push(`</textarea></div> `);

			if (footer) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(footerCls()({ class: clsx(theme()?.footer, styling().footer) })))}>`);
				footer($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
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