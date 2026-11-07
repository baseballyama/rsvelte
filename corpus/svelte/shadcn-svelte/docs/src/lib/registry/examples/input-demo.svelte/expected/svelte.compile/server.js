import * as $ from 'svelte/internal/server';
import { Input } from "$lib/registry/ui/input/index.js";

export default function Input_demo($$renderer) {
	Input($$renderer, { type: 'email', placeholder: 'Email', class: 'max-w-xs' });
}