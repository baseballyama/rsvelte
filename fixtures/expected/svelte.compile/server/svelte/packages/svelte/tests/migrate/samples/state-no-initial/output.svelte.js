import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	let bounds = void 0;

	const openDropdown = () => {
		bounds = getInputPosition();
	};

	const getInputPosition = () => {};
	const calculatePosition = (boundary) => ({});
	let position = $.derived(() => calculatePosition(bounds));

	$$renderer.push(`<div${$.attr_style('', { top: position().top })}></div>`);
}