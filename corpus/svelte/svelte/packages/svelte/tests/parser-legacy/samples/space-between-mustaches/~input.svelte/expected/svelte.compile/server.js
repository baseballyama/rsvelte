import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<p>${$.escape(a)} ${$.escape(b)} : ${$.escape(c)} :</p>`);
}