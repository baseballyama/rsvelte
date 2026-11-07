import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

export default function Reactive_component_input($$anchor, $$props) {
	$.push($$props, true);

	let MyComponent;

	onMount(() => {
		import('./MyComponent.svelte').then((component) => {
			MyComponent = component.default;
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			MyComponent($$anchor, {});
		};

		$.if(node, ($$render) => {
			if (MyComponent) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}