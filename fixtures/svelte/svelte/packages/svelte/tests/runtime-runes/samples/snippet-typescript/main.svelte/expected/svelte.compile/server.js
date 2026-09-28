import * as $ from 'svelte/internal/server';

function counter1($$renderer, c) {
	$$renderer.push(`<!---->${$.escape(c)}`);
}

function counter2($$renderer, { c }) {
	$$renderer.push(`<!---->${$.escape(c)}`);
}

function counter3($$renderer, c) {
	$$renderer.push(`<!---->${$.escape(c)}`);
}

function counter4($$renderer, c = 4) {
	$$renderer.push(`<!---->${$.escape(c)}`);
}

function counter5($$renderer, c = 5) {
	$$renderer.push(`<!---->${$.escape(c)}`);
}

function counter6($$renderer, c, d) {
	$$renderer.push(`<!---->${$.escape(c)}${$.escape(d)}`);
}

export default function Main($$renderer) {
	counter1($$renderer, 1);
	$$renderer.push(`<!----> `);
	counter2($$renderer, { c: 2 });
	$$renderer.push(`<!----> `);
	counter3($$renderer, 3);
	$$renderer.push(`<!----> `);
	counter4($$renderer);
	$$renderer.push(`<!----> `);
	counter5($$renderer);
	$$renderer.push(`<!----> `);
	counter6($$renderer, 6, 'a');
	$$renderer.push(`<!---->`);
}