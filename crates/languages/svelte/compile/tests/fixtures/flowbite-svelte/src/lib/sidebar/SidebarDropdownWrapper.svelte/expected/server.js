import * as $ from 'svelte/internal/server';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { getSidebarContext } from "$lib/context";
import { writable } from "svelte/store";
import { slide } from "svelte/transition";
import { sidebarDropdownWrapper } from "./theme";
import { untrack } from "svelte";

export default function SidebarDropdownWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			children,
			arrowup,
			arrowdown,
			icon,
			isOpen = void 0,
			btnClass,
			label,
			spanClass,
			ulClass,
			transition = slide,
			params,
			svgClass,
			class: className,
			classes,
			onclick,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("SidebarDropdownWrapper", untrack(() => ({ btnClass, spanClass, ulClass, svgClass })), {
			btnClass: "btn",
			spanClass: "span",
			ulClass: "ul",
			svgClass: "svg"
		});

		const styling = $.derived(() => classes ?? { btn: btnClass, span: spanClass, ul: ulClass, svg: svgClass });
		const theme = $.derived(() => getTheme("sidebarDropdownWrapper"));
		const { base, btn, span, svg, ul } = sidebarDropdownWrapper();
		const isControlled = $.derived(() => isOpen !== undefined);
		let ctx = getSidebarContext() || { isSingle: false };
		let self = {};

		if (ctx.isSingle && !ctx.selected) {
			ctx.selected = writable(null);
		}

		const selectedStore = $.derived(() => ctx.selected);
		let localOpen = false;

		const openState = $.derived(() => isControlled()
			? isOpen
			: ctx.isSingle
				? $.store_get($$store_subs ??= {}, '$selectedStore', selectedStore()) === self
				: localOpen);

		function handleDropdown() {
			if (isControlled()) {
				isOpen = !isOpen;
			} else if (ctx.isSingle) {
				ctx.selected.update((current) => current === self ? null : self);
			} else {
				localOpen = !localOpen;
			}

			if (onclick) onclick();
		}

		$$renderer.push(`<li${$.attr_class($.clsx(base({ class: clsx(theme()?.base, className) })))}><button${$.attributes({
			...restProps,
			type: 'button',
			class: $.clsx(btn({ class: clsx(theme()?.btn, styling().btn) })),
			'aria-controls': 'sidebar-dropdown'
		})}>`);

		if (icon) {
			$$renderer.push('<!--[0-->');
			icon($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <span${$.attr_class($.clsx(span({ class: clsx(theme()?.span, styling().span) })))}>${$.escape(label)}</span> `);

		if (openState()) {
			$$renderer.push('<!--[0-->');

			if (arrowup) {
				$$renderer.push('<!--[0-->');
				arrowup($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><svg${$.attr_class($.clsx(svg({ class: clsx(theme()?.svg, styling().svg) })))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"></path></svg>`);
			}

			$$renderer.push(`<!--]-->`);
		} else if (arrowdown) {
			$$renderer.push('<!--[1-->');
			arrowdown($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><svg${$.attr_class($.clsx(svg({ class: clsx(theme()?.svg, styling().svg) })))} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"></path></svg>`);
		}

		$$renderer.push(`<!--]--></button> `);

		if (openState()) {
			$$renderer.push(`<!--[0--><ul${$.attr_class($.clsx(ul({ class: clsx(theme()?.ul, styling().ul) })))}>`);
			children($$renderer);
			$$renderer.push(`<!----></ul>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></li>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { isOpen });
	});
}