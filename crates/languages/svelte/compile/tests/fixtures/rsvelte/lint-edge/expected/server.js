import * as $ from 'svelte/internal/server';

export default function Lint_edge($$renderer, $$props) {
	let { label } = $$props;
	function f(a, b) {
		return b;
	}
	const g = (x = 1) => 0;
	let c = 0;
	c = c + 1;
	let d = 1;
	function h() {
		h();
	}
	f;
	g;
	$$renderer.push(`<button type="">a</button> <button type="">a</button> <button type="button">a</button> <button type="foo">a</button> <button${$.attr('type', label)}>a</button> <button${$.attr('type', `a${$.stringify(label)}`)}>a</button> <button${$.attr('type', type)}>a</button>`);
}
