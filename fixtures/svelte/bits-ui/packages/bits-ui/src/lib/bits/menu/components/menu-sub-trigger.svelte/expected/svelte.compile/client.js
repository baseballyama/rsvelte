import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuSubTriggerState } from "../menu.svelte.js";
import FloatingLayerAnchor from "$lib/bits/utilities/floating-layer/components/floating-layer-anchor.svelte";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'disabled',
	'ref',
	'children',
	'child',
	'onSelect',
	'openDelay'
]);

var root = $.from_html(`<div><!></div>`);

export default function Menu_sub_trigger($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		ref = $.prop($$props, 'ref', 15, null),
		onSelect = $.prop($$props, 'onSelect', 3, noop),
		openDelay = $.prop($$props, 'openDelay', 3, 0),
		restProps = $.rest_props($$props, rest_excludes);

	const subTriggerState = MenuSubTriggerState.create({
		disabled: boxWith(() => disabled()),
		onSelect: boxWith(() => onSelect()),
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		openDelay: boxWith(() => openDelay())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, subTriggerState.props));

	FloatingLayerAnchor($$anchor, {
		get id() {
			return id();
		},

		get ref() {
			return subTriggerState.opts.ref;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var div = root();

					$.attribute_effect(div, () => ({ ...$.get(mergedProps) }));

					var node_2 = $.child(div);

					$.snippet(node_2, () => $$props.children ?? $.noop);
					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node, ($$render) => {
					if ($$props.child) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}