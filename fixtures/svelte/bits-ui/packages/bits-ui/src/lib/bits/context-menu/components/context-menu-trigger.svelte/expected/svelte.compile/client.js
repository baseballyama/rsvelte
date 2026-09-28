import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { ContextMenuTriggerState } from "$lib/bits/menu/menu.svelte.js";
import { useId } from "$lib/internal/use-id.js";
import { FloatingLayer } from "$lib/bits/utilities/floating-layer/index.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'child',
	'children',
	'disabled'
]);

var root = $.from_html(`<div><!></div>`);

export default function Context_menu_trigger($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, useId),
		ref = $.prop($$props, 'ref', 15, null),
		disabled = $.prop($$props, 'disabled', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const triggerState = ContextMenuTriggerState.create({
		id: boxWith(() => id()),
		disabled: boxWith(() => disabled()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props, { style: { pointerEvents: "auto" } }, { style: $$props.style, tabindex: $$props.tabindex }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => FloatingLayer.Anchor, ($$anchor, FloatingLayer_Anchor) => {
		FloatingLayer_Anchor($$anchor, {
			get id() {
				return id();
			},

			get virtualEl() {
				return triggerState.virtualElement;
			},

			get ref() {
				return triggerState.opts.ref;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.snippet(node_2, () => $$props.child, () => ({ props: $.get(mergedProps) }));
						$.append($$anchor, fragment_2);
					};

					var alternate = ($$anchor) => {
						var div = root();

						$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

						var node_3 = $.child(div);

						$.snippet(node_3, () => $$props.children ?? $.noop);
						$.reset(div);
						$.append($$anchor, div);
					};

					$.if(node_1, ($$render) => {
						if ($$props.child) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}