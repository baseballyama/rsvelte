import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>First</div>`);
var root_1 = $.from_html(`<section><!> <div>Second</div></section> <button>Click</button>`, 1);

export default function Main($$anchor) {
	let slide = 0;
	let num = false;
	const changeNum = () => num = !num;
	var fragment = root_1();
	var section = $.first_child(fragment);
	var node = $.child(section);

	$.key(node, () => slide, ($$anchor) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var div = root();

				$.append($$anchor, div);
			};

			$.if(node_1, ($$render) => {
				if (num) $$render(consequent);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.next(2);
	$.reset(section);

	var button = $.sibling(section, 2);

	$.event('click', button, changeNum);
	$.append($$anchor, fragment);
}