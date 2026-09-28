import * as $ from 'svelte/internal/server';

export default function Lint_cases($$renderer, $$props) {
	let unused = 1;
	let { label } = $$props;

	$$renderer.push(`<button>${$.escape(label)}</button>`);
}