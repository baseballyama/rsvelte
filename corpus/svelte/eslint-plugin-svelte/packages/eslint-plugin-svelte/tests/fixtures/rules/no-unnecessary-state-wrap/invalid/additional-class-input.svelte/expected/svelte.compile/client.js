import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CustomReactiveClass1, CustomReactiveClass2 } from 'foo';

export default function Additional_class_input($$anchor, $$props) {
	$.push($$props, true);

	// These should be reported as unnecessary $state wrapping
	const custom1 = $.proxy(new CustomReactiveClass1());

	const custom2 = $.proxy(new CustomReactiveClass2());

	// Regular state usage is still valid
	const regularState = 42;

	$.pop();
}