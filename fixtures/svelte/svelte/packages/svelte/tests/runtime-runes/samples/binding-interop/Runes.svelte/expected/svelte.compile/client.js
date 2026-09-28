import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component1 from './Component1.svelte';
import Component2 from './Component2.svelte';

var root = $.from_html(` <!> <!>`, 1);
var root_1 = $.from_html(` <!> <!> <!> <!> <!>`, 1);

export default function Runes($$anchor, $$props) {
	$.push($$props, true);

	let object1 = $.state($.proxy({ value: 'foo' }));
	let object2 = $.state($.proxy({ value: 'foo' }));

	class Frozen {
		constructor(value) {
			this.value = value;
		}
	}

	let object3 = $.state($.proxy(new Frozen('foo')));
	let object4 = $.state($.proxy(new Frozen('foo')));
	let primitive1 = $.state('foo');
	let primitive2 = $.state('foo');

	$.next();

	var fragment = root_1();
	var text = $.first_child(fragment);
	var node = $.sibling(text);

	Component1(node, {
		get object() {
			return $.get(object1);
		},

		set object($$value) {
			$.set(object1, $$value, true);
		}
	});

	var text_1 = $.sibling(node);
	var node_1 = $.sibling(text_1);

	Component2(node_1, {
		get object() {
			return $.get(object2);
		},

		set object($$value) {
			$.set(object2, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var text_2 = $.first_child(fragment_1);
			var node_3 = $.sibling(text_2);

			Component1(node_3, {
				get object() {
					return $.get(object3);
				},

				set object($$value) {
					$.set(object3, $$value, true);
				}
			});

			var text_3 = $.sibling(node_3);
			var node_4 = $.sibling(text_3);

			Component2(node_4, {
				get object() {
					return $.get(object4);
				},

				set object($$value) {
					$.set(object4, $$value, true);
				}
			});

			$.template_effect(() => {
				$.set_text(text_2, `${$.get(object3).value ?? ''} `);
				$.set_text(text_3, ` ${$.get(object4).value ?? ''} `);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var text_4 = $.sibling(node_2);
	var node_5 = $.sibling(text_4);

	Component1(node_5, {
		get primitive() {
			return $.get(primitive1);
		},

		set primitive($$value) {
			$.set(primitive1, $$value, true);
		}
	});

	var text_5 = $.sibling(node_5);
	var node_6 = $.sibling(text_5);

	Component2(node_6, {
		get primitive() {
			return $.get(primitive2);
		},

		set primitive($$value) {
			$.set(primitive2, $$value, true);
		}
	});

	$.template_effect(() => {
		$.set_text(text, `${$.get(object1).value ?? ''} `);
		$.set_text(text_1, ` ${$.get(object2).value ?? ''} `);
		$.set_text(text_4, ` ${$.get(primitive1) ?? ''} `);
		$.set_text(text_5, ` ${$.get(primitive2) ?? ''} `);
	});

	$.append($$anchor, fragment);
	$.pop();
}