import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child2 from './Child2.svelte';
import Child from './Child.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Main($$anchor) {
	let loginname = $.state('');
	let password = $.state('');
	var fragment = root();
	var node = $.first_child(fragment);

	Child(node, {
		get value() {
			return $.get(loginname);
		},

		set value($$value) {
			$.set(loginname, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Child(node_1, {
		get value() {
			return $.get(password);
		},

		set value($$value) {
			$.set(password, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => !$.get(loginname) || !$.get(password));

		Child2(node_2, {
			get disabled() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
}