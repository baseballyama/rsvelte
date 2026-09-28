import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<input${$.attr('readonly', !0, true)}${$.attr('required', !1, true)}/>`);
}