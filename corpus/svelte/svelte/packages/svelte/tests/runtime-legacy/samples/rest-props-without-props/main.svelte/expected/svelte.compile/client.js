import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import App from './App.svelte';

var root = $.from_html(`<!> <button></button> <button></button> <button></button> <button></button>`, 1);

export default function Main($$anchor) {
	let a = 1;
	let b = 2;
	let c = 3;
	let d = 4;
	let e = 5;
	let f = { foo: 1 };

	function updateProps() {
		a = 31;
		b = 32;
	}

	function updateRest() {
		d = 34;
	}

	function updateSpread() {
		f.foo = 31;
	}

	function updateSpread2() {
		f.bar = 2;
	}

	var fragment = root();
	var node = $.first_child(fragment);

	App(node, $.spread_props(
		{
			get a() {
				return a;
			},

			get b() {
				return b;
			},
			c,
			get d() {
				return d;
			},
			e
		},
		() => f
	));

	var button = $.sibling(node, 2);
	var button_1 = $.sibling(button, 2);
	var button_2 = $.sibling(button_1, 2);
	var button_3 = $.sibling(button_2, 2);

	$.event('click', button, updateProps);
	$.event('click', button_1, updateRest);
	$.event('click', button_2, updateSpread);
	$.event('click', button_3, updateSpread2);
	$.append($$anchor, fragment);
}