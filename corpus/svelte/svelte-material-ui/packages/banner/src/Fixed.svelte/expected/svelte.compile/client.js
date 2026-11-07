import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'fixed',
	'width',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Fixed($$anchor, $$props) {
	$.push($$props, true);

	let fixed = $.prop($$props, 'fixed', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element = $.state(void 0);

	function getElement() {
		return $.get(element);
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({
				class: 'mdc-banner__fixed',
				style: $$props.width == null ? undefined : `width: ${$$props.width}px;`,
				...restProps
			}));

			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(div);
			$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (fixed()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}