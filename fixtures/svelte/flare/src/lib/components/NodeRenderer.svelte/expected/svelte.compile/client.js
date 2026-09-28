import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { componentMap } from '$lib/nodes';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'nodeId',
	'uiTree',
	'onDispatch'
]);

var root = $.from_html(`<div class="p-2 text-xs text-red-500"> </div>`);

export default function NodeRenderer($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const node = $.derived(() => $$props.uiTree.get($$props.nodeId));
	const Component = $.derived(() => $.get(node) ? componentMap.get($.get(node).type) : null);
	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => $.get(Component), ($$anchor, Component_1) => {
				Component_1($$anchor, $.spread_props(
					{
						get nodeId() {
							return $$props.nodeId;
						},

						get uiTree() {
							return $$props.uiTree;
						},

						get onDispatch() {
							return $$props.onDispatch;
						}
					},
					() => restProps
				));
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_1 = ($$anchor) => {
			var div = root();
			var text = $.only_child(div);

			$.template_effect(() => $.set_text(text, `Unknown component type: ${$.get(node).type ?? ''}`));
			$.append($$anchor, div);
		};

		$.if(node_1, ($$render) => {
			if ($.get(node) && $.get(Component)) $$render(consequent); else if ($.get(node)) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}