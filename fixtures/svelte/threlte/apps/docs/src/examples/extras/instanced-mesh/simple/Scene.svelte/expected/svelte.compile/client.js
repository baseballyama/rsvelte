import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Instance, InstancedMesh } from '@threlte/extras';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let dn = $.state($.proxy(Date.now()));

	useTask(() => $.set(dn, Date.now(), true));

	var fragment = root_1();
	var node = $.first_child(fragment);

	InstancedMesh(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => T.SphereGeometry, ($$anchor, T_SphereGeometry) => {
				T_SphereGeometry($$anchor, { args: [0.5] });
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => T.MeshStandardMaterial, ($$anchor, T_MeshStandardMaterial) => {
				T_MeshStandardMaterial($$anchor, { color: 'white' });
			});

			var node_3 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => Math.sin($.get(dn) / 1000 + 40));

				Instance(node_3, {
					'position.x': -2,
					get 'position.y'() {
						return $.get($0);
					}
				});
			}

			var node_4 = $.sibling(node_3, 2);

			{
				let $0 = $.derived(() => Math.sin($.get(dn) / 1000 + 10));

				Instance(node_4, {
					'position.x': -1,
					get 'position.y'() {
						return $.get($0);
					}
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				let $0 = $.derived(() => Math.sin($.get(dn) / 1000 + 5));

				Instance(node_5, {
					'position.x': 0,
					get 'position.y'() {
						return $.get($0);
					}
				});
			}

			var node_6 = $.sibling(node_5, 2);

			{
				let $0 = $.derived(() => Math.sin($.get(dn) / 1000 + 200));

				Instance(node_6, {
					'position.x': 1,
					get 'position.y'() {
						return $.get($0);
					}
				});
			}

			var node_7 = $.sibling(node_6, 2);

			{
				let $0 = $.derived(() => Math.sin($.get(dn) / 1000 + 550));

				Instance(node_7, {
					'position.x': 2,
					get 'position.y'() {
						return $.get($0);
					}
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node, 2);

	$.component(node_8, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { 'position.y': 10, 'position.z': 5 });
	});

	var node_9 = $.sibling(node_8, 2);

	$.component(node_9, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.1 });
	});

	$.append($$anchor, fragment);
	$.pop();
}