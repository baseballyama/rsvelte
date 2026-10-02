import * as $ from 'svelte/internal/server';
import { value } from "package";

export default function Id_dynamic_prefix01_input($$renderer) {
	const derived = "link-three-" + value;

	$$renderer.push(`<a>Click me!</a> <a${$.attr('id', "link-one-" + value)} class="svelte-1g96cu9">Click me two!</a> <a${$.attr('id', `link-two-${value}`)} class="svelte-1g96cu9">Click me three!</a> <a${$.attr('id', derived)} class="svelte-1g96cu9">Click me four!</a>`);
}