import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import A from './A.svelte';

export default function Main($$anchor) {
	const B = $.derived(() => A);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $.get(B), ($$anchor, B_1) => {
		B_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => $.get(B), ($$anchor, B_2) => {
					B_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('test');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}