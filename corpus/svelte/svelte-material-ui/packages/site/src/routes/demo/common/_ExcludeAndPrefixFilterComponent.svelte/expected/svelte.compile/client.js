import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { exclude, prefixFilter } from '@smui/common/internal';
import Button from '@smui/button';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'button$class',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function _ExcludeAndPrefixFilterComponent($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		button$class = $.prop($$props, 'button$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(div, ($0) => ({ class: `my-component ${className() ?? ''}`, ...$0 }), [() => exclude(restProps, ['button$'])]);

	var node = $.child(div);

	{
		let $0 = $.derived(() => prefixFilter(restProps, 'button$'));

		Button(node, $.spread_props(
			{
				get class() {
					return `button ${button$class() ?? ''}`;
				}
			},
			() => $.get($0),
			{
				children: ($$anchor, $$slotProps) => {
					var fragment = $.comment();
					var node_1 = $.first_child(fragment);

					$.snippet(node_1, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment);
				},
				$$slots: { default: true }
			}
		));
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}