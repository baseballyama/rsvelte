import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<title>potato</title>`);
var root_1 = $.from_svg(`<svg><!></svg>`);

export default function Main($$anchor) {
	var svg = root_1();
	var node = $.child(svg);

	{
		var consequent = ($$anchor) => {
			var title = root();

			$.append($$anchor, title);
		};

		$.if(node, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	$.reset(svg);
	$.append($$anchor, svg);
}