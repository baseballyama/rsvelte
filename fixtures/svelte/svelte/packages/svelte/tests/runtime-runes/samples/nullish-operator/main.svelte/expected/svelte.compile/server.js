import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let a1 = void 0;
		let b1 = void 0;

		a();
		queueMicrotask(a);
		b();
		queueMicrotask(b);

		function a() {
			a1 ??= true;
		}

		function b() {
			b1 ?? (b1 = true);
		}
	});
}