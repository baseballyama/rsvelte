import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';
import Child from './Child.svelte';

var root = $.from_html(`<!> `, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const $form = () => $.store_get(form, '$form', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let form = writable({ count: 0 });
	var fragment = root();
	var node = $.first_child(fragment);

	Child(node, {
		get form() {
			$.mark_store_binding();

			return $form();
		},

		set form($$value) {
			$.store_set(form, $$value);
		}
	});

	var text = $.sibling(node);

	$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [() => JSON.stringify($form())]);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}