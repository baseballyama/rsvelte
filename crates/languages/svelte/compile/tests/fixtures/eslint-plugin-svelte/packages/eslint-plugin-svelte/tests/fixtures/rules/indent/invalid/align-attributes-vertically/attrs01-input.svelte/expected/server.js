import * as $ from 'svelte/internal/server';

export default function Attrs01_input($$renderer) {
	$$renderer.push(`<div a="" b="" c="" d=""${$.attr('e', foo)} f=""><div a="" b="" c="" d="
"${$.attr('e', foo)}${$.attr('f', foo)}>a</div></div>`);
}