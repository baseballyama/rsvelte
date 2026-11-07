import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let disabled = false;

	$$renderer.push(`<button${$.attr('disabled', disabled, true)}>...</button> <button${$.attr('disabled', disabled, true)}>...</button> <button${$.attr('disabled', disabled, true)}>...</button> <button${$.attr('disabled', disabled, true)}>...</button> <button${$.attr('disabled', disabled, true)}>...</button> <button${$.attr('disabled', disabled, true)}>...</button> <button disabled=" false ">...</button>`);
}