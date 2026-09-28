import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CustomLine } from 'svelte-inspect-value';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<span class="value number svelte-18s35c2"> </span>`);

export default function CustomNumber($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);

	CustomLine($$anchor, $.spread_props(
		{
			get value() {
				return $$props.value;
			}
		},
		() => rest,
		{
			children: ($$anchor, $$slotProps) => {
				var span = root();
				var text = $.only_child(span, true);

				$.template_effect(() => $.set_text(text, $$props.value));
				$.append($$anchor, span);
			},
			$$slots: { default: true }
		}
	));
}