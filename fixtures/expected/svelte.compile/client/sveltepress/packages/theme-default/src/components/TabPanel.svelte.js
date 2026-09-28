import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { activeNameContextKey, itemsKey } from './Tabs.svelte';

var root = $.from_html(`<div class="tab-panel"><!></div>`);

export default function TabPanel($$anchor, $$props) {
	$.push($$props, true);

	const $items = () => $.store_get(items, '$items', $$stores);
	const $current = () => $.store_get(current, '$current', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const activeIcon = $.prop($$props, 'activeIcon', 3, undefined),
		inactiveIcon = $.prop($$props, 'inactiveIcon', 3, undefined);

	const current = getContext(activeNameContextKey);
	const items = getContext(itemsKey);

	$items().push({
		name: $$props.name,
		activeIcon: activeIcon(),
		inactiveIcon: inactiveIcon()
	});

	// eslint-disable-next-line no-self-assign
	$.store_set(items, $items());

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.name === $current()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}