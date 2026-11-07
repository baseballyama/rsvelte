import * as $ from 'svelte/internal/server';
import breakpoints from "carbon-components-svelte/Breakpoint/breakpoints";

export default function Breakpoints_test($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div data-testid="sm">${$.escape(breakpoints.sm)}</div> <div data-testid="md">${$.escape(breakpoints.md)}</div> <div data-testid="lg">${$.escape(breakpoints.lg)}</div> <div data-testid="xlg">${$.escape(breakpoints.xlg)}</div> <div data-testid="max">${$.escape(breakpoints.max)}</div>`);
	});
}