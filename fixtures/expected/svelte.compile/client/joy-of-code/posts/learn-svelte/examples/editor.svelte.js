import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container editor svelte-i39yxc"><textarea spellcheck="false" class="svelte-i39yxc"></textarea> <!></div>`);

export default function Editor($$anchor) {
	let editor = $.proxy({ theme: 'dark', content: '<h1>Svelte</h1>' });
	var div = root();
	var textarea = $.child(div);

	$.remove_textarea_child(textarea);

	var node = $.sibling(textarea, 2);

	$.html(node, () => editor.content);
	$.reset(div);
	$.template_effect(() => $.set_value(textarea, editor.content));
	$.delegated('input', textarea, (e) => editor.content = e.target.value);
	$.append($$anchor, div);
}

$.delegate(['input']);