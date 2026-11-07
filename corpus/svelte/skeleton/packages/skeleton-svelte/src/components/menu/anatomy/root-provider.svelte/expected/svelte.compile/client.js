import 'svelte/internal/disclose-version';
import { untrack } from 'svelte';
import * as $ from 'svelte/internal/client';
import { MenuRootContext } from '../modules/root-context.js';
import { MenuTriggerItemContext } from '../modules/trigger-item-context.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Root_provider($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const parentMenu = MenuRootContext.consume();

	const children = $.derived(() => $$props.children),
		menu = $.derived(() => $$props.value);

	$.user_effect(() => untrack(() => {
		if (!parentMenu) {
			return;
		}

		$.get(menu)().setParent(parentMenu().service);
		parentMenu().setChild($.get(menu)().service);
	}));

	MenuRootContext.provide(() => $.get(menu)());
	MenuTriggerItemContext.provide(() => parentMenu?.().getTriggerItemProps($.get(menu)()));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.get(children) ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}