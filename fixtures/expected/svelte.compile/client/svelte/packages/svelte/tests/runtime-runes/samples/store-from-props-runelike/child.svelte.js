import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Child($$anchor, $$props) {
	const $state = () => $.store_get($$props.state, '$state', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $state()));
	$.delegated('click', button, () => $.update_store($$props.state, $state()));
	$.append($$anchor, button);
	$$cleanup();
}

$.delegate(['click']);