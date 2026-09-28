import * as $ from 'svelte/internal/server';
import { InputRadio } from '$lib/elements/forms';

export default function InputRadio_test($$renderer) {
	InputRadio($$renderer, {
		label: 'one',
		id: 'one',
		group: 'radio',
		value: '1',
		name: 'radio'
	});

	$$renderer.push(`<!----> `);

	InputRadio($$renderer, {
		label: 'two',
		id: 'two',
		group: 'radio',
		value: '2',
		name: 'radio'
	});

	$$renderer.push(`<!----> `);

	InputRadio($$renderer, {
		label: 'three',
		id: 'three',
		group: 'radio',
		value: '3',
		name: 'radio'
	});

	$$renderer.push(`<!---->`);
}