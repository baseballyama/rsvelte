import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import InstancedMesh from '../InstancedMesh.svelte';
import Self from './InnerInstancedMeshes.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'meshes',
	'index',
	'children'
]);

export default function InnerInstancedMeshes($$anchor, $$props) {
	$.push($$props, true);

	let index = $.prop($$props, 'index', 19, () => $$props.meshes.length - 1),
		props = $.rest_props($$props, rest_excludes);

	const mesh = $$props.meshes[index()];
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			InstancedMesh($$anchor, $.spread_props(
				{
					get geometry() {
						return mesh.geometry;
					},

					get material() {
						return mesh.material;
					},

					get id() {
						return mesh.uuid;
					}
				},
				() => props,
				{
					children: ($$anchor, $$slotProps) => {
						{
							let $0 = $.derived(() => index() - 1);

							Self($$anchor, $.spread_props(
								{
									get meshes() {
										return $$props.meshes;
									},

									get index() {
										return $.get($0);
									}
								},
								() => props,
								{
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_1 = $.first_child(fragment_3);

										$.snippet(node_1, () => $$props.children ?? $.noop);
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								}
							));
						}
					},
					$$slots: { default: true }
				}
			));
		};

		var alternate = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_2 = $.first_child(fragment_4);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_4);
		};

		$.if(node, ($$render) => {
			if (index() > -1) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}