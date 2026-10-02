import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import marked from 'marked';

var root = $.from_html(`<textarea class="svelte-hcsj82"></textarea> <!>`, 1);

export default function Textarea_inputs_input($$anchor, $$props) {
	$.push($$props, true);

	let value = `Some words are *italic*, some are **bold**`;
	var fragment = root();
	var textarea = $.first_child(fragment);

	$.remove_textarea_child(textarea);

	var node = $.sibling(textarea, 2);

	$.html(node, () => marked(value));
	$.bind_value(textarea, () => value, ($$value) => value = $$value);
	$.append($$anchor, fragment);
	$.pop();
}