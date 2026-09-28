import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";
import { radio } from "./theme";
import clsx from "clsx";
import Label from "$lib/forms/label/Label.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Radio($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// remove inputClass in next major version
		let {
			children,
			"aria-describedby": ariaDescribedby,
			inline = false,
			labelClass,
			color = "primary",
			custom = false,
			group = void 0,
			value = void 0,
			class: className,
			inputClass,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Radio", untrack(() => ({ inputClass, labelClass })), { inputClass: "class", labelClass: "label" });

		const styling = $.derived(() => classes ?? { label: labelClass });
		const theme = $.derived(() => getTheme("radio"));

		const $$d = $.derived(() => radio({ color, tinted: !!getContext("background"), custom, inline })),
			input = $.derived(() => $$d().input),
			label = $.derived(() => $$d().label);

		Label($$renderer, {
			class: label()({ class: clsx(theme()?.label, styling().label) }),
			children: ($$renderer) => {
				$$renderer.push(`<input${$.attributes(
					{
						type: 'radio',
						checked: group === value,
						value,
						'aria-describedby': ariaDescribedby,
						...restProps,
						class: $.clsx(input()({ class: clsx(theme()?.input, className ?? inputClass) }))
					},
					void 0,
					void 0,
					void 0,
					4
				)}/> `);

				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { group, value });
	});
}