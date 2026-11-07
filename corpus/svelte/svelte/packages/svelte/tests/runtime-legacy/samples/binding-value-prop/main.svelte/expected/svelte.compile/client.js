import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Field from './Field.svelte';
import { writable } from 'svelte/store';

var root = $.from_html(`<!> `, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $value = () => $.store_get(value, '$value', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const value = writable('aaa');
	var fragment = root();
	var node = $.first_child(fragment);

	Field(node, {
		get value() {
			$.mark_store_binding();

			return $value();
		},

		set value($$value) {
			$.store_set(value, $$value);
		}
	});

	var text = $.sibling(node);

	$.template_effect(() => $.set_text(text, ` ${$value() ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}