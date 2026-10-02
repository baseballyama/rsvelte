import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button> <button> </button>`, 1);

var root_1 = $.from_html(`<!> <p> </p>`, 1);

export default function Each_handlers($$anchor) {
	let items = $.state($.proxy(['one', 'two', 'three']));
	let picked = $.state('');
	function remove(item) {
		$.set(items, $.get(items).filter((i) => i !== item), true);
	}
	var fragment = root_1();
	var node = $.first_child(fragment);
	$.each(node, 18, () => $.get(items), (item) => item, ($$anchor, item, i) => {
		var fragment_1 = root();
		var button = $.first_child(fragment_1);
		var text = $.only_child(button, true);
		var button_1 = $.sibling(button, 2);
		var text_1 = $.only_child(button_1);
		$.template_effect(() => {
			$.set_text(text, item);
			$.set_text(text_1, `remove ${$.get(i) ?? ''}`);
		});
		$.delegated('click', button, () => $.set(picked, item, true));
		$.delegated('click', button_1, () => remove(item));
		$.append($$anchor, fragment_1);
	});
	var p = $.sibling(node, 2);
	var text_2 = $.only_child(p);
	$.template_effect(() => $.set_text(text_2, `picked: ${$.get(picked) ?? ''}`));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
