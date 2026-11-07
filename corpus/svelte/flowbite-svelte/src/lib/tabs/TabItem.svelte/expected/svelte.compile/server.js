import * as $ from 'svelte/internal/server';
import { getTheme } from "$lib/theme/themeUtils";
import { useSingleSelection } from "$lib/utils/singleselection.svelte";
import clsx from "clsx";
import { tabItem, tabs } from "./theme";
import { getTabsContext } from "$lib/context";

export default function TabItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tabId = $.props_id($$renderer);

		let {
			children,
			titleSlot,
			open = false,
			title = "Tab title",
			key,
			activeClass,
			inactiveClass,
			class: className,
			classes,
			disabled,
			tabStyle,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("tabItem"));
		const tabsCtx = getTabsContext();

		if (!tabsCtx) {
			throw new Error("TabItem must be used within a Tabs component");
		}

		const activeClasses = tabsCtx.activeClasses;
		const ctx = tabsCtx.ctx;
		const compoTabStyle = $.derived(() => tabStyle ?? ctx.tabStyle ?? "full");

		const $$d = $.derived(() => tabs({ tabStyle: compoTabStyle(), hasDivider: true })),
			active = $.derived(() => $$d().active),
			inactive = $.derived(() => $$d().inactive);

		const tabIdentifier = $.derived(() => key ?? tabId);
		const self = $.derived(() => ({ id: tabIdentifier(), snippet: children }));
		const registerTab = tabsCtx.registerTab;
		const unregisterTab = tabsCtx.unregisterTab;
		const updateSingleSelection = useSingleSelection((value) => open = value?.id === self().id);

		const $$d_1 = $.derived(() => tabItem({ open, disabled })),
			base = $.derived(() => $$d_1().base),
			button = $.derived(() => $$d_1().button);

		$$renderer.push(`<li${$.attributes({
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
			role: 'presentation'
		})}><button type="button" role="tab"${$.attr('id', self().id)}${$.attr('aria-controls', ctx.panelId)}${$.attr('aria-selected', open)}${$.attr('disabled', disabled, true)}${$.attr_class($.clsx(button()({
			class: clsx(
				open
					? activeClass ?? active()({ class: activeClasses })
					: inactiveClass ?? inactive()(),
				theme()?.button,
				classes?.button
			)
		})))}>`);

		if (titleSlot) {
			$$renderer.push('<!--[0-->');
			titleSlot($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1-->${$.escape(title)}`);
		}

		$$renderer.push(`<!--]--></button></li>`);
		$.bind_props($$props, { open });
	});
}