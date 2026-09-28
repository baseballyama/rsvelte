import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, onDestroy } from 'svelte';
import { groupKey } from './ToggleGroup.svelte';

export default function TogglePanel($$anchor, $$props) {
	$.push($$props, true);

	const $selectedPanel = () => $.store_get(selectedPanel, '$selectedPanel', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const panel = {};
	const { registerPanel, unregisterPanel, selectedPanel } = getContext(groupKey);

	registerPanel(panel);

	onDestroy(() => {
		unregisterPanel(panel);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.slot(node_1, $$props, 'default', {}, null);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($selectedPanel() === panel) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}