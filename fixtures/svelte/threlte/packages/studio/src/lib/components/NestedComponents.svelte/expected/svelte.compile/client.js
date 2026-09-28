import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NestedComponents from './NestedComponents.svelte';

export default function NestedComponents_1($$anchor, $$props) {
	$.push($$props, true);

	const Extension = $$props.extensions[0];
	const nextExtensions = $$props.extensions.slice(1);

	Extension($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					NestedComponents($$anchor, {
						get extensions() {
							return nextExtensions;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.snippet(node_1, () => $$props.children);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				};

				var alternate = ($$anchor) => {
					var fragment_4 = $.comment();
					var node_2 = $.first_child(fragment_4);

					$.snippet(node_2, () => $$props.children);
					$.append($$anchor, fragment_4);
				};

				$.if(node, ($$render) => {
					if (nextExtensions.length > 0) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}