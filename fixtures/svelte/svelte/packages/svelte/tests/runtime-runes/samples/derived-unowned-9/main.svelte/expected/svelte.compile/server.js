import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;

	function increment() {
		count += 1;
	}

	let double = void 0;

	function setDerived() {
		const d = $.derived(() => count * 2);

		double = {
			get v() {
				return d();
			}
		};
	}

	$$renderer.push(`<button>a</button> <button>b</button> <div>${$.escape(count)}</div> `);

	if (double && count % 5) {
		$$renderer.push(`<!--[0-->double: ${$.escape(double.v)}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}