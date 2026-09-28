import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var root = $.from_html(`<button> </button>`);

export default function Sub($$anchor, $$props) {
	$.push($$props, true);

	const list = getContext('list');
	var button = root();
	var text = $.only_child(button);

	$.template_effect(($0) => $.set_text(text, `[${$0 ?? ''}]`), [() => list.join(',')]);
	$.delegated('click', button, () => list.push('foo'));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);