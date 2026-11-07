import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Content from './Content.svelte';

var option_content = $.from_html(`<span> </span><!>`, 1);
var root = $.from_html(`<select><option><!></option></select> <button>Toggle Content</button>`, 1);

export default function Main($$anchor) {
	let content = $.state('b');
	var fragment = root();
	var select = $.first_child(fragment);
	var option = $.child(select);

	$.customizable_select(option, () => {
		var anchor = $.child(option);
		var fragment_1 = option_content();
		var span = $.first_child(fragment_1);
		var text = $.only_child(span, true);
		var node = $.sibling(span);

		Content(node, {
			get text() {
				return $.get(content);
			}
		});

		$.template_effect(() => $.set_text(text, $.get(content)));
		$.append(anchor, fragment_1);
	});

	option.value = option.__value = 'x';
	$.reset(select);

	var button = $.sibling(select, 2);

	$.delegated('click', button, () => $.set(content, $.get(content) === 'a' ? 'b' : 'a', true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);