import * as $ from 'svelte/internal/server';

export default function Test02_input($$renderer) {
	SingleLine($$renderer, { class: 'foo' });
	$$renderer.push(`<!----> `);
	Multiline($$renderer, { class: 'foo' });
	$$renderer.push(`<!----> <div></div> <div></div>`);
}