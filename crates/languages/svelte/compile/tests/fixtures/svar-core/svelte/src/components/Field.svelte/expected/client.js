import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { uid } from "@svar-ui/lib-dom";
import { setContext } from "svelte";

var root = $.from_html(`<label class="wx-label svelte-rvw8fk"> </label>`);
var root_1 = $.from_html(`<div class="wx-label svelte-rvw8fk"> </div>`);
var root_2 = $.from_html(`<div><!> <div><!></div></div>`);

export default function Field($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, ""),
		position = $.prop($$props, 'position', 3, ""),
		width = $.prop($$props, 'width', 3, ""),
		error = $.prop($$props, 'error', 3, false),
		type = $.prop($$props, 'type', 3, ""),
		required = $.prop($$props, 'required', 3, false),
		css = $.prop($$props, 'css', 3, "");

	const inputId = $$props.id === undefined ? uid() : $$props.id;

	setContext("wx-input-id", inputId);

	var div = root_2();
	let classes;
	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var label_1 = root();
					var text = $.only_child(label_1, true);

					$.template_effect(() => {
						$.set_attribute(label_1, 'for', inputId);
						$.set_text(text, label());
					});

					$.append($$anchor, label_1);
				};

				var alternate = ($$anchor) => {
					var div_1 = root_1();
					var text_1 = $.only_child(div_1, true);

					$.template_effect(() => $.set_text(text_1, label()));
					$.append($$anchor, div_1);
				};

				$.if(node_1, ($$render) => {
					if (inputId) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent_1);
		});
	}

	var div_2 = $.sibling(node, 2);
	var node_2 = $.child(div_2);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		classes = $.set_class(div, 1, `wx-field wx-${position() ?? ''} ${css() ?? ''}`, 'svelte-rvw8fk', classes, { 'wx-error': error(), 'wx-required': required() });
		$.set_style(div, width() ? `width: ${width()}` : "");
		$.set_class(div_2, 1, `wx-field-control wx-${type() ?? ''}`, 'svelte-rvw8fk');
	});

	$.append($$anchor, div);
	$.pop();
}