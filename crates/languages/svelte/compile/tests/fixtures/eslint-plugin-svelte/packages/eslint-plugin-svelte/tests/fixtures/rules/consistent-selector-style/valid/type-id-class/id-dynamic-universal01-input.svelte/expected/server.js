import * as $ from 'svelte/internal/server';
import { value } from "package";

export default function Id_dynamic_universal01_input($$renderer) {
	$$renderer.push(`<a>Click me!</a> <a${$.attr('id', value)} class="svelte-h856ne">Click me two!</a> <a${$.attr('id', value)} class="svelte-h856ne">Click me two!</a>`);
}