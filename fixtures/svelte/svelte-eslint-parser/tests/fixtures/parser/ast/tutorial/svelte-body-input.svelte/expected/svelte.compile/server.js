import * as $ from 'svelte/internal/server';

export default function Svelte_body_input($$renderer) {
	let hereKitty = false;
	const handleMouseenter = () => hereKitty = true;
	const handleMouseleave = () => hereKitty = false;

	$$renderer.push(`<img alt="Kitten wants to know what's going on" src="tutorial/kitten.png"${$.attr_class('svelte-kzurz4', void 0, { 'curious': hereKitty })}/>`);
}