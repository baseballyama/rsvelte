import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteSet } from "svelte/reactivity";

var root = $.from_html(`<button> </button>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const ids = [0, 1, 2];
	const seenIds = new SvelteSet();
	const unseenIds = $.derived(() => ids.filter((id) => !seenIds.has(id)));
	const currentId = $.derived(() => $.get(unseenIds).at(0));

	;;

	var button = root();
	var text = $.only_child(button);

	$.template_effect(() => $.set_text(text, `first unseen: ${$.get(currentId) ?? ''}`));
	$.delegated('click', button, () => seenIds.add($.get(currentId)));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);