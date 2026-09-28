import * as $ from 'svelte/internal/server';
import { Input } from "$lib/registry/ui/input/index.js";

export default function Input_invalid($$renderer) {
	Input($$renderer, {
		'aria-invalid': true,
		type: 'email',
		placeholder: 'email',
		value: 'shadcn@example',
		class: 'max-w-sm'
	});
}