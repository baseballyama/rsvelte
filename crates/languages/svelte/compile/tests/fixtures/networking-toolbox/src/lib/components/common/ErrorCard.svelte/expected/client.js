import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<div class="card error-card"><div class="card-content"><div class="error-content"><!> <div><strong> </strong> <p> </p></div></div></div></div>`);

export default function ErrorCard($$anchor, $$props) {
	let title = $.prop($$props, 'title', 3, 'Error');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			Icon(node_1, { name: 'alert-triangle', size: 'md' });

			var div_3 = $.sibling(node_1, 2);
			var strong = $.child(div_3);
			var text = $.only_child(strong, true);
			var p = $.sibling(strong, 2);
			var text_1 = $.only_child(p, true);

			$.reset(div_3);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);

			$.template_effect(() => {
				$.set_text(text, title());
				$.set_text(text_1, $$props.error);
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.error) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}