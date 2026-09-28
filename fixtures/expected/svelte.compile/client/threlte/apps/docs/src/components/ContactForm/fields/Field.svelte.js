import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span class="svelte-23lrp4">*</span>`);
var root_1 = $.from_html(`<div class="svelte-23lrp4"><label class="svelte-23lrp4"> <!></label> <!></div>`);

export default function Field($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => $$props.label.toLowerCase().replace(' ', '-')),
		required = $.prop($$props, 'required', 3, false);

	var div = root_1();
	var label_1 = $.child(div);
	var text = $.child(label_1);
	var node = $.sibling(text);

	{
		var consequent = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (required()) $$render(consequent);
		});
	}

	$.reset(label_1);

	var node_1 = $.sibling(label_1, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(label_1, 'for', id());
		$.set_text(text, `${$$props.label ?? ''} `);
	});

	$.append($$anchor, div);
	$.pop();
}