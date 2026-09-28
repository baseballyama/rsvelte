import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { useId } from "$lib/internal/use-id.js";
import { FloatingLayer } from "$lib/bits/utilities/floating-layer/index.js";
import { SelectInputState } from "$lib/bits/select/select.svelte.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'child',
	'defaultValue',
	'clearOnDeselect'
]);

var root = $.from_html(`<input/>`);

export default function Combobox_input($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, useId),
		ref = $.prop($$props, 'ref', 15, null),
		clearOnDeselect = $.prop($$props, 'clearOnDeselect', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const inputState = SelectInputState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		clearOnDeselect: boxWith(() => clearOnDeselect())
	});

	if ($$props.defaultValue) {
		inputState.root.opts.inputValue.current = $$props.defaultValue;
	}

	const mergedProps = $.derived(() => mergeProps(restProps, inputState.props, { value: inputState.root.opts.inputValue.current }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => FloatingLayer.Anchor, ($$anchor, FloatingLayer_Anchor) => {
		FloatingLayer_Anchor($$anchor, {
			get id() {
				return id();
			},

			get ref() {
				return inputState.opts.ref;
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
						var input = root();

						$.attribute_effect(input, () => ({ ...$.get(mergedProps) }), void 0, void 0, void 0, void 0, true);
						$.append($$anchor, input);
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