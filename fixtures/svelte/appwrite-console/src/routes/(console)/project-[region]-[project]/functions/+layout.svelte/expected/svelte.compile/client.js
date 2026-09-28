import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { addSubPanel, registerCommands } from '$lib/commandCenter';
import { FunctionsPanel } from '$lib/commandCenter/panels';
import { canSeeFunctions } from '$lib/stores/roles';

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $registerCommands = () => $.store_get(registerCommands, '$registerCommands', $$stores);
	const $canSeeFunctions = () => $.store_get(canSeeFunctions, '$canSeeFunctions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	$registerCommands()([
		{
			label: 'Find functions',
			callback: () => {
				addSubPanel(FunctionsPanel);
			},
			group: 'functions',
			rank: -1,
			disabled: !$canSeeFunctions()
		}
	]);

	var fragment = $.comment();

	$.head('166sqcv', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Functions - Appwrite';
		});
	});

	var node = $.first_child(fragment);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}