import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div data-foo="semi:&quot;space:&quot; letter:&amp;quote number:&amp;quot1 end:&quot;"></div>`);
}