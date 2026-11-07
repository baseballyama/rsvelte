import * as $ from 'svelte/internal/server';
import IconPicker from '../../components/IconPicker.svelte';
import UI from '../../ui/index.js';
import Icon from '@iconify/svelte';
import { createEventDispatcher } from 'svelte';

export default function SelectField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { field } = $$props;
		const dispatch = createEventDispatcher();

		// Manage options separately since field.config keeps getting reset
		let options = field.config?.options || [];

		function addOption() {
			options = [...options, { value: '', label: '', icon: '' }];
			dispatch('input', { config: { options } });
		}

		function validateFieldKey(key) {
			// replace dash and space with underscore
			return key.replace(/-/g, '_').replace(/ /g, '_').toLowerCase();
		}

		// track focused value inputs to auto-fill values when unedited
		const clicked_value_inputs = new Set();

		function deleteOption(index) {
			// Remove option
			options = options.filter((_, i) => i !== index);

			// Reindex clicked inputs to keep behavior stable after deletion
			const nextClicked = new Set();

			clicked_value_inputs.forEach((i) => {
				if (i < index) nextClicked.add(i); else if (i > index) nextClicked.add(i - 1);
			});

			clicked_value_inputs.clear();
			nextClicked.forEach((i) => clicked_value_inputs.add(i));

			// Notify parent of config change
			dispatch('input', { config: { options } });
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

			options = swap(options, index, index - 1);
			swap_clicked_indices(index, index - 1);
			dispatch('input', { config: { options } });
		}

		function moveOptionDown(index) {
			if (index >= options.length - 1) return;

			options = swap(options, index, index + 1);
			swap_clicked_indices(index, index + 1);
			dispatch('input', { config: { options } });
		}

		$$renderer.push(`<div class="SelectField svelte-1r2bcda"><!--[-->`);

		const each_array = $.ensure_array_like(options);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let option = each_array[i];

			$$renderer.push(`<div class="select-field svelte-1r2bcda"><div class="option-icon svelte-1r2bcda"><span class="primo--field-label">Icon</span> `);

			IconPicker($$renderer, {
				variant: 'small',
				search_query: option.label,
				icon: option.icon || 'ri:checkbox-blank-circle-fill'
			});

			$$renderer.push(`<!----></div> `);

			if (UI.TextInput) {
				$$renderer.push('<!--[-->');

				UI.TextInput($$renderer, {
					label: 'Option Label',
					value: option.label,
					autofocus: !option.label || option.label.length === 0,
					oninput: (text) => {
						option.value = clicked_value_inputs.has(i) ? option.value : validateFieldKey(text);
						option.label = text;
						dispatch('input', { config: { options } });
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (UI.TextInput) {
				$$renderer.push('<!--[-->');

				UI.TextInput($$renderer, {
					label: 'Option Value',
					value: option.value,
					onfocus: () => clicked_value_inputs.add(i),
					oninput: (text) => {
						option.value = text;
						dispatch('input', { config: { options } });
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <div class="item-options svelte-1r2bcda"${$.attr('id', `repeater-${$.stringify(field.key)}-${$.stringify(i)}`)}>`);

			if (i !== 0) {
				$$renderer.push(`<!--[0--><button${$.attr('title', `Move ${$.stringify(field.label)} up`)} class="svelte-1r2bcda">`);
				Icon($$renderer, { icon: 'fa-solid:arrow-up' });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (i !== options.length - 1) {
				$$renderer.push(`<!--[0--><button${$.attr('title', `Move ${$.stringify(field.label)} down`)} class="svelte-1r2bcda">`);
				Icon($$renderer, { icon: 'fa-solid:arrow-down' });
				$$renderer.push(`<!----></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button style="color: var(--primo-color-danger)"${$.attr('title', `Delete ${$.stringify(field.label)} item`)} class="svelte-1r2bcda">`);
			Icon($$renderer, { icon: 'ion:trash' });
			$$renderer.push(`<!----></button></div></div>`);
		}

		$$renderer.push(`<!--]--> <button class="field-button subfield-button svelte-1r2bcda">`);
		Icon($$renderer, { icon: 'ic:baseline-plus' });
		$$renderer.push(`<!----> Create Option</button></div>`);
	});
}