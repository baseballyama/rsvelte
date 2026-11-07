import * as $ from 'svelte/internal/server';
import { value } from "package";

export default function Id_dynamic_suffix01_input($$renderer) {
	const derived = value + "-link-three";

	$$renderer.push(`<a>Click me!</a> <a${$.attr('id', value + "-link-one")} class="svelte-penyk">Click me two!</a> <a${$.attr('id', `${value}-link-two`)} class="svelte-penyk">Click me three!</a> <a${$.attr('id', derived)} class="svelte-penyk">Click me four!</a>`);
}