import * as $ from 'svelte/internal/server';

export default function Circular_gauge($$renderer, $$props) {
	let { percentage } = $$props;
	const normalizedPercentage = $.derived(() => Math.min(Math.max(percentage, 0), 100));
	const circumference = $.derived(() => 2 * Math.PI * 42.5);
	const strokePercent = $.derived(() => normalizedPercentage() / 100 * circumference());

	$$renderer.push(`<svg aria-hidden="true" fill="none" height="16" width="16" stroke-width="2" viewBox="0 0 100 100" class="-rotate-90"><circle cx="50" cy="50" r="42.5" stroke-width="12" stroke-dashoffset="0" stroke-linecap="round" stroke-linejoin="round" class="opacity-20" stroke="currentColor" style="stroke-dasharray: 267.0353755551324 267.0353755551324;"></circle><circle cx="50" cy="50" r="42.5" stroke-width="12" stroke-dashoffset="0" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" class="transition-all duration-300"${$.attr_style(`stroke-dasharray: ${$.stringify(strokePercent())} 267.0353755551324;`)}></circle></svg>`);
}