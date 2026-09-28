import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>hello</p>`);
var root_1 = $.from_svg(`<svg><foreignObject><!></foreignObject></svg>`);

export default function Main($$anchor) {
	var svg = root_1();

	{
		const p = ($$anchor) => {
			var p_1 = root();

			$.append($$anchor, p_1);
		};

		var foreignObject = $.child(svg);
		var node = $.child(foreignObject);

		p(node);
		$.reset(foreignObject);
		$.reset(svg);
	}

	$.append($$anchor, svg);
}