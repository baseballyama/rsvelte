import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith } from "svelte-toolbelt";
import { noop } from "$lib/internal/noop.js";
import FloatingLayer from "$lib/bits/utilities/floating-layer/components/floating-layer.svelte";
import { SelectRootState } from "$lib/bits/select/select.svelte.js";
import ListboxHiddenInput from "$lib/bits/select/components/select-hidden-input.svelte";
import { watch } from "runed";

var root = $.from_html(`<!> <!>`, 1);

export default function Combobox($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		onValueChange = $.prop($$props, 'onValueChange', 3, noop),
		name = $.prop($$props, 'name', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		open = $.prop($$props, 'open', 15, false),
		onOpenChange = $.prop($$props, 'onOpenChange', 3, noop),
		onOpenChangeComplete = $.prop($$props, 'onOpenChangeComplete', 3, noop),
		loop = $.prop($$props, 'loop', 3, false),
		scrollAlignment = $.prop($$props, 'scrollAlignment', 3, "nearest"),
		required = $.prop($$props, 'required', 3, false),
		items = $.prop($$props, 'items', 19, () => []),
		allowDeselect = $.prop($$props, 'allowDeselect', 3, true),
		inputValue = $.prop($$props, 'inputValue', 7, "");

	if (value() === undefined) {
		const defaultValue = $$props.type === "single" ? "" : [];

		value(defaultValue);
	}

	watch.pre(() => value(), () => {
		if (value() !== undefined) return;

		value($$props.type === "single" ? "" : []);
	});

	const rootState = SelectRootState.create({
		type: $$props.type,
		value: boxWith(() => value(), (v) => {
			value(v);

			// @ts-expect-error - we know
			onValueChange()(v);
		}),
		disabled: boxWith(() => disabled()),
		required: boxWith(() => required()),
		open: boxWith(() => open(), (v) => {
			open(v);
			onOpenChange()(v);
		}),
		loop: boxWith(() => loop()),
		scrollAlignment: boxWith(() => scrollAlignment()),
		name: boxWith(() => name()),
		isCombobox: true,
		items: boxWith(() => items()),
		allowDeselect: boxWith(() => allowDeselect()),
		inputValue: boxWith(() => inputValue(), (v) => inputValue(v)),
		onOpenChangeComplete: boxWith(() => onOpenChangeComplete())
	});

	var fragment = root();
	var node = $.first_child(fragment);

	FloatingLayer(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_3 = $.first_child(fragment_2);

			{
				var consequent = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.each(node_4, 16, () => rootState.opts.value.current, (item) => item, ($$anchor, item) => {
						ListboxHiddenInput($$anchor, {
							get value() {
								return item;
							}
						});
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_3, ($$render) => {
					if (rootState.opts.value.current.length) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_2);
		};

		var d = $.derived(() => Array.isArray(rootState.opts.value.current));

		var alternate = ($$anchor) => {
			ListboxHiddenInput($$anchor, {
				get value() {
					return rootState.opts.value.current;
				},

				set value($$value) {
					rootState.opts.value.current = $$value;
				}
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}