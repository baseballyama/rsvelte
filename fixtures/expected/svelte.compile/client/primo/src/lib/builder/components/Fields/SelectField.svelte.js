import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPicker from '../../components/IconPicker.svelte';
import UI from '../../ui/index.js';
import Icon from '@iconify/svelte';
import { createEventDispatcher } from 'svelte';

var root = $.from_html(`<button class="svelte-1r2bcda"><!></button>`);
var root_1 = $.from_html(`<div class="select-field svelte-1r2bcda"><div class="option-icon svelte-1r2bcda"><span class="primo--field-label">Icon</span> <!></div> <!> <!> <div class="item-options svelte-1r2bcda"><!> <!> <button style="color: var(--primo-color-danger)" class="svelte-1r2bcda"><!></button></div></div>`);
var root_2 = $.from_html(`<div class="SelectField svelte-1r2bcda"><!> <button class="field-button subfield-button svelte-1r2bcda"><!> Create Option</button></div>`);

export default function SelectField($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	// Manage options separately since field.config keeps getting reset
	let options = $.state($.proxy($$props.field.config?.options || []));

	function addOption() {
		$.set(options, [...$.get(options), { value: '', label: '', icon: '' }], true);
		dispatch('input', { config: { options: $.get(options) } });
	}

	function validateFieldKey(key) {
		// replace dash and space with underscore
		return key.replace(/-/g, '_').replace(/ /g, '_').toLowerCase();
	}

	// track focused value inputs to auto-fill values when unedited
	const clicked_value_inputs = new Set();

	function deleteOption(index) {
		// Remove option
		$.set(options, $.get(options).filter((_, i) => i !== index), true);

		// Reindex clicked inputs to keep behavior stable after deletion
		const nextClicked = new Set();

		clicked_value_inputs.forEach((i) => {
			if (i < index) nextClicked.add(i); else if (i > index) nextClicked.add(i - 1);
		});

		clicked_value_inputs.clear();
		nextClicked.forEach((i) => clicked_value_inputs.add(i));

		// Notify parent of config change
		dispatch('input', { config: { options: $.get(options) } });
	}

	function swap(arr, a, b) {
		const next = [...arr];

		[next[a], next[b]] = [next[b], next[a]];

		return next;
	}

	function swap_clicked_indices(a, b) {
		const hasA = clicked_value_inputs.has(a);
		const hasB = clicked_value_inputs.has(b);

		if (!hasA && !hasB) return;
		if (hasA) clicked_value_inputs.delete(a);
		if (hasB) clicked_value_inputs.delete(b);
		if (hasA) clicked_value_inputs.add(b);
		if (hasB) clicked_value_inputs.add(a);
	}

	function moveOptionUp(index) {
		if (index <= 0) return;

		$.set(options, swap($.get(options), index, index - 1), true);
		swap_clicked_indices(index, index - 1);
		dispatch('input', { config: { options: $.get(options) } });
	}

	function moveOptionDown(index) {
		if (index >= $.get(options).length - 1) return;

		$.set(options, swap($.get(options), index, index + 1), true);
		swap_clicked_indices(index, index + 1);
		dispatch('input', { config: { options: $.get(options) } });
	}

	var div = root_2();
	var node = $.child(div);

	$.each(node, 17, () => $.get(options), $.index, ($$anchor, option, i) => {
		var div_1 = root_1();
		var div_2 = $.child(div_1);
		var node_1 = $.sibling($.child(div_2), 2);

		{
			let $0 = $.derived(() => $.get(option).icon || 'ri:checkbox-blank-circle-fill');

			IconPicker(node_1, {
				variant: 'small',
				get search_query() {
					return $.get(option).label;
				},

				get icon() {
					return $.get($0);
				},

				$$events: {
					input: ({ detail: icon }) => {
						($.get(option).icon = icon);
						dispatch('input', { config: { options: $.get(options) } });
					}
				}
			});
		}

		$.reset(div_2);

		var node_2 = $.sibling(div_2, 2);

		{
			let $0 = $.derived(() => !$.get(option).label || $.get(option).label.length === 0);

			$.component(node_2, () => UI.TextInput, ($$anchor, UI_TextInput) => {
				UI_TextInput($$anchor, {
					label: 'Option Label',
					get value() {
						return $.get(option).label;
					},

					get autofocus() {
						return $.get($0);
					},

					oninput: (text) => {
						(
							$.get(option).value = clicked_value_inputs.has(i) ? $.get(option).value : validateFieldKey(text)
						);

						($.get(option).label = text);
						dispatch('input', { config: { options: $.get(options) } });
					}
				});
			});
		}

		var node_3 = $.sibling(node_2, 2);

		$.component(node_3, () => UI.TextInput, ($$anchor, UI_TextInput_1) => {
			UI_TextInput_1($$anchor, {
				label: 'Option Value',
				get value() {
					return $.get(option).value;
				},
				onfocus: () => clicked_value_inputs.add(i),
				oninput: (text) => {
					($.get(option).value = text);
					dispatch('input', { config: { options: $.get(options) } });
				}
			});
		});

		var div_3 = $.sibling(node_3, 2);
		var node_4 = $.child(div_3);

		{
			var consequent = ($$anchor) => {
				var button = root();
				var node_5 = $.child(button);

				Icon(node_5, { icon: 'fa-solid:arrow-up' });
				$.reset(button);
				$.template_effect(() => $.set_attribute(button, 'title', `Move ${$$props.field.label ?? ''} up`));
				$.delegated('click', button, () => moveOptionUp(i));
				$.append($$anchor, button);
			};

			$.if(node_4, ($$render) => {
				if (i !== 0) $$render(consequent);
			});
		}

		var node_6 = $.sibling(node_4, 2);

		{
			var consequent_1 = ($$anchor) => {
				var button_1 = root();
				var node_7 = $.child(button_1);

				Icon(node_7, { icon: 'fa-solid:arrow-down' });
				$.reset(button_1);
				$.template_effect(() => $.set_attribute(button_1, 'title', `Move ${$$props.field.label ?? ''} down`));
				$.delegated('click', button_1, () => moveOptionDown(i));
				$.append($$anchor, button_1);
			};

			$.if(node_6, ($$render) => {
				if (i !== $.get(options).length - 1) $$render(consequent_1);
			});
		}

		var button_2 = $.sibling(node_6, 2);
		var node_8 = $.child(button_2);

		Icon(node_8, { icon: 'ion:trash' });
		$.reset(button_2);
		$.reset(div_3);
		$.reset(div_1);

		$.template_effect(() => {
			$.set_attribute(div_3, 'id', `repeater-${$$props.field.key ?? ''}-${i}`);
			$.set_attribute(button_2, 'title', `Delete ${$$props.field.label ?? ''} item`);
		});

		$.delegated('click', button_2, () => deleteOption(i));
		$.append($$anchor, div_1);
	});

	var button_3 = $.sibling(node, 2);
	var node_9 = $.child(button_3);

	Icon(node_9, { icon: 'ic:baseline-plus' });
	$.next();
	$.reset(button_3);
	$.reset(div);
	$.delegated('click', button_3, addOption);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);