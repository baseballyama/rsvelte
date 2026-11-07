import * as $ from 'svelte/internal/server';
import { checkbox } from "./theme";
import clsx from "clsx";
import Label from "$lib/forms/label/Label.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function Checkbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			color = "primary",
			custom,
			inline,
			tinted,
			rounded,
			group = [],
			choices = [],
			checked = false,
			classes,
			class: className,
			divClass,
			disabled,
			value,
			labelProps = {},
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Checkbox", untrack(() => ({ divClass })), { divClass: "div" });

		const styling = $.derived(() => classes ?? { div: divClass });
		const theme = $.derived(() => getTheme("checkbox"));

		const $$d = $.derived(() => checkbox({
				color,
				tinted,
				custom,
				rounded,
				inline,
				disabled: disabled ?? false
			})),
			base = $.derived(() => $$d().base),
			divStyle = $.derived(() => $$d().div);

		if (// There's a bug in Svelte and bind:group is not working with wrapped checkbox
		// This workaround is taken from:
		// https://svelte.dev/repl/de117399559f4e7e9e14e2fc9ab243cc?version=3.12.1
		choices.length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(choices);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let choice = each_array[i];

				Label($$renderer, $.spread_props([
					{ show: !!children || !!choice.label },
					labelProps,
					{
						class: divStyle()({ class: clsx(theme()?.div, styling().div) }),
						children: ($$renderer) => {
							$$renderer.push(`<input${$.attributes(
								{
									type: 'checkbox',
									value: choice.value,
									checked: choice.checked ?? false,
									disabled,
									checked: group.includes(choice.value),
									...restProps,
									class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
								},
								void 0,
								void 0,
								void 0,
								4
							)}/> `);

							if (children) {
								$$renderer.push('<!--[0-->');
								children($$renderer, { value: choice.value, checked: choice.checked, disabled });
								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push(`<!--[-1-->${$.escape(choice.label)}`);
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					}
				]));
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');

			Label($$renderer, $.spread_props([
				{ show: !!children },
				labelProps,
				{
					class: divStyle()({ class: clsx(theme()?.div, styling().div) }),
					children: ($$renderer) => {
						$$renderer.push(`<input${$.attributes(
							{
								type: 'checkbox',
								value,
								checked,
								disabled,
								...restProps,
								class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
							},
							void 0,
							void 0,
							void 0,
							4
						)}/> `);

						if (children) {
							$$renderer.push('<!--[0-->');
							children($$renderer, { value, checked, disabled });
							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { group, checked });
	});
}