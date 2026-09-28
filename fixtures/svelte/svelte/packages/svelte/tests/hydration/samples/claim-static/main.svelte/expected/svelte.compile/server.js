import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<div>hello</div> <div><div>bye</div></div> <div><div>aaa</div> <div>bbb</div></div>`);
}