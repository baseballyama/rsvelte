import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<element someattr="hi" someotherattribute="there">hello</element> `);
	Component($$renderer, { someAttr: '5', otherAttr: 6 });
	$$renderer.push(`<!---->`);
}