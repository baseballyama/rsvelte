import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Folder, Textarea } from 'svelte-tweakpane-ui';
import { useObjectSelection } from '../object-selection/useObjectSelection.svelte.js';
import Camera from './bindings/Camera.svelte';
import Light from './bindings/Light.svelte';
import Material from './bindings/Material.svelte';
import Object3DBinding from './bindings/Object3D.svelte';
import { areCamera, areLight, haveMaterialProperty } from './bindings/utils.js';

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Bindings($$anchor, $$props) {
	$.push($$props, true);

	const objectSelection = useObjectSelection();

	const keyFromObjects = (objects) => {
		return objects.map((object) => object.uuid).join();
	};

	const firstObjectUserData = $.derived(() => JSON.stringify(objectSelection.selectedObjects[0].userData, null, 2));
	const objects = $.derived(() => objectSelection.selectedObjects);
	var fragment = root_1();
	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.key(node_1, () => keyFromObjects($.get(objects)), ($$anchor) => {
				var fragment_2 = root();
				var node_2 = $.first_child(fragment_2);

				Object3DBinding(node_2, {
					get objects() {
						return $.get(objects);
					}
				});

				var node_3 = $.sibling(node_2, 2);

				{
					var consequent = ($$anchor) => {
						Folder($$anchor, {
							title: 'Camera',
							expanded: true,
							children: ($$anchor, $$slotProps) => {
								Camera($$anchor, {
									get objects() {
										return $.get(objects);
									}
								});
							},
							$$slots: { default: true }
						});
					};

					var d = $.derived(() => areCamera($.get(objects)));

					$.if(node_3, ($$render) => {
						if ($.get(d)) $$render(consequent);
					});
				}

				var node_4 = $.sibling(node_3, 2);

				{
					var consequent_1 = ($$anchor) => {
						Material($$anchor, {
							get objects() {
								return $.get(objects);
							}
						});
					};

					var d_1 = $.derived(() => haveMaterialProperty($.get(objects)));

					$.if(node_4, ($$render) => {
						if ($.get(d_1)) $$render(consequent_1);
					});
				}

				var node_5 = $.sibling(node_4, 2);

				{
					var consequent_2 = ($$anchor) => {
						Light($$anchor, {
							get lights() {
								return $.get(objects);
							}
						});
					};

					var d_2 = $.derived(() => areLight($.get(objects)));

					$.if(node_5, ($$render) => {
						if ($.get(d_2)) $$render(consequent_2);
					});
				}

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(objects).length) $$render(consequent_3);
		});
	}

	var node_6 = $.sibling(node, 2);

	{
		var consequent_4 = ($$anchor) => {
			Folder($$anchor, {
				title: 'User Data',
				expanded: false,
				children: ($$anchor, $$slotProps) => {
					Textarea($$anchor, {
						get value() {
							return $.get(firstObjectUserData);
						},
						disabled: true,
						rows: 5
					});
				},
				$$slots: { default: true }
			});
		};

		$.if(node_6, ($$render) => {
			if ($.get(firstObjectUserData)) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}