import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { LinkPreviewTriggerState } from "../link-preview.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { FloatingLayer } from "$lib/bits/utilities/floating-layer/index.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'id',
	'child',
	'children'
]);

var root = $.from_html(`<a><!></a>`);

export default function Link_preview_trigger($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		restProps = $.rest_props($$props, rest_excludes);

	const triggerState = LinkPreviewTriggerState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => FloatingLayer.Anchor, ($$anchor, FloatingLayer_Anchor) => {
		FloatingLayer_Anchor($$anchor, {
			get id() {
				return id();
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
						var a = root();

						$.attribute_effect(a, () => ({ ...$.get(mergedProps) }));

						var node_3 = $.child(a);

						$.snippet(node_3, () => $$props.children ?? $.noop);
						$.reset(a);
						$.append($$anchor, a);
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