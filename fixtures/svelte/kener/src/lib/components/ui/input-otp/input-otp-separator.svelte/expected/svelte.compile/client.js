import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MinusIcon from "@lucide/svelte/icons/minus";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function Input_otp_separator($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(div, () => ({
		'data-slot': 'input-otp-separator',
		role: 'separator',
		...restProps
	}));

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			MinusIcon($$anchor, {});
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}