import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Each_keyed($$anchor) {
	let people = $.proxy([{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }]);
	var fragment = $.comment();
	var node = $.first_child(fragment);
	$.each(node, 17, () => people, (person) => person.id, ($$anchor, person) => {
		var p = root();
		var text = $.only_child(p, true);
		$.template_effect(() => $.set_text(text, $.get(person).name));
		$.append($$anchor, p);
	});
	$.append($$anchor, fragment);
}
