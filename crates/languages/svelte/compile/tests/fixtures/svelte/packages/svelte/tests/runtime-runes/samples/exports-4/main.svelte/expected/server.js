import * as $ from 'svelte/internal/server';
import Sub from './sub.svelte';

export default function Main($$renderer) {
	let sub = void 0;

	Sub($$renderer, {});
	$$renderer.push(`<!----> <button>${$.escape(sub?.count)} / ${$.escape(sub?.doubled)}</button>`);
}