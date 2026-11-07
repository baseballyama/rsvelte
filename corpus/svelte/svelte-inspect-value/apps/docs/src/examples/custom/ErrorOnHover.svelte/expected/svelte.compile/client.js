import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CustomLine } from 'svelte-inspect-value';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<span class="value string"> </span> <!>`, 1);

export default function ErrorOnHover($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let doAnError = $.state(false);

	CustomLine($$anchor, $.spread_props(
		{
			get value() {
				return $$props.value;
			}
		},
		() => rest,
		{
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var span = $.first_child(fragment_1);
				var text = $.only_child(span, true);
				var node = $.sibling(span, 2);

				{
					var consequent = ($$anchor) => {
						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, `err ${$$props.value.doesNotExist.doesNotExist ?? ''}`));
						$.append($$anchor, text_1);
					};

					$.if(node, ($$render) => {
						if ($.get(doAnError)) $$render(consequent);
					});
				}

				$.template_effect(() => $.set_text(text, $$props.value));
				$.delegated('click', span, () => $.set(doAnError, true));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}

$.delegate(['click']);