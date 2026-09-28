import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CustomExpandable } from 'svelte-inspect-value';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`multiples: <ul></ul>`, 1);

export default function ExpandableNumber($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);

	let entries = $.derived(() => Object.entries({
		base: $$props.value,
		timesTwo: $$props.value * 2,
		timesThree: $$props.value * 3
	}));

	{
		const valuePreview = ($$anchor) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.value));
			$.append($$anchor, text);
		};

		CustomExpandable($$anchor, $.spread_props(
			{
				get value() {
					return $$props.value;
				}
			},
			() => rest,
			{
				get length() {
					return $.get(entries).length;
				},
				showLength: false,
				keepPreviewOnExpand: true,
				valuePreview,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var fragment_2 = root_1();
					var ul = $.sibling($.first_child(fragment_2));

					$.each(ul, 21, () => $.get(entries), $.index, ($$anchor, $$item) => {
						var $$array = $.derived(() => $.to_array($.get($$item), 2));
						let k = () => $.get($$array)[0];
						let v = () => $.get($$array)[1];
						var li = root();
						var text_1 = $.only_child(li);

						$.template_effect(() => $.set_text(text_1, `${k() ?? ''}: ${v() ?? ''}`));
						$.append($$anchor, li);
					});

					$.reset(ul);
					$.append($$anchor, fragment_2);
				},
				$$slots: { valuePreview: true, default: true }
			}
		));
	}
}