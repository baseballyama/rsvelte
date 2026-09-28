import * as $ from 'svelte/internal/server';
import { toggle } from "./theme";
import clsx from "clsx";
import Label from "$lib/forms/label/Label.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Toggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			size = "default",
			value,
			checked = void 0,
			disabled,
			color = "primary",
			class: className,
			classes,
			inputClass,
			spanClass,
			offLabel,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Toggle", untrack(() => ({ inputClass, spanClass })), { inputClass: "input", spanClass: "span" });

		const styling = $.derived(() => classes ?? { input: inputClass, span: spanClass });
		const theme = $.derived(() => getTheme("toggle"));

		const $$d = $.derived(() => toggle({ color, checked, size, disabled, off_state_label: !!offLabel })),
			input = $.derived(() => $$d().input),
			label = $.derived(() => $$d().label),
			span = $.derived(() => $$d().span);

		Label($$renderer, {
			class: label()({ class: clsx(theme()?.label, className) }),
			children: ($$renderer) => {
				if (offLabel) {
					$$renderer.push('<!--[0-->');
					offLabel($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <input${$.attributes(
					{
						type: 'checkbox',
						checked,
						value,
						...restProps,
						disabled,
						class: $.clsx(input()({ class: clsx(theme()?.input, styling().input) }))
					},
					void 0,
					void 0,
					void 0,
					4
				)}/> <span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, styling().span) })))}></span> `);

				if (children) {
					$$renderer.push('<!--[0-->');
					children($$renderer);
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$.bind_props($$props, { checked });
	});
}