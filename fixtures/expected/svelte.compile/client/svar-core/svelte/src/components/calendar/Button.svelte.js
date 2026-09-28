import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button class="svelte-11un7qt"><!></button>`);

export default function Button($$anchor, $$props) {
	var button = root();
	var node = $.child(button);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button);

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, button);
}

$.delegate(['click']);