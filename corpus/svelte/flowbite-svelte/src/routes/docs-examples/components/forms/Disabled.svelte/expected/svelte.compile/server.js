import * as $ from 'svelte/internal/server';
import { Input } from "flowbite-svelte";

export default function Disabled($$renderer) {
	Input($$renderer, {
		id: 'disabled-input',
		class: 'mb-6',
		disabled: true,
		value: 'Disabled input'
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		id: 'disabled-input-2',
		class: 'mb-6',
		disabled: true,
		readonly: true,
		value: 'Disabled readonly input'
	});

	$$renderer.push(`<!---->`);
}