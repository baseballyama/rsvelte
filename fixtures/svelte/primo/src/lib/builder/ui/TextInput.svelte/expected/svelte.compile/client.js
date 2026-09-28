import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';
import { tick, onMount, createEventDispatcher } from 'svelte';
import autosize from 'autosize';

var root = $.from_html(`<span class="primo--field-label svelte-a16uxj"> </span>`);
var root_1 = $.from_html(`<option class="svelte-a16uxj"> </option>`);
var root_2 = $.from_html(`<select class="options svelte-a16uxj"></select>`);
var root_3 = $.from_html(`<span class="prefix svelte-a16uxj"> </span>`);
var root_4 = $.from_html(`<textarea rows="1" class="svelte-a16uxj"></textarea>`);
var root_5 = $.from_html(`<input class="svelte-a16uxj"/>`);
var root_6 = $.from_html(`<button class="svelte-a16uxj"> </button>`);
var root_7 = $.from_html(`<label><!> <div style="display: flex;width: 100%;gap: 0.5rem;"><!> <div class="input-container svelte-a16uxj"><!> <!> <!></div></div></label>`);

export default function TextInput($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	/**
	 * @typedef {Object} Props
	 * @property {string | null} [id]
	 * @property {string | null} [label]
	 * @property {string} [prefix]
	 * @property {string} [prefix_icon]
	 * @property {any} value
	 * @property {string} [placeholder]
	 * @property {string} [variants]
	 * @property {string} [type]
	 * @property {boolean} [autofocus]
	 * @property {string} [selection]
	 * @property {boolean} [grow]
	 * @property {boolean} [disabled]
	 * @property {any} [options]
	 * @property {{ label: string, onclick?: function, type?: string, disabled?: boolean } | null} [button]
	 * @property {() => void} [oninput]?
	 * @property {() => void} [onblur]?
	 * @property {() => void} [onkeydown]?
	 * @property {() => void} [onfocus]?
	 */
	/** @type {Props} */
	let id = $.prop($$props, 'id', 3, null),
		label = $.prop($$props, 'label', 3, null),
		prefix = $.prop($$props, 'prefix', 3, ''),
		prefix_icon = $.prop($$props, 'prefix_icon', 3, ''),
		value = $.prop($$props, 'value', 15),
		placeholder = $.prop($$props, 'placeholder', 3, ''),
		variants = $.prop($$props, 'variants', 3, ''),
		type = $.prop($$props, 'type', 3, 'text'),
		autofocus = $.prop($$props, 'autofocus', 3, false),
		selection = $.prop($$props, 'selection', 15, ''),
		grow = $.prop($$props, 'grow', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		options = $.prop($$props, 'options', 19, () => []),
		button = $.prop($$props, 'button', 3, null),
		oninput = $.prop($$props, 'oninput', 3, () => {}),
		onblur = $.prop($$props, 'onblur', 3, () => {}),
		onkeydown = $.prop($$props, 'onkeydown', 3, () => {}),
		onfocus = $.prop($$props, 'onfocus', 3, () => {}),
		element = $.prop($$props, 'element', 15);

	let textarea_element = $.state(void 0);

	onMount(() => {
		if ($.get(textarea_element)) {
			autosize($.get(textarea_element));
		}

		// autofocus attribute doesn't work so doing this
		if (autofocus()) {
			tick().then(() => {
				($.get(textarea_element) || element())?.focus();
			});
		}
	});

	var label_1 = root_7();
	var node = $.child(label_1);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, label()));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if (label()) $$render(consequent);
		});
	}

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var select = root_2();

			$.each(select, 21, options, $.index, ($$anchor, option) => {
				var option_1 = root_1();
				var text_1 = $.only_child(option_1, true);
				var option_1_value = {};

				$.template_effect(() => {
					$.set_text(text_1, $.get(option).label);

					if (option_1_value !== (option_1_value = $.get(option).value)) {
						option_1.value = (option_1.__value = option_1_value) ?? '';
					}
				});

				$.append($$anchor, option_1);
			});

			$.reset(select);
			$.init_select(select);
			$.delegated('change', select, (e) => dispatch('select', { value: e?.target?.value }));
			$.bind_select_value(select, selection);
			$.append($$anchor, select);
		};

		$.if(node_1, ($$render) => {
			if (options().length > 0) $$render(consequent_1);
		});
	}

	var div_1 = $.sibling(node_1, 2);
	var node_2 = $.child(div_1);

	{
		var consequent_2 = ($$anchor) => {
			var span_1 = root_3();
			var text_2 = $.only_child(span_1, true);

			$.template_effect(() => $.set_text(text_2, prefix()));
			$.append($$anchor, span_1);
		};

		var consequent_3 = ($$anchor) => {
			Icon($$anchor, {
				get icon() {
					return prefix_icon();
				}
			});
		};

		$.if(node_2, ($$render) => {
			if (prefix()) $$render(consequent_2); else if (prefix_icon()) $$render(consequent_3, 1);
		});
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			var textarea = root_4();

			$.remove_textarea_child(textarea);
			$.bind_this(textarea, ($$value) => $.set(textarea_element, $$value), () => $.get(textarea_element));

			$.template_effect(() => {
				$.set_value(textarea, value());
				$.set_attribute(textarea, 'type', type());
				$.set_attribute(textarea, 'placeholder', placeholder());
				textarea.disabled = disabled();
			});

			$.event('focus', textarea, function (...$$args) {
				onfocus()?.apply(this, $$args);
			});

			$.delegated('input', textarea, ({ target }) => {
				value(target.value);
				oninput()(value());
			});

			$.event('blur', textarea, function (...$$args) {
				onblur()?.apply(this, $$args);
			});

			$.delegated('keydown', textarea, function (...$$args) {
				onkeydown()?.apply(this, $$args);
			});

			$.append($$anchor, textarea);
		};

		var alternate = ($$anchor) => {
			var input = root_5();

			$.remove_input_defaults(input);
			$.bind_this(input, ($$value) => element($$value), () => element());

			$.template_effect(() => {
				$.set_value(input, value());
				$.set_attribute(input, 'type', type());
				$.set_attribute(input, 'placeholder', placeholder());
				input.disabled = disabled();
			});

			$.event('focus', input, function (...$$args) {
				onfocus()?.apply(this, $$args);
			});

			$.delegated('input', input, ({ target }) => {
				value(target.value);

				// dispatch('input', value)
				oninput()(value());
			});

			$.delegated('change', input, ({ target }) => {
				value(target.value);

				// dispatch('input', value)
				oninput()(value());
			});

			$.event('blur', input, function (...$$args) {
				onblur()?.apply(this, $$args);
			});

			$.delegated('keydown', input, function (...$$args) {
				onkeydown()?.apply(this, $$args);
			});

			$.append($$anchor, input);
		};

		$.if(node_3, ($$render) => {
			if (grow()) $$render(consequent_4); else $$render(alternate, -1);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_5 = ($$anchor) => {
			var button_1 = root_6();
			var text_3 = $.only_child(button_1, true);

			$.template_effect(() => {
				$.set_attribute(button_1, 'type', button().type);
				button_1.disabled = button().disabled;
				$.set_text(text_3, button().label);
			});

			$.delegated('click', button_1, function (...$$args) {
				button().onclick?.apply(this, $$args);
			});

			$.append($$anchor, button_1);
		};

		$.if(node_4, ($$render) => {
			if (button()) $$render(consequent_5);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.reset(label_1);

	$.template_effect(() => {
		$.set_class(label_1, 1, `TextInput ${variants() ?? ''}`, 'svelte-a16uxj');
		$.set_attribute(label_1, 'id', id());
	});

	$.append($$anchor, label_1);
	$.pop();
}

$.delegate(['change', 'input', 'keydown', 'click']);