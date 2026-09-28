import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { listGroupItem } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import { getListGroupContext } from "$lib/context";

export default function ListgroupItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			active,
			current,
			disabled,
			horizontal,
			name,
			Icon,
			class: className,
			iconClass = "me-2.5 h-15 w-15",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("listGroupItem"));
		const listGroupCtx = getListGroupContext();
		const finalActive = $.derived(() => active ?? listGroupCtx?.active);
		const finalHorizontal = $.derived(() => horizontal ?? listGroupCtx?.horizontal);
		let state = $.derived(() => disabled ? "disabled" : current ? "current" : "normal");

		let itemClass = $.derived(() => listGroupItem({
			state: state(),
			active: finalActive(),
			horizontal: finalHorizontal(),
			class: clsx(theme(), className)
		}));

		function nameOrChildren($$renderer) {
			if (Icon) {
				$$renderer.push('<!--[0-->');

				if (Icon) {
					$$renderer.push('<!--[-->');
					Icon($$renderer, { class: clsx(iconClass) });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(name)}`);
			}

			$$renderer.push(`<!--]-->`);
		}

		if (restProps.href === undefined && !active) {
			$$renderer.push(`<!--[0--><li${$.attr_class($.clsx(itemClass()))}>`);
			nameOrChildren($$renderer);
			$$renderer.push(`<!----></li>`);
		} else if (restProps.href === undefined) {
			$$renderer.push(`<!--[1--><button${$.attributes({
				type: 'button',
				...restProps,
				class: $.clsx(itemClass()),
				disabled,
				'aria-current': current
			})}>`);

			nameOrChildren($$renderer);
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes({
				...restProps,
				class: $.clsx(itemClass()),
				'aria-current': current
			})}>`);

			nameOrChildren($$renderer);
			$$renderer.push(`<!----></a>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}