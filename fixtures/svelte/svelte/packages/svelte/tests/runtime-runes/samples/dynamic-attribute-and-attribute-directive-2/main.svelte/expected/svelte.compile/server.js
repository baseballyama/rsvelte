import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 0;

	function dark() {
		console.log('updated class directive');

		return true;
	}

	function get_class() {
		console.log('updated class attribute');

		return value % 2 ? 'big' : 'small';
	}

	function color() {
		console.log('updated style directive');

		return "green";
	}

	function get_style() {
		console.log('updated style attribute');

		return value % 2 ? 'background: red' : 'background: green';
	}

	$$renderer.push(`<div${$.attr_class($.clsx(get_class()), void 0, { 'dark': dark() })}></div> <div${$.attr_style(get_style(), { color: color() })}></div> <button>switch</button>`);
}