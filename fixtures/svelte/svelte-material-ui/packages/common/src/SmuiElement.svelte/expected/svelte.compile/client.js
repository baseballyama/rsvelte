import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useActions } from './internal/index.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'use', 'tag', 'children']);
var root = $.from_svg(`<svg><!></svg>`);

export default function SmuiElement($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * The tag name of the element to create.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		tag = $.prop($$props, 'tag', 3, 'div'),
		restProps = $.rest_props($$props, rest_excludes);

	const selfClosing = $.derived(() => [
		'area',
		'base',
		'br',
		'col',
		'embed',
		'hr',
		'img',
		'input',
		'link',
		'meta',
		'param',
		'source',
		'track',
		'wbr'
	].indexOf(tag()) > -1);

	let element;

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var svg = root();

			$.attribute_effect(svg, () => ({ ...restProps }));

			var node_1 = $.child(svg);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(svg);
			$.bind_this(svg, ($$value) => element = $$value, () => element);
			$.action(svg, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
			$.append($$anchor, svg);
		};

		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.element(node_2, tag, false, ($$element, $$anchor) => {
				$.bind_this($$element, ($$value) => element = $$value, () => element);
				$.action($$element, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
				$.attribute_effect($$element, () => ({ ...restProps }));
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			$.element(node_3, tag, false, ($$element_1, $$anchor) => {
				$.bind_this($$element_1, ($$value) => element = $$value, () => element);
				$.action($$element_1, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
				$.attribute_effect($$element_1, () => ({ ...restProps }));

				var fragment_3 = $.comment();
				var node_4 = $.first_child(fragment_3);

				$.snippet(node_4, () => $$props.children ?? $.noop);
				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if (tag() === 'svg') $$render(consequent); else if ($.get(selfClosing)) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}