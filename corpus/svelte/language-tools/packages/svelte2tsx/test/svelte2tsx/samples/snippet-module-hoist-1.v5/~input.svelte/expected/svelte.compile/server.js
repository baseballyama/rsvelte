import * as $ from 'svelte/internal/server';
import { imported } from './x';

function hoistable1($$renderer) {
	$$renderer.push(`<div>hello</div>`);
}

function hoistable2($$renderer, bar) {
	$$renderer.push(`<div>${$.escape(bar)}</div>`);
}

function hoistable3($$renderer, bar) {
	$$renderer.push(`<div>${$.escape(bar)}</div>`);
}

function hoistable4($$renderer, foo) {
	$$renderer.push(`<div>${$.escape(foo)}</div>`);
}

function hoistable5($$renderer) {
	$$renderer.push(`<button>click</button>`);
}

function hoistable6($$renderer) {
	$$renderer.push(`<div>true</div>`);
}

function hoistable7($$renderer) {
	$$renderer.push(`<div>${$.escape(imported)}</div>`);
}

function hoistable8($$renderer) {
	$$renderer.push(`<div>${$.escape(global)}</div>`);
}

function hoistable9($$renderer, props) {
	$$renderer.push(`<!---->Referencing global types`);
}

function hoistable10($$renderer, foo) {
	const bar = foo;

	$$renderer.push(`<!---->${$.escape(bar)}`);
}

let module = true;

export default function Input($$renderer) {
	let foo = true;

	function not_hoistable($$renderer) {
		$$renderer.push(`<div>true</div>`);
	}
}