import * as $ from 'svelte/internal/server';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createSingleSelectionContext, useSingleSelection } from "$lib/utils/singleselection.svelte";
import clsx from "clsx";
import { tabs } from "./theme";
import { setTabsContext } from "$lib/context";
import { untrack } from "svelte";

export default function Tabs($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uuid = $.props_id($$renderer);

		let {
			children,
			selected = void 0,
			tabStyle = "none",
			ulClass,
			contentClass,
			divider = true,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const activeClasses = $.derived(() => typeof classes?.active === "string" ? classes.active : undefined);

		warnThemeDeprecation("Tabs", untrack(() => ({ ulClass, contentClass })), { ulClass: "class", contentClass: "content" });

		const theme = $.derived(() => getTheme("tabs"));
		const styling = $.derived(() => classes ?? { content: contentClass });

		const $$d = $.derived(() => tabs({ tabStyle, hasDivider: divider })),
			base = $.derived(() => $$d().base),
			content = $.derived(() => $$d().content),
			dividerClass = $.derived(() => $$d().divider);

		const panelId = `tab-panel-${uuid}`;
		const ctx = $.derived(() => ({ tabStyle, panelId }));
		const dividerBool = $.derived(() => ["full", "pill"].includes(tabStyle) ? false : divider);

		createSingleSelectionContext();

		const tabRegistry = new Map();
		let selectedTab = {};

		const updateSelection = useSingleSelection((v) => {
			selectedTab = v ?? {};
			selected = v?.id;
		});

		// Handle external changes to selected
		// Auto-select logic
		const registerFn = (tabData) => {
			if (tabData.id) {
				tabRegistry.set(tabData.id, tabData);
			}
		};

		const unregisterFn = (tabId) => {
			tabRegistry.delete(tabId);
		};

		// Set context synchronously for SSR compatibility
		// Use getters to make the context reactive
		setTabsContext({
			get activeClasses() {
				return activeClasses();
			},

			get ctx() {
				return ctx();
			},
			registerTab: registerFn,
			unregisterTab: unregisterFn
		});

		$$renderer.push(`<ul${$.attributes({
			role: 'tablist',
			...restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className ?? ulClass) }))
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></ul> `);

		if (dividerBool()) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(dividerClass()({ class: clsx(theme()?.divider, classes?.divider) })))}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div${$.attr('id', panelId)}${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, styling().content) })))} role="tabpanel"${$.attr('aria-labelledby', selectedTab.id)}>`);
		selectedTab.snippet?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { selected });
	});
}