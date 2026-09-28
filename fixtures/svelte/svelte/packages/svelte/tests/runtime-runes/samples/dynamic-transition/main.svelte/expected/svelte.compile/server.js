import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function transition1() {
		console.log('transition 1');

		return { tick() {} };
	}

	function transition2() {
		console.log('transition 2');

		return { tick() {} };
	}

	let toggle = false;
	let toggleTransition = false;
	const derived = $.derived(() => toggleTransition ? transition1 : transition2);

	$$renderer.push(`<button>${$.escape(toggle)}</button> <button>${$.escape(toggleTransition)}</button> `);

	if (toggle) {
		$$renderer.push(`<!--[0--><div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}