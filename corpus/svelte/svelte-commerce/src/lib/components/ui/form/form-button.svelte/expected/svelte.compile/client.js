import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Button from '$lib/components/ui/button/index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref']);

export default function Form_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Button.Root, ($$anchor, Button_Root) => {
		Button_Root($$anchor, $.spread_props({ type: 'submit' }, () => restProps, {
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			}
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}