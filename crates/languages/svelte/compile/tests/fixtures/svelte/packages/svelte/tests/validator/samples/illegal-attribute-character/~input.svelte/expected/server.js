import * as $ from 'svelte/internal/server';
import C from './irrelevant';

export default function Input($$renderer) {
	$$renderer.push(`<button>click me</button> <button xml:click="">click me</button> <button xmlns:click="">click me</button> <button xlink:click="">click me</button> `);
	C($$renderer, {});
	$$renderer.push(`<!----> `);
	C($$renderer, { 'xml:click': true });
	$$renderer.push(`<!----> `);
	C($$renderer, { 'xmlns:click': true });
	$$renderer.push(`<!----> `);
	C($$renderer, { 'xlink:click': true });
	$$renderer.push(`<!----> <button foo:bar="">click me</button> `);
	C($$renderer, { 'foo:bar': true });
	$$renderer.push(`<!---->`);
}