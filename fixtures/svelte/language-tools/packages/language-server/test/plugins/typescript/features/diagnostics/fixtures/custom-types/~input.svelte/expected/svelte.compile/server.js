import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div owntypefromold="foo"></div> <div></div> <own-element attribute="foo"></own-element> <own-element-from-old attribute="foo"></own-element-from-old> <div owntype="foo"></div> <div></div> <own-element${$.attr('attribute', false)}></own-element> <own-element doesnexist="wrong"></own-element> <div${$.attr('owntype', false)}></div> <div${$.attr('owntypefromold', false)}></div> <div></div> <div></div> <own-element-from-old${$.attr('attribute', false)}></own-element-from-old> <own-element-from-old doesnexist="wrong"></own-element-from-old>`);
}