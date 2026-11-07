import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './Foo.svelte';

const bar = ($$anchor, arg = $.noop) => {
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, arg()));
	$.append($$anchor, p);
};

var root = $.from_html(`<p> </p>`);
var root_1 = $.from_html(`<th>fruit</th> <th>qty</th> <th>price</th> <th>total</th>`, 1);
var root_2 = $.from_html(`<div></div> <!>  <!>`, 1);

export default function Snippet_shadow_scope_input($$anchor) {
	var fragment = root_2();
	var div = $.first_child(fragment);

	{
		const children = ($$anchor) => {
			var fragment_1 = root_1();

			$.next(6);
			$.append($$anchor, fragment_1);
		};
	}

	var node = $.sibling(div, 2);

	{
		const children = ($$anchor, arg = $.noop) => {
			var p_1 = root();
			var text_1 = $.only_child(p_1, true);

			$.template_effect(() => $.set_text(text_1, arg()));
			$.append($$anchor, p_1);
		};

		const c = ($$anchor) => {
			{
				const children = ($$anchor, arg = $.noop) => {
					var p_2 = root();
					var text_2 = $.only_child(p_2, true);

					$.template_effect(() => $.set_text(text_2, arg()));
					$.append($$anchor, p_2);
				};

				Foo($$anchor, { children, $$slots: { default: true } });
			}
		};

		Foo(node, { children, c, $$slots: { default: true, c: true } });
	}

	var node_1 = $.sibling(node, 2);

	{
		const c = ($$anchor) => {
			const bar = ($$anchor, arg = $.noop) => {
				var p_3 = root();
				var text_3 = $.only_child(p_3, true);

				$.template_effect(() => $.set_text(text_3, arg()));
				$.append($$anchor, p_3);
			};

			Foo($$anchor, {
				get children() {
					return bar;
				}
			});
		};

		Foo(node_1, {
			get children() {
				return bar;
			},
			c,
			$$slots: { c: true }
		});
	}

	$.append($$anchor, fragment);
}