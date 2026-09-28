import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { writable } from 'svelte/store';

var root = $.from_html(`<pre> </pre> <button>add</button>`, 1);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	const $form = () => $.store_get(form, '$form', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let form = writable($$props.data.form);

	function addTag() {
		$.store_mutate(form, $.untrack($form).data.tags['third'] = 3, $.untrack($form));
	}

	var fragment = root();
	var pre = $.first_child(fragment);
	var text = $.only_child(pre, true);
	var button = $.sibling(pre, 2);

	$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify($form(), null, 2)]);
	$.event('click', button, addTag);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}