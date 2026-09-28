import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FloatingLayer from "$lib/bits/utilities/floating-layer/components/floating-layer.svelte";
import { noop } from "$lib/internal/noop.js";
import { boxWith } from "svelte-toolbelt";
import { SelectRootState } from "../select.svelte.js";
import SelectHiddenInput from "./select-hidden-input.svelte";
import { watch } from "runed";

var root = $.from_html(`<!> <!>`, 1);

export default function Select($$anchor, $$props) {
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
		allowDeselect = $.prop($$props, 'allowDeselect', 3, false);

	function handleDefaultValue() {
		if (value() !== undefined) return;

		value($$props.type === "single" ? "" : []);
	}

	// SSR
	handleDefaultValue();

	watch.pre(() => value(), () => {
		handleDefaultValue();
	});

	let inputValue = $.state("");

	const rootState = SelectRootState.create({
		type: $$props.type,
		value: boxWith(() => value(), (v) => {
			value(v);

			// oxlint-disable-next-line no-explicit-any
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
		isCombobox: false,
		items: boxWith(() => items()),
		allowDeselect: boxWith(() => allowDeselect()),
		inputValue: boxWith(() => $.get(inputValue), (v) => $.set(inputValue, v, true)),
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
					SelectHiddenInput($$anchor, {
						get autocomplete() {
							return $$props.autocomplete;
						}
					});
				};

				var alternate = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_4 = $.first_child(fragment_4);

					$.each(node_4, 16, () => rootState.opts.value.current, (item) => item, ($$anchor, item) => {
						SelectHiddenInput($$anchor, {
							get value() {
								return item;
							},

							get autocomplete() {
								return $$props.autocomplete;
							}
						});
					});

					$.append($$anchor, fragment_4);
				};

				$.if(node_3, ($$render) => {
					if (rootState.opts.value.current.length === 0) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_2);
		};

		var d = $.derived(() => Array.isArray(rootState.opts.value.current));

		var alternate_1 = ($$anchor) => {
			SelectHiddenInput($$anchor, {
				get autocomplete() {
					return $$props.autocomplete;
				},

				get value() {
					return rootState.opts.value.current;
				},

				set value($$value) {
					rootState.opts.value.current = $$value;
				}
			});
		};

		$.if(node_2, ($$render) => {
			if ($.get(d)) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}