import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	$$renderer.push(`<div class="hello"><div></div> <div>hello</div> <img/> <svg><path></path></svg> <math><msup></msup></math> `);

	if (true) {
		$$renderer.push('<!--[0-->');
		Test01_input($$renderer, {});
		$$renderer.push(`<!---->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);
	I.Am.A.Foo($$renderer, {});
	$$renderer.push(`<!----></div>`);
}