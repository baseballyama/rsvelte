import * as $ from 'svelte/internal/server';
import { fileupload } from "./theme";
import clsx from "clsx";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createDismissableContext } from "$lib/utils/dismissable";
import { untrack } from "svelte";

export default function Fileupload($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			files = void 0,
			size = "md",
			clearable = false,
			elementRef = void 0,
			class: className,
			classes,
			clearableSvgClass,
			clearableColor = "none",
			clearableClass,
			clearableOnClick,
			wrapperClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Fileupload", untrack(() => ({ wrapperClass, clearableClass, clearableSvgClass })), {
			wrapperClass: "wrapper",
			clearableClass: "close",
			clearableSvgClass: "svg"
		});

		const styling = $.derived(() => classes ?? {
			wrapper: wrapperClass,
			close: clearableClass,
			svg: clearableSvgClass
		});

		const theme = $.derived(() => getTheme("fileupload"));
		const { base, wrapper, close } = fileupload();

		const clearAll = () => {
			if (elementRef) {
				elementRef.value = "";
				files = undefined;
			}

			if (clearableOnClick) clearableOnClick();
		};

		createDismissableContext(clearAll);

		$$renderer.push(`<div${$.attr_class($.clsx(wrapper({ class: clsx(theme()?.wrapper, styling().wrapper) })))}><input${$.attributes(
			{
				type: 'file',
				...restProps,
				class: $.clsx(base({ size, class: clsx(theme()?.base, className) }))
			},
			void 0,
			void 0,
			void 0,
			4
		)}/> `);

		if (files && files.length > 0 && clearable) {
			$$renderer.push('<!--[0-->');

			CloseButton($$renderer, {
				class: close({ class: clsx(theme()?.close, styling().close) }),
				color: clearableColor,
				'aria-label': 'Clear selected files',
				svgClass: clsx(styling().svg)
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { files, elementRef });
	});
}