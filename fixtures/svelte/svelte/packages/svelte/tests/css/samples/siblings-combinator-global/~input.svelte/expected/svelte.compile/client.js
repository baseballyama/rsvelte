import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p class="svelte-12kiksv"></p>`);
var root_1 = $.from_html(`<h1 class="svelte-12kiksv">Hello!</h1> <div class="svelte-12kiksv"><span>World!</span></div> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 4);

	$.each(node, 16, () => [], $.index, ($$anchor, _) => {
		var p = root();

		$.append($$anchor, p);
	});

	$.append($$anchor, fragment);
}