import * as $ from 'svelte/internal/server';
import autosize from 'autosize';
import { onMount } from 'svelte';
import TextInput from '../ui/TextInput.svelte';

export default function TextField($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { field, entry, onchange } = $$props;
		let element;

		onMount(() => {
			autosize(element);
		});

		TextInput($$renderer, {
			label: field.label,
			value: entry?.value,
			grow: true,
			oninput: (value) => onchange({ [field.key]: { 0: { value } } })
		});
	});
}