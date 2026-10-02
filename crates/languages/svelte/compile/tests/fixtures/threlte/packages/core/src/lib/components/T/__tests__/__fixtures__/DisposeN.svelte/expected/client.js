import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';

export default function DisposeN($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.each(node, 16, () => Array($$props.count).keys(), (index) => index, ($$anchor, index) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				get name() {
					return `mesh-${index ?? ''}`;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => [index, index, index]);

						$.component(node_2, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
							T_PlaneGeometry($$anchor, {
								get args() {
									return $.get($0);
								}
							});
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		});

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}