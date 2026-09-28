import * as $ from 'svelte/internal/server';
import { toolbarButton } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function ToolbarButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			color,
			name,
			"aria-label": ariaLabel,
			size,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("toolbarButton"));

		const buttonCls = $.derived(() => toolbarButton({
			color,
			size,
			background: false,
			class: clsx(theme(), className)
		}));

		if (restProps.href === undefined) {
			$$renderer.push(`<!--[0--><button${$.attributes({
				type: 'button',
				...restProps,
				class: $.clsx(buttonCls()),
				'aria-label': ariaLabel ?? name
			})}>`);

			if (name) {
				$$renderer.push(`<!--[0--><span class="sr-only">${$.escape(name)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes({
				...restProps,
				class: $.clsx(buttonCls()),
				'aria-label': ariaLabel ?? name
			})}>`);

			if (name) {
				$$renderer.push(`<!--[0--><span class="sr-only">${$.escape(name)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);
			children?.($$renderer);
			$$renderer.push(`<!----></a>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}