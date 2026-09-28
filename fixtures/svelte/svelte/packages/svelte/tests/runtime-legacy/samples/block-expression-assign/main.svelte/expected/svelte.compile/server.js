import * as $ from 'svelte/internal/server';

function snip($$renderer) {}

export default function Main($$renderer) {
	let a = 0;
	let b = 0;
	let c = 0;
	let d = 0;
	let e = 0;
	let f = 0;
	let g = 0;
	let h = 0;
	let i = 0;

	function inc() {
		a++;
		b++;
		c++;
		d++;
		e++;
		f++;
		g++;
		h++;
		i++;
	}

	if (a = 0) {
		$$renderer.push('<!--[0-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like([b = 0]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let x = each_array[$$index];

		$$renderer.push(`<!---->${$.escape((x, ''))}`);
	}

	$$renderer.push(`<!--]--> <!---->`);

	{}

	$$renderer.push(`<!----> `);
	$.await($$renderer, d = 0, () => {}, () => {});
	$$renderer.push(`<!--]--> `);
	(e = 0, snip)($$renderer);
	$$renderer.push(`<!----> ${$.html((f = 0, ''))} <div></div> <!---->`);

	{
		const x = h = 0;

		$$renderer.push(`${$.escape((x, ''))}`);
	}

	$$renderer.push(`<!----> `);

	if (1) {
		$$renderer.push('<!--[0-->');

		const x = i = 0;

		$$renderer.push(`${$.escape((x, ''))}`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <button>inc</button> [${$.escape(a)},${$.escape(b)},${$.escape(c)},${$.escape(d)},${$.escape(e)},${$.escape(f)},${$.escape(g)},${$.escape(h)},${$.escape(i)}]`);
}