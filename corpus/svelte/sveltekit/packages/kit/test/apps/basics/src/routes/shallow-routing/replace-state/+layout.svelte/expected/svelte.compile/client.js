import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';
import { onMount } from 'svelte';

var root = $.from_html(`<a href="/shallow-routing/replace-state">replace-state</a> <a href="/shallow-routing/replace-state/a">a</a> <a href="/shallow-routing/replace-state/b">b</a> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		window.shallow_navigation_log = [];
	});

	beforeNavigate((navigation) => {
		if (navigation.shallow) {
			window.shallow_navigation_log.push({
				hook: 'before',
				shallow: navigation.shallow,
				type: navigation.type
			});
		}
	});

	onNavigate((navigation) => {
		if (navigation.shallow) {
			window.shallow_navigation_log.push({
				hook: 'on',
				shallow: navigation.shallow,
				type: navigation.type
			});
		}
	});

	afterNavigate((navigation) => {
		if (navigation.shallow) {
			window.shallow_navigation_log.push({
				hook: 'after',
				shallow: navigation.shallow,
				type: navigation.type
			});
		}
	});

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 6);

	$.slot(node, $$props, 'default', {}, null);
	$.append($$anchor, fragment);
	$.pop();
}