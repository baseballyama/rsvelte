import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BoxGeometry, MeshStandardMaterial } from 'three';
import { T, useTask } from '@threlte/core';

var root = $.from_html(`<!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	let rotation = 0;

	useTask((delta) => {
		rotation += delta;
	});

	var fragment = root();
	var node = $.first_child(fragment);

	$.component(node, () => T.DirectionalLight, ($$anchor, T_DirectionalLight) => {
		T_DirectionalLight($$anchor, { 'position.y': 10, 'position.z': 10 });
	});

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => [rotation, rotation, rotation]);
		let $1 = $.derived(() => new BoxGeometry(2, 2, 2));
		let $2 = $.derived(() => new MeshStandardMaterial());

		$.component(node_1, () => T.Mesh, ($$anchor, T_Mesh) => {
			T_Mesh($$anchor, {
				get rotation() {
					return $.get($0);
				},

				get geometry() {
					return $.get($1);
				},

				get material() {
					return $.get($2);
				}
			});
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}