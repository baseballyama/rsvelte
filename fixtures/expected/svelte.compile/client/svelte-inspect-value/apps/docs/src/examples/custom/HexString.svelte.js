import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CustomLine } from 'svelte-inspect-value';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value', 'showString']);
var root = $.from_html(`<div class="text svelte-1x88h7k"> </div>`);
var root_1 = $.from_html(`<div class="color svelte-1x88h7k"><!></div>`);

export default function HexString($$anchor, $$props) {
	// extra props
	let showString = $.prop($$props, 'showString', 3, true),
		rest = $.rest_props($$props, rest_excludes);

	CustomLine($$anchor, $.spread_props(
		{
			get value() {
				return $$props.value;
			}
		},
		() => rest,
		{
			children: ($$anchor, $$slotProps) => {
				var div = root_1();
				var node = $.child(div);

				{
					var consequent = ($$anchor) => {
						var div_1 = root();
						var text = $.only_child(div_1, true);

						$.template_effect(() => $.set_text(text, $$props.value));
						$.append($$anchor, div_1);
					};

					$.if(node, ($$render) => {
						if (showString()) $$render(consequent);
					});
				}

				$.reset(div);

				$.template_effect(() => {
					$.set_style(div, `background-color: ${$$props.value ?? ''};`);
					$.set_attribute(div, 'title', $$props.value);
				});

				$.append($$anchor, div);
			},
			$$slots: { default: true }
		}
	));
}