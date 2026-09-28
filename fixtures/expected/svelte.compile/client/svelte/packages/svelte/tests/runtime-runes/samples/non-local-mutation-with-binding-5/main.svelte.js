import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Outer from './Outer.svelte';
import Inner from './Inner.svelte';

export default function Main($$anchor) {
	let object = $.state($.proxy({ count: 0 }));
	let test = true;

	Outer($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					Inner($$anchor, {
						get object() {
							return $.get(object);
						},

						set object($$value) {
							$.set(object, $$value, true);
						}
					});
				};

				$.if(node, ($$render) => {
					if (test) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}