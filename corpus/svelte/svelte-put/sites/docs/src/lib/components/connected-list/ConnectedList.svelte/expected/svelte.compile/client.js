import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<ul><!></ul>`);

export default function ConnectedList($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var ul = root();

	$.attribute_effect(
		ul,
		() => ({
			class: `prose-p:m-0 prose-ul:m-4 prose-li:m-0 ${$$props.class ?? ''}`,
			...rest
		}),
		void 0,
		void 0,
		void 0,
		'svelte-1gq0vyn'
	);

	var node = $.child(ul);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(ul);
	$.append($$anchor, ul);
}