import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(`<button>Set State</button> <!>`, 1);

export default function Main($$anchor) {
	let s = $.state($.proxy({ a: { "1": "a", "2": "b" } }));
	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => Object.entries($.get(s).a), $.index, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let k = () => $.get($$array)[0];
				let v = () => $.get($$array)[1];

				Component($$anchor, {
					get a() {
						return $.get(s).a[k()];
					},

					set a($$value) {
						$.get(s).a[k()] = $$value;
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(s).a) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(s, {}, true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);