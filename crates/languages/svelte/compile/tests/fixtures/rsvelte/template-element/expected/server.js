import * as $ from "svelte/internal/server";
export default function Template_element($$renderer) {
	let x = 1;
	$$renderer.push(`<template id="t"><b>t</b>1</template> <template><b>1</b></template> <div><template><i>static</i></template></div>`);
}
