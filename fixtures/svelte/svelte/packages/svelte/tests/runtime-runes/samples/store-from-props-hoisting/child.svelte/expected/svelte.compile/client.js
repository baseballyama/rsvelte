import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	const $attrs = () => $.store_get($$props.attrs, '$attrs', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function increment() {
		$.store_mutate($$props.attrs, $.untrack($attrs).count++, $.untrack($attrs));
	}

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $attrs().count));
	$.delegated('click', button, increment);
	$.append($$anchor, button);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);