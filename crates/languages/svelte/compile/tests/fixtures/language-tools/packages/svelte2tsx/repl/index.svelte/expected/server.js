import * as $ from 'svelte/internal/server';

function hoistable1($$renderer) {
	$$renderer.push(`<div>hello</div>`);
}

function hoistable2($$renderer) {
	$$renderer.push(`<div>true</div>`);
}

let foo = true;

export default function Repl($$renderer) {}