import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Main($$anchor) {
	let things = $.proxy([{ group: 'a', id: 1 }, { group: 'b', id: 2 }]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 17, () => things, (thing) => [thing.group, thing.id], ($$anchor, thing) => {
		var p = root();
		var text = $.only_child(p);

		$.template_effect(() => $.set_text(text, `${$.get(thing).group ?? ''}-${$.get(thing).id ?? ''}`));
		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}