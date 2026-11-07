import * as $ from 'svelte/internal/server';
import thisShouldWarnMe from './MyComponent.svelte';
import { form } from './form';

export default function Input($$renderer) {
	let i;

	form;
	$$renderer.push(`<thisshouldwarnme></thisshouldwarnme> <i></i> <form></form>`);
}