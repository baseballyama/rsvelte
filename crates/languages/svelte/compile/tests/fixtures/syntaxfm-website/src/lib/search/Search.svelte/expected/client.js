import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import Icon from '$lib/Icon.svelte';
import { searching } from '$state/search';

var root = $.from_html(`<button class="button-reset svelte-14dzhz4"><!> <div class="shortcut svelte-14dzhz4"><kbd class="svelte-14dzhz4"> </kbd></div></button>`);

export default function Search($$anchor) {
	const $searching = () => $.store_get(searching, '$searching', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const shortcut = !browser || navigator.platform === 'MacIntel' ? '⌘' : 'Ctrl';
	var button = root();
	var node = $.child(button);

	Icon(node, { name: 'search' });

	var div = $.sibling(node, 2);
	var kbd = $.child(div);
	var text = $.only_child(kbd);

	$.reset(div);
	$.reset(button);

	$.template_effect(() => {
		$.set_attribute(button, 'aria-label', `Search (shortcut: ${shortcut}K)`);
		$.set_text(text, `${shortcut}K`);
	});

	$.delegated('click', button, () => {
		$.store_set(searching, true);
	});

	$.append($$anchor, button);
	$$cleanup();
}

$.delegate(['click']);