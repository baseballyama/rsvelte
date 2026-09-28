import * as $ from 'svelte/internal/server';

export default function Squiggle($$renderer, $$props) {
	const width = 26;
	const height = 26;
	const stroke = 6;
	const halfStroke = stroke / 2;
	let { top = false } = $$props;

	$$renderer.push(`<svg preserveAspectRatio="none" style="--stroke: 6px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26"${$.attr_class($.clsx(top ? 'top' : 'bottom'), 'svelte-1skdm6z')}><path d="M 3 0 C 3 26 26 0 23 32" fill="none"${$.attr('stroke-width', stroke)}></path></svg>`);
}