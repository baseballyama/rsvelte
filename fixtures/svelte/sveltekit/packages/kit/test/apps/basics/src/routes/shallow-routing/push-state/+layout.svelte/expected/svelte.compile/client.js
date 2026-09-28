import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { afterNavigate, beforeNavigate, onNavigate } from '$app/navigation';
import { onMount } from 'svelte';

var root = $.from_html(`<a href="/shallow-routing/push-state">push-state</a> <a href="/shallow-routing/push-state/a">a</a> <a href="/shallow-routing/push-state/b">b</a> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	onMount(() => {
		window.shallow_navigation_log = [];
	});

	beforeNavigate((navigation) => {
		if (!navigation.shallow) return;

		window.shallow_navigation_log.push({
			hook: 'before',
			params: navigation.to?.params,
			path: navigation.to?.url.pathname,
			route: navigation.to?.route.id,
			shallow: navigation.shallow,
			type: navigation.type
		});

		if (navigation.to?.url.searchParams.has('cancel')) {
			navigation.cancel();
		} else {
			void navigation.complete.then(() => {
				window.shallow_navigation_log.push({ hook: 'complete' });
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
				state: document.querySelector('p')?.textContent ?? null,
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