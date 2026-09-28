import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { DropdownMenuTriggerState } from "../menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import FloatingLayerAnchor from "$lib/bits/utilities/floating-layer/components/floating-layer-anchor.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'child',
	'children',
	'disabled',
	'type'
]);

var root = $.from_html(`<button><!></button>`);

export default function Menu_trigger($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		disabled = $.prop($$props, 'disabled', 3, false),
		type = $.prop($$props, 'type', 3, "button"),
		restProps = $.rest_props($$props, rest_excludes);

	const triggerState = DropdownMenuTriggerState.create({
		id: boxWith(() => id()),
		disabled: boxWith(() => disabled() ?? false),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props, { type: type() }));

	FloatingLayerAnchor($$anchor, {
		get id() {
			return id();
		},

		get ref() {
			return triggerState.opts.ref;
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
					var button = root();

					$.attribute_effect(button, () => ({ ...$.get(mergedProps) }));

					var node_2 = $.child(button);

					$.snippet(node_2, () => $$props.children ?? $.noop);
					$.reset(button);
					$.append($$anchor, button);
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