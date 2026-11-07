import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from './MyComponent.svelte';

var root = $.from_html(`<!> <!> <button>Click Me</button>`, 1);

export default function Non_element01_input($$anchor) {
	let foo;
	let bar;

	const remove = () => {
		foo.remove();
		bar.remove();
	};

	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(
		MyComponent(node, {
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('div');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		}),
		($$value) => foo = $$value,
		() => foo
	);

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => MyComponent, ($$anchor, $$component) => {
		$.bind_this(
			$$component($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('div');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			}),
			($$value) => bar = $$value,
			() => bar
		);
	});

	var button = $.sibling(node_1, 2);

	$.event('click', button, () => remove());
	$.append($$anchor, fragment);
}