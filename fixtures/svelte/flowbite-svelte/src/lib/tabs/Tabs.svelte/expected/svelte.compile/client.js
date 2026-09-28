import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { createSingleSelectionContext, useSingleSelection } from "$lib/utils/singleselection.svelte";
import clsx from "clsx";
import { tabs } from "./theme";
import { setTabsContext } from "$lib/context";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'selected',
	'tabStyle',
	'ulClass',
	'contentClass',
	'divider',
	'class',
	'classes'
]);

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<ul><!></ul> <!> <div role="tabpanel"><!></div>`, 1);

export default function Tabs($$anchor, $$props) {
	const uuid = $.props_id();

	$.push($$props, true);

	let selected = $.prop($$props, 'selected', 15),
		tabStyle = $.prop($$props, 'tabStyle', 3, "none"),
		divider = $.prop($$props, 'divider', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const activeClasses = $.derived(() => typeof $$props.classes?.active === "string" ? $$props.classes.active : undefined);

	warnThemeDeprecation("Tabs", untrack(() => ({ ulClass: $$props.ulClass, contentClass: $$props.contentClass })), { ulClass: "class", contentClass: "content" });

	const theme = $.derived(() => getTheme("tabs"));
	const styling = $.derived(() => $$props.classes ?? { content: $$props.contentClass });

	const $$d = $.derived(() => tabs({ tabStyle: tabStyle(), hasDivider: divider() })),
		base = $.derived(() => $.get($$d).base),
		content = $.derived(() => $.get($$d).content),
		dividerClass = $.derived(() => $.get($$d).divider);

	const panelId = `tab-panel-${uuid}`;
	const ctx = $.derived(() => ({ tabStyle: tabStyle(), panelId }));
	const dividerBool = $.derived(() => ["full", "pill"].includes(tabStyle()) ? false : divider());

	createSingleSelectionContext();

	const tabRegistry = $.proxy(new Map());
	let selectedTab = $.state($.proxy({}));

	const updateSelection = useSingleSelection((v) => {
		$.set(selectedTab, v ?? {}, true);
		selected(v?.id);
	});

	// Handle external changes to selected
	$.user_effect(() => {
		if (selected() && selected() !== $.get(selectedTab).id) {
			const targetTab = tabRegistry.get(selected());

			if (targetTab) {
				updateSelection(true, targetTab);
			}
		}
	});

	// Auto-select logic
	$.user_effect(() => {
		if (tabRegistry.size > 0 && !$.get(selectedTab).id) {
			const targetTab = selected()
				? tabRegistry.get(selected())
				: tabRegistry.values().next().value;

			if (targetTab) {
				updateSelection(true, targetTab);
			}
		}
	});

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
			return $.get(activeClasses);
		},

		get ctx() {
			return $.get(ctx);
		},
		registerTab: registerFn,
		unregisterTab: unregisterFn
	});

	var fragment = root_1();
	var ul = $.first_child(fragment);

	$.attribute_effect(ul, ($0) => ({ role: 'tablist', ...restProps, class: $0 }), [
		() => $.get(base)({
			class: clsx($.get(theme)?.base, $$props.class ?? $$props.ulClass)
		})
	]);

	var node = $.child(ul);

	$.snippet(node, () => $$props.children);
	$.reset(ul);

	var node_1 = $.sibling(ul, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.template_effect(($0) => $.set_class(div, 1, $0), [
				() => $.clsx($.get(dividerClass)({ class: clsx($.get(theme)?.divider, $$props.classes?.divider) }))
			]);

			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(dividerBool)) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node_1, 2);
	var node_2 = $.child(div_1);

	$.snippet(node_2, () => $.get(selectedTab).snippet ?? $.noop);
	$.reset(div_1);

	$.template_effect(
		($0) => {
			$.set_attribute(div_1, 'id', panelId);
			$.set_class(div_1, 1, $0);
			$.set_attribute(div_1, 'aria-labelledby', $.get(selectedTab).id);
		},
		[
			() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $.get(styling).content) }))
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}