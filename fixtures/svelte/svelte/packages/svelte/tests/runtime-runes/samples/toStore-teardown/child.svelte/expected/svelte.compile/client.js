import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toStore } from 'svelte/store';

var root = $.from_html(`<p>Current value: <span> </span></p>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	const $currentValue = () => $.store_get(currentValue, '$currentValue', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const currentValue = toStore(() => $$props.data.value);
	var p = root();
	var span = $.sibling($.child(p));
	var text = $.only_child(span, true);

	$.reset(p);
	$.template_effect(() => $.set_text(text, $currentValue()));
	$.append($$anchor, p);
	$.pop();
	$$cleanup();
}