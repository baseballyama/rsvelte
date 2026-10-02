import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let obj = { key: 1, value: 3 };

	function mutate() {
		obj.value = 5;
	}

	function reassign() {
		obj = { key: 1, value: 7 };
	}

	function changeKey() {
		obj.key = 3;
	}

	$$renderer.push(`<!---->`);

	{
		$$renderer.push(`<div>${$.escape(obj.value)}</div>`);
	}

	$$renderer.push(`<!---->`);
	$.bind_props($$props, { mutate, reassign, changeKey });
}