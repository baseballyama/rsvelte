import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<svg><defs><circle id="stamp" r="10" fill="blue"></circle></defs><use xlink:href="#stamp" x="20" y="20"></use></svg>`);
}