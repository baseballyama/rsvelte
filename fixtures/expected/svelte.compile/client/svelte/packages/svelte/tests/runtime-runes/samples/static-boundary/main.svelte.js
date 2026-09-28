import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>test</div>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function Main($$anchor) {
	var div = root_1();
	var node = $.child(div);

	$.boundary(node, {}, ($$anchor) => {
		var div_1 = root();

		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.append($$anchor, div);
}