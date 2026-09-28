import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { SuggestDropdown } from "@svar-ui/svelte-core";

var root = $.from_html(`<input class="wx-input svelte-19odm8k"/> <!>`, 1);

export default function Combo($$anchor, $$props) {
	$.push($$props, true);

	let tmp = $$props.editor,
		value = $.proxy(tmp.value),
		text = $.state($.proxy(tmp.renderedValue)),
		filterOptions = $.state($.proxy(tmp.options));

	let tmp_1 = $$props.editor?.config || {},
		template = $.proxy(tmp_1.template),
		cell = $.proxy(tmp_1.cell),
		dropdown = $.proxy($.fallback(tmp_1.dropdown, () => ({}), true));

	const dropdownOptions = $.derived(() => ({ trackScroll: true, ...dropdown }));
	let index = $.derived(() => $.get(filterOptions).findIndex((a) => a.id === value));

	function updateValue({ id }) {
		$$props.onapply(id);
		$$props.onsave();
	}

	let navigate;
	let keydown = $.state(void 0);

	function ready(ev) {
		navigate = ev.navigate;
		$.set(keydown, ev.keydown, true);
		navigate($.get(index));
	}

	function input() {
		$.set(
			filterOptions,
			$.get(text)
				? $$props.editor.options.filter((i) => i.label.toLowerCase().includes($.get(text).toLowerCase()))
				: $$props.editor.options,
			true
		);

		if ($.get(filterOptions).length) navigate(-Infinity); else navigate(null);
	}

	let node = $.state(void 0);

	onMount(() => {
		$.get(node).focus();
	});

	var fragment = root();
	var input_1 = $.first_child(fragment);

	$.remove_input_defaults(input_1);
	$.bind_this(input_1, ($$value) => $.set(node, $$value), () => $.get(node));

	var node_1 = $.sibling(input_1, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let option = () => ($$arg0?.()).option;
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var text_1 = $.text();

					$.template_effect(($0) => $.set_text(text_1, $0), [() => template(option())]);
					$.append($$anchor, text_1);
				};

				var consequent_1 = ($$anchor) => {
					const SvelteComponent_1 = $.derived(() => cell);
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					$.component(node_3, () => $.get(SvelteComponent_1), ($$anchor, SvelteComponent_1_1) => {
						SvelteComponent_1_1($$anchor, {
							get data() {
								return option();
							},

							get onaction() {
								return $$props.onaction;
							}
						});
					});

					$.append($$anchor, fragment_3);
				};

				var alternate = ($$anchor) => {
					var text_2 = $.text();

					$.template_effect(() => $.set_text(text_2, option().label));
					$.append($$anchor, text_2);
				};

				$.if(node_2, ($$render) => {
					if (template) $$render(consequent); else if (cell) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		SuggestDropdown(node_1, $.spread_props(
			{
				get items() {
					return $.get(filterOptions);
				},
				onready: ready,
				onselect: updateValue
			},
			() => $.get(dropdownOptions),
			{
				oncancel: () => $$props.oncancel(true),
				children,
				$$slots: { default: true }
			}
		));
	}

	$.delegated('input', input_1, input);
	$.delegated('keydown', input_1, (e) => $.get(keydown)(e, $.get(index)));
	$.bind_value(input_1, () => $.get(text), ($$value) => $.set(text, $$value));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['input', 'keydown']);