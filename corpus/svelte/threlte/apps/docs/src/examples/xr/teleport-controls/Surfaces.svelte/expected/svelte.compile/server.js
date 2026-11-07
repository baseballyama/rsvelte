import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { teleportControls } from '@threlte/xr';
import { useDraco, useGltf } from '@threlte/extras';

export default function Surfaces($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, showBlockers, showSurfaces } = $$props;

		teleportControls('left');
		teleportControls('right');

		const dracoLoader = useDraco();
		const gltf = useGltf('/models/xr/ruins.glb', { dracoLoader });

		children?.($$renderer);
		$$renderer.push(`<!----> `);

		$.await($$renderer, gltf, () => {}, ({ nodes }) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like([1, 2, 3, 4, 5, 6, 7, 8, 9]);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let n = each_array[$$index];

				T($$renderer, {
					is: nodes[`teleportBlocker${n}`],
					visible: showBlockers,
					teleportBlocker: true
				});
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array_1 = $.ensure_array_like([1, 2, 3]);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let n = each_array_1[$$index_1];

				T($$renderer, {
					is: nodes[`teleportSurface${n}`],
					visible: showSurfaces,
					teleportSurface: true
				});
			}

			$$renderer.push(`<!--]-->`);
		});

		$$renderer.push(`<!--]-->`);
	});
}