import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let a1 = $.state(void 0);
	let b1 = $.state(void 0);

	$.user_effect(() => {
		console.log('a1: ', $.get(a1));
	});

	$.user_effect(() => {
		console.log('b1: ', $.get(b1));
	});

	a();
	queueMicrotask(a);
	b();
	queueMicrotask(b);

	function a() {
		$.set(a1, $.get(a1) ?? true);
	}

	function b() {
		$.get(b1) ?? $.set(b1, true);
	}

	$.pop();
}