import * as $ from 'svelte/internal/server';

export default function Remove01_input($$renderer) {
	let div;
	let show;

	// ✓ GOOD
	const toggle = () => show = !show;

	if (show) {
		$$renderer.push(`<!--[0--><div>div</div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <button>Click Me</button>`);
}