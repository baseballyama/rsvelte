import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<ul></ul>`);

export default function List($$anchor, $$props) {
	;;

	var ul = root_1();

	$.each(ul, 21, () => $$props.things, $.index, ($$anchor, thing) => {
		var li = root();
		var text = $.only_child(li);

		$.template_effect(() => $.set_text(text, `thing ${$.get(thing).id ?? ''}`));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.append($$anchor, ul);
}