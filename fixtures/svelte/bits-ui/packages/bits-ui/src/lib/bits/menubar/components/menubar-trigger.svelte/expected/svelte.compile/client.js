import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { attachRef, boxWith, mergeProps } from "svelte-toolbelt";
import { MenubarTriggerState } from "../menubar.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import FloatingLayerAnchor from "$lib/bits/utilities/floating-layer/components/floating-layer-anchor.svelte";
import { DropdownMenuTriggerState } from "$lib/bits/menu/menu.svelte.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'disabled',
	'children',
	'child',
	'ref'
]);

var root = $.from_html(`<button><!></button>`);

export default function Menubar_trigger($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		disabled = $.prop($$props, 'disabled', 3, false),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const triggerState = MenubarTriggerState.create({
		id: boxWith(() => id()),
		disabled: boxWith(() => disabled() ?? false),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const dropdownTriggerState = DropdownMenuTriggerState.create(triggerState.opts);
	const triggerAttachment = attachRef((v) => dropdownTriggerState.parentMenu.triggerNode = v);
	const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props, { ...triggerAttachment }));

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