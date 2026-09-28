import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useMenu } from '../modules/provider.svelte';
import { MenuRootContext } from '../modules/root-context.js';
import { MenuTriggerItemContext } from '../modules/trigger-item-context.js';
import { splitProps } from '@zag-js/menu';
import { untrack } from 'svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Root($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const parentMenu = MenuRootContext.consume();

	const $$d = $.derived(() => splitProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		menuProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const children = $.derived(() => $.get(componentProps).children);
	const menu = useMenu(() => ({ ...$.get(menuProps), id }));

	$.user_effect(() => untrack(() => {
		if (!parentMenu) {
			return;
		}

		menu().setParent(parentMenu().service);
		parentMenu().setChild(menu().service);
	}));

	MenuRootContext.provide(() => menu());
	MenuTriggerItemContext.provide(() => parentMenu?.().getTriggerItemProps(menu()));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $.get(children) ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}