import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let a = 0;
	let b = "b";
	let c = true;
	let d = [];
	let e = { x: 10, y: 12 };
	let f = { w: 15, v: 16 };

	function change() {
		({ d, e, g: [f.w, f.v] } = {
			d: [a, b, c] = [5, "d", false],
			e: { x: 100, y: 120 },
			g: [25, 26]
		});
	}

	$$renderer.push(`<button>Update</button> <p>${$.escape(a)}</p> <p>${$.escape(b)}</p> <p>${$.escape(c)}</p> <p>${$.escape(d.length)}</p> <p>${$.escape(e.x)}</p> <p>${$.escape(e.y)}</p> <p>${$.escape(f.w)}</p> <p>${$.escape(f.v)}</p>`);
}