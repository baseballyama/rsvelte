import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List from "./helpers/SuggestDropdown.svelte";
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<i class="wx-icon wxi-close svelte-k28o9d"></i>`);
var root_1 = $.from_html(`<div class="wx-tag svelte-k28o9d"><!> <!></div>`);
var root_2 = $.from_html(`<div><div class="wx-wrapper svelte-k28o9d"><div class="wx-tags svelte-k28o9d"></div> <div class="wx-select svelte-k28o9d"><input type="text" class="svelte-k28o9d"/> <i class="wx-icon wxi-angle-down svelte-k28o9d"></i></div></div> <!></div>`);

export default function MultiCombo($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 31, () => $.proxy([])),
		options = $.prop($$props, 'options', 19, () => []),
		textOptions = $.prop($$props, 'textOptions', 3, null),
		textField = $.prop($$props, 'textField', 3, "label"),
		keepText = $.prop($$props, 'keepText', 3, false),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		checkboxes = $.prop($$props, 'checkboxes', 3, false),
		css = $.prop($$props, 'css', 3, ""),
		dropdown = $.prop($$props, 'dropdown', 19, () => ({}));

	const inputId = $.proxy(getInputId($$props.id));
	let text = $.state("");

	let selected = $.derived(() => value()
		? (textOptions() || options()).filter((i) => value().includes(i.id))
		: []);

	let filterOptions = $.derived(() => {
		const o = options();

		return $.get(text)
			? o.filter((i) => i[textField()].toLowerCase().includes($.get(text).toLowerCase()))
			: o;
	});

	let focus = $.state(false);
	let inputElement = $.state(void 0);
	let navigate = null;
	let keydown = null;

	function onready(ev) {
		navigate = ev.navigate;
		keydown = ev.keydown;
	}

	function input() {
		if ($.get(filterOptions).length) navigate(0); else navigate(null);
	}

	function onselect(ev) {
		const { id } = ev;

		if (id) {
			value(id);

			if (!keepText()) $.set(text, "");

			$$props.onchange && $$props.onchange({ value: id });
			$.get(inputElement).focus();
		}
	}

	function remove(id, ev) {
		if (ev) ev.stopPropagation();

		value(value().filter((i) => i !== id));
		$$props.onchange && $$props.onchange({ value: value() });
	}

	const index = () => value() && value().length
		? $.get(filterOptions).findIndex((i) => i.id === value()[0])
		: 0;

	function onclick() {
		if (!disabled()) {
			$.get(inputElement).focus();
			navigate(index());
		}
	}

	var div = root_2();
	let classes;
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.each(div_2, 21, () => $.get(selected), (tag) => tag.id, ($$anchor, tag) => {
		var div_3 = root_1();
		var node = $.child(div_3);

		{
			var consequent = ($$anchor) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.snippet(node_1, () => $$props.children, () => ({ option: $.get(tag) }));
				$.append($$anchor, fragment);
			};

			var alternate = ($$anchor) => {
				var text_1 = $.text();

				$.template_effect(() => $.set_text(text_1, $.get(tag)[textField()]));
				$.append($$anchor, text_1);
			};

			$.if(node, ($$render) => {
				if ($$props.children) $$render(consequent); else $$render(alternate, -1);
			});
		}

		var node_2 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var i_1 = root();

				$.delegated('click', i_1, (ev) => remove($.get(tag).id, ev));
				$.append($$anchor, i_1);
			};

			$.if(node_2, ($$render) => {
				if (!disabled()) $$render(consequent_1);
			});
		}

		$.reset(div_3);
		$.append($$anchor, div_3);
	});

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var input_1 = $.child(div_4);

	$.remove_input_defaults(input_1);
	$.bind_this(input_1, ($$value) => $.set(inputElement, $$value), () => $.get(inputElement));
	$.next(2);
	$.reset(div_4);
	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let option = () => ($$arg0?.()).option;
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					{
						var consequent_2 = ($$anchor) => {
							$$props.children($$anchor, () => ({ option: option() }));
						};

						var alternate_1 = ($$anchor) => {
							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, option()[textField()]));
							$.append($$anchor, text_2);
						};

						$.if(node_4, ($$render) => {
							if ($$props.children) $$render(consequent_2); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_3);
				};

				List($$anchor, $.spread_props(
					{
						get items() {
							return $.get(filterOptions);
						},
						multiselect: true,
						onready,
						onselect,
						get checkboxes() {
							return checkboxes();
						},

						get value() {
							return value();
						}
					},
					dropdown,
					{ children, $$slots: { default: true } }
				));
			}
		};

		$.if(node_3, ($$render) => {
			if (!disabled()) $$render(consequent_3);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div, 'title', title());

		classes = $.set_class(div, 1, `wx-multicombo ${css() ?? ''}`, 'svelte-k28o9d', classes, {
			'wx-error': error(),
			'wx-disabled': disabled(),
			'wx-not-empty': $.get(selected).length,
			'wx-focus': $.get(focus) && !disabled()
		});

		$.set_attribute(div, 'data-tooltip-text', $$props.tooltip);
		$.set_attribute(input_1, 'id', inputId);
		$.set_attribute(input_1, 'placeholder', placeholder());
		input_1.disabled = disabled();
	});

	$.delegated('click', div, onclick);
	$.delegated('keydown', div, (ev) => keydown(ev, index()));
	$.delegated('input', input_1, input);
	$.event('focus', input_1, () => $.set(focus, true));
	$.event('blur', input_1, () => $.set(focus, false));
	$.bind_value(input_1, () => $.get(text), ($$value) => $.set(text, $$value));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown', 'input']);