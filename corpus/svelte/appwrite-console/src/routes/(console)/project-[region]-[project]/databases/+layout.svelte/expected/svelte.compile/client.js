import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { DatabasesPanel } from '$lib/commandCenter/panels';
import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $registerCommands = () => $.store_get(registerCommands, '$registerCommands', $$stores);
	const $updateCommandGroupRanks = () => $.store_get(updateCommandGroupRanks, '$updateCommandGroupRanks', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$.user_effect(() => {
		$registerCommands()([
			{
				label: 'Find databases',
				callback: () => {
					addSubPanel(DatabasesPanel);
				},
				group: 'databases',
				rank: -1
			}
		]);
	});

	$.user_effect(() => {
		$updateCommandGroupRanks()({ databases: 200, navigation: 100 });
	});

	var fragment_1 = $.comment();

	$.head('461p3i', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.key(node, () => page.url.pathname, ($$anchor) => {
			$.effect(() => {
				$.document.title = 'Databases - Appwrite';
			});
		});

		$.append($$anchor, fragment);
	});

	var node_1 = $.first_child(fragment_1);

	$.snippet(node_1, () => $$props.children);
	$.append($$anchor, fragment_1);
	$.pop();
	$$cleanup();
}