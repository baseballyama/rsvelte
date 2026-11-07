import * as $ from 'svelte/internal/server';

export default function Await_with_same_id_input($$renderer) {
	let a;
	let b;
	let c;
	let d;
	let e;

	$.await(
		$$renderer,
		a,
		() => {
			$$renderer.push(`<div>await</div>`);
		},
		(a) => {
			$$renderer.push(`<div>${$.escape(a.x)}</div>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		b,
		() => {
			$$renderer.push(`<div>await</div>`);
		},
		({ x: b = 42 }) => {
			$$renderer.push(`<div>${$.escape(b.toExponential())}</div>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		c,
		() => {
			$$renderer.push(`<div>await</div>`);
		},
		({ ...c }) => {
			$$renderer.push(`<div>${$.escape(c.x)}</div>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		d,
		() => {
			$$renderer.push(`<div>await</div>`);
		},
		([d]) => {
			$$renderer.push(`<div>${$.escape(d.toExponential())}</div>`);
		}
	);

	$$renderer.push(`<!--]--> `);

	$.await(
		$$renderer,
		e,
		() => {
			$$renderer.push(`<div>await</div>`);
		},
		([...e]) => {
			$$renderer.push(`<div>${$.escape(e[0].toExponential())}</div>`);
		}
	);

	$$renderer.push(`<!--]-->`);
}