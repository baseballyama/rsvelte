import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<img class="user-photo svelte-vd97sx" alt=""/>`);
var root_1 = $.from_html(`<div class="item svelte-vd97sx"><div class="avatar svelte-vd97sx"><div class="user-avatar svelte-vd97sx"><!></div></div> <div><div class="name svelte-vd97sx"> </div> <div class="mail svelte-vd97sx"> </div></div></div>`);

export default function UserOption($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => $.set_attribute(img, 'src', $$props.data.avatar));
			$.append($$anchor, img);
		};

		$.if(node, ($$render) => {
			if ($$props.data.avatar) $$render(consequent);
		});
	}

	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var div_4 = $.child(div_3);
	var text = $.only_child(div_4, true);
	var div_5 = $.sibling(div_4, 2);
	var text_1 = $.only_child(div_5, true);

	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, $$props.data.label);
		$.set_text(text_1, $$props.data.email || "");
	});

	$.append($$anchor, div);
	$.pop();
}