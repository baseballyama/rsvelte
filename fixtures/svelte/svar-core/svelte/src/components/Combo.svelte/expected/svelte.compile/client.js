import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List from "./helpers/SuggestDropdown.svelte";
import { getInputId } from "./helpers/getInputId.js";

var root = $.from_html(`<i class="wx-icon wxi-close svelte-7wd1iy"></i>`);
var root_1 = $.from_html(`<i class="wx-icon wxi-angle-down svelte-7wd1iy"></i>`);
var root_2 = $.from_html(`<div><input/> <!> <!></div>`);

export default function Combo($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15, ""),
		options = $.prop($$props, 'options', 19, () => []),
		textOptions = $.prop($$props, 'textOptions', 3, null),
		textField = $.prop($$props, 'textField', 3, "label"),
		placeholder = $.prop($$props, 'placeholder', 3, ""),
		title = $.prop($$props, 'title', 3, ""),
		disabled = $.prop($$props, 'disabled', 3, false),
		error = $.prop($$props, 'error', 3, false),
		clear = $.prop($$props, 'clear', 3, false),
		css = $.prop($$props, 'css', 3, ""),
		dropdown = $.prop($$props, 'dropdown', 19, () => ({}));

	const inputId = $.proxy(getInputId($$props.id));
	let filterActive = $.state(false);
	let textInput = $.state("");

	let text = $.derived(() => {
		if ($.get(filterActive)) return $.get(textInput);

		if (value() || value() === 0) {
			const option = (textOptions() || options()).find((a) => a.id === value());

			if (option) return option[textField()];
		}

		return "";
	});

	let filteredOptions = $.derived(() => {
		if (!$.get(text) || !$.get(filterActive)) return options();

		return options().filter((i) => i[textField()].toLowerCase().includes($.get(text).toLowerCase()));
	});

	let navigate;
	let keydown;

	function ready(ev) {
		navigate = ev.navigate;
		keydown = ev.keydown;
	}

	const index = () => $.get(filteredOptions).findIndex((a) => a.id === value());
	const onclick = () => navigate(index());
	const onkeydown = (e) => keydown(e, index());

	function selectByEvent({ id }) {
		doSelect(id, true);
	}

	function selectByText(chunk) {
		if (!options().length) return;

		if (chunk === "" && clear()) {
			doUnselect();

			return;
		}

		let res = options().find((i) => i[textField()] === chunk);

		if (!res) {
			res = options().find((i) => i[textField()].toLowerCase().includes(chunk.toLowerCase()));
		}

		const id = res ? res.id : value() || options()[0].id;

		doSelect(id, false);
	}

	function doSelect(id, effects) {
		if (id || id === 0) {
			let selected = options().find((a) => a.id === id);

			$.set(filterActive, false);

			if (effects) navigate(null);

			if (selected && value() !== selected.id) {
				value(selected.id);
				$$props.onchange && $$props.onchange({ value: value() });
			}
		}

		if (!hasFocus && effects) inputElement.focus();
	}

	function doUnselect(ev) {
		if (ev) ev.stopPropagation();

		value("");
		$.set(filterActive, false);
		$$props.onchange && $$props.onchange({ value: value() });
	}

	function oninput() {
		$.set(textInput, inputElement.value, true);
		$.set(filterActive, true);

		if ($.get(filteredOptions).length) navigate(0);
	}

	let inputElement;
	let hasFocus;

	function onfocus() {
		hasFocus = true;
	}

	function onblur() {
		hasFocus = false;

		setTimeout(
			() => {
				if (!hasFocus) selectByText($.get(text));
			},
			200
		);
	}

	var div = root_2();
	var input = $.child(div);

	$.remove_input_defaults(input);

	let classes;

	$.bind_this(input, ($$value) => inputElement = $$value, () => inputElement);

	var node = $.sibling(input, 2);

	{
		var consequent = ($$anchor) => {
			var i_1 = root();

			$.delegated('click', i_1, doUnselect);
			$.append($$anchor, i_1);
		};

		var alternate = ($$anchor) => {
			var i_2 = root_1();

			$.append($$anchor, i_2);
		};

		$.if(node, ($$render) => {
			if (clear() && !disabled() && value()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let option = () => ($$arg0?.()).option;
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.snippet(node_3, () => $$props.children, () => ({ option: option() }));
							$.append($$anchor, fragment_2);
						};

						var alternate_1 = ($$anchor) => {
							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, option()[textField()]));
							$.append($$anchor, text_1);
						};

						$.if(node_2, ($$render) => {
							if ($$props.children) $$render(consequent_1); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_1);
				};

				List($$anchor, $.spread_props(
					{
						get items() {
							return $.get(filteredOptions);
						},
						onready: ready,
						onselect: selectByEvent
					},
					dropdown,
					{ children, $$slots: { default: true } }
				));
			}
		};

		$.if(node_1, ($$render) => {
			if (!disabled()) $$render(consequent_2);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `wx-combo ${css() ?? ''}`, 'svelte-7wd1iy');
		$.set_attribute(div, 'title', title());
		$.set_attribute(div, 'data-tooltip-text', $$props.tooltip);
		$.set_attribute(input, 'id', inputId);
		$.set_value(input, $.get(text));
		input.disabled = disabled();
		$.set_attribute(input, 'placeholder', placeholder());
		classes = $.set_class(input, 1, 'svelte-7wd1iy', null, classes, { 'wx-error': error() });
	});

	$.delegated('click', div, onclick);
	$.delegated('keydown', div, onkeydown);
	$.event('focus', input, onfocus);
	$.event('blur', input, onblur);
	$.delegated('input', input, oninput);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown', 'input']);