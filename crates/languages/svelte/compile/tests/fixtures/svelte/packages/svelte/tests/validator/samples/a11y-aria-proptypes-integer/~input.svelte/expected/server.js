import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<div aria-level="yes"></div> <div aria-level="no"></div> <div${$.attr('aria-level', `abc`)}></div> <div aria-level=""></div> <div aria-level="false"></div> <div${$.attr('aria-level', !"false")}></div>`);
}