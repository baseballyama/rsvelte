import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext, onDestroy } from 'svelte';
import { TABS } from './Tabs.svelte';

var root = $.from_html(`<button><!></button>`);

export default function Tab($$anchor, $$props) {
	$.push($$props, true);

	const $selectedTab = () => $.store_get(selectedTab, '$selectedTab', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const tab = {};
	const { registerTab, unregisterTab, selectTab, selectedTab } = getContext(TABS);

	registerTab(tab);

	onDestroy(() => {
		unregisterTab(tab);
	});

	var button = root();
	let classes;
	var node = $.child(button);

	$.slot(node, $$props, 'default', {}, null);
	$.reset(button);
	$.template_effect(() => classes = $.set_class(button, 1, '', null, classes, { selected: $selectedTab() === tab }));
	$.event('click', button, () => selectTab(tab));
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}