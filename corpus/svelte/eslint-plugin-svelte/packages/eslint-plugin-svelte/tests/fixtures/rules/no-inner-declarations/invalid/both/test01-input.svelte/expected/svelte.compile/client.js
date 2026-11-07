import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Test01_input($$anchor) {
	if (test) {
		function doSomething() {}
	}

	if (foo) var a;
	if (foo) /* some comments */ var a;

	if (foo) {
		function f() {
			if (bar) {
				var a;
			}
		}
	}

	if (foo) {
		function f() {
			if (bar) var a;
		}
	}
}