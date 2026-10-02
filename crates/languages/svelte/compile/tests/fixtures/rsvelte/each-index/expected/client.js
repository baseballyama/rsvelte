import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);

var root_1 = $.from_html(`<ol></ol> <p> </p>`, 1);

export default function Each_index($$anchor, $$props) {
	$.push($$props, true);
	var fragment = root_1();
	var ol = $.first_child(fragment);
	$.each(ol, 21, () => $$props.items, $.index, ($$anchor, item, i) => {
		var li = root();
		var text = $.only_child(li);
		$.template_effect(() => $.set_text(text, `${i + 1}: ${$.get(item) ?? ''}`));
		$.append($$anchor, li);
	});
	$.reset(ol);
	var p = $.sibling(ol, 2);
	var text_1 = $.only_child(p);
	$.template_effect(() => $.set_text(text_1, `${$$props.items.length ?? ''} items`));
	$.append($$anchor, fragment);
	$.pop();
}
