import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>t</div>`);
var root_1 = $.from_html(`<div>waiting</div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	const promise = new Promise(() => {});
	const test = [1, 2, 3];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => promise,
		($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		},
		($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => test, $.index, ($$anchor, t) => {
				var div = root();

				$.append($$anchor, div);
			});

			$.append($$anchor, fragment_1);
		}
	);

	$.append($$anchor, fragment);
	$.pop();
}