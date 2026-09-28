import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme } from "$lib/theme/themeUtils";
import { useSingleSelection } from "$lib/utils/singleselection.svelte";
import clsx from "clsx";
import { tabItem, tabs } from "./theme";
import { getTabsContext } from "$lib/context";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'titleSlot',
	'open',
	'title',
	'key',
	'activeClass',
	'inactiveClass',
	'class',
	'classes',
	'disabled',
	'tabStyle'
]);

var root = $.from_html(`<li><button type="button" role="tab"><!></button></li>`);

export default function TabItem($$anchor, $$props) {
	const tabId = $.props_id();

	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		title = $.prop($$props, 'title', 3, "Tab title"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("tabItem"));
	const tabsCtx = getTabsContext();

	if (!tabsCtx) {
		throw new Error("TabItem must be used within a Tabs component");
	}

	const activeClasses = tabsCtx.activeClasses;
	const ctx = tabsCtx.ctx;
	const compoTabStyle = $.derived(() => $$props.tabStyle ?? ctx.tabStyle ?? "full");

	const $$d = $.derived(() => tabs({ tabStyle: $.get(compoTabStyle), hasDivider: true })),
		active = $.derived(() => $.get($$d).active),
		inactive = $.derived(() => $.get($$d).inactive);

	const tabIdentifier = $.derived(() => $$props.key ?? tabId);
	const self = $.derived(() => ({ id: $.get(tabIdentifier), snippet: $$props.children }));
	const registerTab = tabsCtx.registerTab;
	const unregisterTab = tabsCtx.unregisterTab;
	const updateSingleSelection = useSingleSelection((value) => open(value?.id === $.get(self).id));

	$.user_effect(() => {
		updateSingleSelection(open(), $.get(self));
		registerTab?.($.get(self));

		return () => {
			if ($.get(self).id) {
				unregisterTab?.($.get(self).id);
			}
		};
	});

	const $$d_1 = $.derived(() => tabItem({ open: open(), disabled: $$props.disabled })),
		base = $.derived(() => $.get($$d_1).base),
		button = $.derived(() => $.get($$d_1).button);

	var li = root();

	$.attribute_effect(li, ($0) => ({ ...restProps, class: $0, role: 'presentation' }), [
		() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
	]);

	var button_1 = $.child(li);
	var node = $.child(button_1);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.titleSlot);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, title()));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($$props.titleSlot) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button_1);
	$.reset(li);

	$.template_effect(
		($0) => {
			$.set_attribute(button_1, 'id', $.get(self).id);
			$.set_attribute(button_1, 'aria-controls', ctx.panelId);
			$.set_attribute(button_1, 'aria-selected', open());
			button_1.disabled = $$props.disabled;
			$.set_class(button_1, 1, $0);
		},
		[
			() => $.clsx($.get(button)({
				class: clsx(
					open()
						? $$props.activeClass ?? $.get(active)({ class: activeClasses })
						: $$props.inactiveClass ?? $.get(inactive)(),
					$.get(theme)?.button,
					$$props.classes?.button
				)
			}))
		]
	);

	$.delegated('click', button_1, () => open(true));
	$.append($$anchor, li);
	$.pop();
}

$.delegate(['click']);