import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PopoverTriggerState } from "../popover.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import FloatingLayerAnchor from "$lib/bits/utilities/floating-layer/components/floating-layer-anchor.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'id',
	'ref',
	'type',
	'disabled',
	'openOnHover',
	'openDelay',
	'closeDelay'
]);

var root = $.from_html(`<button><!></button>`);

export default function Popover_trigger($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		type = $.prop($$props, 'type', 3, "button"),
		disabled = $.prop($$props, 'disabled', 3, false),
		openOnHover = $.prop($$props, 'openOnHover', 3, false),
		openDelay = $.prop($$props, 'openDelay', 3, 700),
		closeDelay = $.prop($$props, 'closeDelay', 3, 300),
		restProps = $.rest_props($$props, rest_excludes);

	const triggerState = PopoverTriggerState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		disabled: boxWith(() => Boolean(disabled())),
		openOnHover: boxWith(() => openOnHover()),
		openDelay: boxWith(() => openDelay()),
		closeDelay: boxWith(() => closeDelay())
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