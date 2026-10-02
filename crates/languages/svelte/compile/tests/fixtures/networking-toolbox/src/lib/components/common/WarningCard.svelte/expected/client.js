import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '$lib/components/global/Icon.svelte';

var root = $.from_html(`<strong> </strong>`);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<div class="card warning-card"><div class="card-content"><div class="warning-content"><!> <div class="warning-messages svelte-19c45l0"><!> <!></div></div></div></div>`);

export default function WarningCard($$anchor, $$props) {
	$.push($$props, true);

	let title = $.prop($$props, 'title', 3, 'Warning');
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_2();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var node_1 = $.child(div_2);

			Icon(node_1, { name: 'alert-triangle', size: 'sm' });

			var div_3 = $.sibling(node_1, 2);
			var node_2 = $.child(div_3);

			{
				var consequent = ($$anchor) => {
					var strong = root();
					var text = $.only_child(strong, true);

					$.template_effect(() => $.set_text(text, title()));
					$.append($$anchor, strong);
				};

				$.if(node_2, ($$render) => {
					if (title()) $$render(consequent);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			$.each(node_3, 16, () => $$props.warnings, (warning) => warning, ($$anchor, warning) => {
				var p = root_1();
				var text_1 = $.only_child(p, true);

				$.template_effect(() => $.set_text(text_1, warning));
				$.append($$anchor, p);
			});

			$.reset(div_3);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($$props.warnings.length > 0) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}