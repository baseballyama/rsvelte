import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './Component.svelte';

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <button>Set both to falsy</button> <button>Set outer to truthy</button>`, 1);

export default function Main($$anchor) {
	let outer = $.state(true);
	let inner = $.state(123);

	function outro() {
		return { duration: 100 };
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					const text = $.derived(() => $.get(inner).toString());
					var fragment_1 = root();
					var text_1 = $.first_child(fragment_1);
					var node_2 = $.sibling(text_1);

					Component(node_2, {
						get value() {
							return $.get(inner);
						}
					});

					$.template_effect(($0) => $.set_text(text_1, `${$.get(text) ?? ''} ${$0 ?? ''} `), [() => $.get(inner).toString()]);
					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(inner)) $$render(consequent);
				});
			}

			$.reset(div);
			$.transition(2, div, () => outro);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(outer)) $$render(consequent_1);
		});
	}

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);

	$.delegated('click', button, () => {
		$.set(outer, false);
		$.set(inner, undefined);
	});

	$.delegated('click', button_1, () => {
		$.set(outer, true);
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);