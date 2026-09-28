import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(` <br/>`, 1);
var root_1 = $.from_html(`<!> <button>Trigger</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let centerRow = $.state($.proxy({ nested: { optional: 2, required: 3 } }));
	let someChange = $.state(false);

	$.user_effect(() => {
		if ($.get(someChange)) $.set(centerRow, undefined);
	});

	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root();
					var text = $.first_child(fragment_2);

					$.next();
					$.template_effect(() => $.set_text(text, `op: ${$.get(centerRow).nested.optional ?? ''}`));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var fragment_3 = root();
					var text_1 = $.first_child(fragment_3);

					$.next();
					$.template_effect(() => $.set_text(text_1, `req: ${$.get(centerRow).nested.required ?? ''}`));
					$.append($$anchor, fragment_3);
				};

				$.if(node_1, ($$render) => {
					if ($.get(centerRow)?.nested?.optional != undefined && $.get(centerRow).nested.optional > 0) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(centerRow)?.nested) $$render(consequent_1);
		});
	}

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => $.set(someChange, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);