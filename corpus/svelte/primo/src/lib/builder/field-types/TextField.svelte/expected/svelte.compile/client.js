import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import autosize from 'autosize';
import { onMount } from 'svelte';
import TextInput from '../ui/TextInput.svelte';

export default function TextField($$anchor, $$props) {
	$.push($$props, true);

	let element;

	onMount(() => {
		autosize(element);
	});

	{
		let $0 = $.derived(() => $$props.entry?.value);

		TextInput($$anchor, {
			get label() {
				return $$props.field.label;
			},

			get value() {
				return $.get($0);
			},
			grow: true,
			oninput: (value) => $$props.onchange({ [$$props.field.key]: { 0: { value } } })
		});
	}

	$.pop();
}