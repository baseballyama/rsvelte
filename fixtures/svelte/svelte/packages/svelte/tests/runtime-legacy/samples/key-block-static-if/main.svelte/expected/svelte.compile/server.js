import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let slide = 0;
	let num = false;
	const changeNum = () => num = !num;

	$$renderer.push(`<section><!---->`);

	{
		if (num) {
			$$renderer.push(`<!--[0--><div>First</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!----> <div>Second</div></section> <button>Click</button>`);
}