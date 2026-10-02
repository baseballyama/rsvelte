import * as $ from 'svelte/internal/server';
import { CustomReactiveClass1, CustomReactiveClass2 } from 'foo';

export default function Additional_class_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// These should be allowed when not wrapped with $state
		const custom1 = new CustomReactiveClass1();

		const custom2 = new CustomReactiveClass2();

		// Regular state usage is still valid
		const regularState = 42;
	});
}