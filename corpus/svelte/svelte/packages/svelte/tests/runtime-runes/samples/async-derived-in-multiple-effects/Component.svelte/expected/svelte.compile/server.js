import * as $ from 'svelte/internal/server';
import { untrack } from "svelte";

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { double } = $$props;

		// Test setup:
		// - component initialized while pending work
		// - derived that depends on mulitple sources
		// - indirect updates to subsequent deriveds
		// - two sibling effects where the former influences the latter
		// - first effect reads derived of second inside untrack
		let x = 0;

		const other = $.derived(() => double + x);
		const another = $.derived(() => other() + 1);
		const another2 = $.derived(() => another() + 1);
	});
}