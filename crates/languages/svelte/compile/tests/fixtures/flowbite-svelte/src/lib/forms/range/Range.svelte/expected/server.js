import * as $ from 'svelte/internal/server';
import { range } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function Range($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			appearance = "none",
			color = "blue",
			size = "md",
			inputClass,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("range"));

		// remove inputClass in next major version
		const inputCls = $.derived(() => range({
			appearance,
			color,
			size,
			class: clsx(theme(), inputClass, className)
		}));

		$$renderer.push(`<input${$.attributes(
			{
				type: 'range',
				value,
				...restProps,
				class: $.clsx(inputCls())
			},
			void 0,
			void 0,
			void 0,
			4
		)}/>`);

		$.bind_props($$props, { value });
	});
}