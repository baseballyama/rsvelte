import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 0;

	function dark() {
		console.log('called');

		return false;
	}

	function get_class() {
		return 'dark';
	}

	function color() {
		console.log('called');

		return 'red';
	}

	function get_style() {
		return 'color: green';
	}

	$$renderer.push(`<div${$.attr_class($.clsx(get_class()), void 0, { 'dark': dark() })}></div> <div${$.attr_style(get_style(), { color: color() })}></div> <button>${$.escape(value)}</button>`);
}