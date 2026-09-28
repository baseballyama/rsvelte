import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<input list="suggestions"/> <datalist id="suggestions">`);
	$$renderer.option({ value: 'foo' }, ($$renderer) => {});
	$$renderer.option({ value: 'bar' }, ($$renderer) => {});
	$$renderer.option({ value: 'baz' }, ($$renderer) => {});
	$$renderer.push(`</datalist>`);
}