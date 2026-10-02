import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	SomeComponent($$renderer, { attrName: 'text', attrCase: 'text' });
	$$renderer.push(`<!----> <someelement attrname="text" attrcase=""></someelement>`);
}