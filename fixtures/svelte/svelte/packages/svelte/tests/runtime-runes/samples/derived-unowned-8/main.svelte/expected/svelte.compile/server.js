import * as $ from 'svelte/internal/server';

let visible = true;

function toggleVisibility() {
	visible = !visible;
}

let unchangedState = 'unchanged state';

let derived = $.derived(() => {
	console.log('recalculating');

	return unchangedState;
});

export default function Main($$renderer) {
	$$renderer.push(`<button>Toggle Visibility</button> `);

	if (visible) {
		$$renderer.push(`<!--[0--><p>${$.escape(derived())}</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}