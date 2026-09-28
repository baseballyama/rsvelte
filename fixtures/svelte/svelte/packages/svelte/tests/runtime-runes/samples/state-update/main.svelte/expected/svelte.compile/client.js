import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Main($$anchor) {
	let x = $.state(0);
	let o = $.proxy({ x: 0 });

	console.log($.update_pre(x));
	console.log($.update(x));
	console.log(++o.x);
	console.log(o.x++);
	console.log(o.x += 2);
	console.log($.set(x, $.get(x) + 2));
}