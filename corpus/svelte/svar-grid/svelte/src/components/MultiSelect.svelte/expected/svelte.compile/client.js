import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { SuggestDropdown } from "@svar-ui/svelte-core";

var root = $.from_html(`<span class="wx-text svelte-nmwr83"> </span>`);
var root_1 = $.from_html(`<span class="wx-placeholder svelte-nmwr83"> </span>`);
var root_2 = $.from_html(`<i class="wx-icon wxi-close svelte-nmwr83"></i>`);
var root_3 = $.from_html(`<i class="wx-icon wxi-angle-down svelte-nmwr83"></i>`);
var root_4 = $.from_html(`<div class="wx-option svelte-nmwr83"><!></div>`);
var root_5 = $.from_html(`<div class="wx-multiselect svelte-nmwr83" tabindex="0"><div class="wx-label svelte-nmwr83"><!></div> <!> <!></div>`);

export default function MultiSelect($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 31, () => $.proxy([])),
		options = $.prop($$props, 'options', 19, () => []),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		clear = $.prop($$props, 'clear', 3, false),
		text = $.prop($$props, 'text', 3, null),
		template = $.prop($$props, 'template', 3, null),
		cell = $.prop($$props, 'cell', 3, null),
		dropdown = $.prop($$props, 'dropdown', 19, () => ({})),
		autoOpen = $.prop($$props, 'autoOpen', 3, false);

	const selected = $.derived(() => (value() || []).map((id) => options().find((o) => o.id === id)).filter(Boolean));
	let node = $.state(void 0);
	let navigate;
	let keydown;

	function ready(ev) {
		navigate = ev.navigate;
		keydown = ev.keydown;

		if (autoOpen()) navigate(index());
	}

	onMount(() => {
		if (autoOpen()) {
			$.get(node)?.focus();

			if (window?.getSelection) window.getSelection().removeAllRanges();
		}
	});

	const index = () => {
		const v = value() || [];

		if (!v.length) return 0;

		const firstSelected = options().find((o) => v.includes(o.id));

		return firstSelected ? options().indexOf(firstSelected) : 0;
	};

	function select({ id }) {
		value(id);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function unselect(ev) {
		ev.stopPropagation();
		value([]);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function onclick() {
		navigate?.(index());
	}

	function oncancel() {
		navigate?.(null);
	}

	var div = root_5();
	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var text_1 = $.text();

			$.template_effect(($0) => $.set_text(text_1, $0), [() => template()($.get(selected))]);
			$.append($$anchor, text_1);
		};

		var consequent_1 = ($$anchor) => {
			const CellComponent = $.derived(cell);
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => $.get(CellComponent), ($$anchor, CellComponent_1) => {
				CellComponent_1($$anchor, {
					get data() {
						return $.get(selected);
					},

					get onaction() {
						return $$props.onaction;
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_2 = ($$anchor) => {
			var span = root();
			var text_2 = $.only_child(span, true);

			$.template_effect(() => $.set_text(text_2, text()));
			$.append($$anchor, span);
		};

		var consequent_3 = ($$anchor) => {
			var span_1 = root();
			var text_3 = $.only_child(span_1, true);

			$.template_effect(($0) => $.set_text(text_3, $0), [() => $.get(selected).map((s) => s.label).join(", ")]);
			$.append($$anchor, span_1);
		};

		var consequent_4 = ($$anchor) => {
			var span_2 = root_1();
			var text_4 = $.only_child(span_2, true);

			$.template_effect(() => $.set_text(text_4, placeholder()));
			$.append($$anchor, span_2);
		};

		var alternate = ($$anchor) => {
			var text_5 = $.text(' ');

			$.append($$anchor, text_5);
		};

		$.if(node_1, ($$render) => {
			if (template()) $$render(consequent); else if (cell()) $$render(consequent_1, 1); else if (text()) $$render(consequent_2, 2); else if ($.get(selected).length) $$render(consequent_3, 3); else if (placeholder()) $$render(consequent_4, 4); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_5 = ($$anchor) => {
			var i = root_2();

			$.delegated('click', i, unselect);
			$.append($$anchor, i);
		};

		var alternate_1 = ($$anchor) => {
			var i_1 = root_3();

			$.append($$anchor, i_1);
		};

		$.if(node_3, ($$render) => {
			if (clear() && value()?.length) $$render(consequent_5); else $$render(alternate_1, -1);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let option = () => ($$arg0?.()).option;
			var div_2 = root_4();
			var node_5 = $.child(div_2);

			{
				var consequent_6 = ($$anchor) => {
					var text_6 = $.text();

					$.template_effect(($0) => $.set_text(text_6, $0), [() => template()(option())]);
					$.append($$anchor, text_6);
				};

				var consequent_7 = ($$anchor) => {
					const CellComponent = $.derived(cell);
					var fragment_3 = $.comment();
					var node_6 = $.first_child(fragment_3);

					$.component(node_6, () => $.get(CellComponent), ($$anchor, CellComponent_2) => {
						CellComponent_2($$anchor, {
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

				var alternate_2 = ($$anchor) => {
					var text_7 = $.text();

					$.template_effect(() => $.set_text(text_7, option().label));
					$.append($$anchor, text_7);
				};

				$.if(node_5, ($$render) => {
					if (template()) $$render(consequent_6); else if (cell()) $$render(consequent_7, 1); else $$render(alternate_2, -1);
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		let $0 = $.derived(() => value() || []);

		SuggestDropdown(node_4, $.spread_props(
			{
				get items() {
					return options();
				},
				onready: ready,
				onselect: select,
				multiselect: true,
				checkboxes: true,
				get value() {
					return $.get($0);
				},
				oncancel
			},
			dropdown,
			{ children, $$slots: { default: true } }
		));
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(node, $$value), () => $.get(node));
	$.delegated('click', div, onclick);
	$.delegated('keydown', div, (ev) => keydown?.(ev, index()));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);