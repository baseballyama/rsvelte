import * as $ from 'svelte/internal/server';
import { Breakpoint } from "carbon-components-svelte";

export default function BreakpointFixture($$renderer) {
	Breakpoint($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { size, sizes }) => {
				$$renderer.push(`<div data-testid="current-size">${$.escape(size)}</div> <div data-testid="is-sm">${$.escape(sizes.sm)}</div> <div data-testid="is-md">${$.escape(sizes.md)}</div> <div data-testid="is-lg">${$.escape(sizes.lg)}</div> <div data-testid="is-xlg">${$.escape(sizes.xlg)}</div> <div data-testid="is-max">${$.escape(sizes.max)}</div>`);
			}
		}
	});
}