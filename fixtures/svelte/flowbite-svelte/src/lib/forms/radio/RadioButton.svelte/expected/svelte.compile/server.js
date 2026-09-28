import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import Button from "$lib/buttons/Button.svelte";
import { radioButton } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function RadioButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			group = void 0,
			value = void 0,
			inline,
			pill,
			outline,
			size,
			color,
			shadow,
			checkedClass,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("radioButton"));
		let isChecked = $.derived(() => value == group);

		let base = $.derived(() => radioButton({
			inline,
			class: clsx(isChecked() && checkedClass, theme(), className)
		}));

		Button($$renderer, {
			tag: 'label',
			pill,
			outline,
			size,
			color,
			shadow,
			class: base(),
			children: ($$renderer) => {
				$$renderer.push(`<input${$.attributes(
					{
						type: 'radio',
						class: 'sr-only',
						value,
						checked: group === value,
						...restProps
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