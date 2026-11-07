import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>test</div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let prop = $.state(void 0);
	let key = $.state($.proxy({}));

	function action() {
		$.set(prop, {}, true);

		$.user_pre_effect(() => {
			return () => {
				$.get(prop);
			};
		});
	}

	$.user_effect(() => $.set(key, {}, true));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(node, () => $.get(key), ($$anchor) => {
		var div = root();

		$.action(div, ($$node) => action?.($$node));
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
	$.pop();
}