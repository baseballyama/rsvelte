import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CursorLine from './CursorLine.svelte';
import { MeshLineGeometry, MeshLineMaterial } from '@threlte/extras';
import { Spring } from 'svelte/motion';
import { T } from '@threlte/core';
import { interactivity } from '@threlte/extras';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);
	interactivity();

	const cursorPosition = new Spring([0, 0, 0]);

	const colors = [
		'#0000ff',
		'#00ff00',
		'#00ffff',
		'#ff0000',
		'#ff00ff',
		'#ffff00'
	];

	const m = 2 * Math.PI / colors.length;
	var fragment = root_1();
	var node = $.first_child(fragment);

	$.each(node, 17, () => colors, $.index, ($$anchor, color, i) => {
		const a = $.derived(() => m * i);

		{
			const children = ($$anchor, $$arg0) => {
				let getPoints = () => ($$arg0?.()).getPoints;
				var fragment_2 = root();
				var node_1 = $.first_child(fragment_2);

				{
					let $0 = $.derived(() => getPoints()());

					MeshLineGeometry(node_1, {
						get points() {
							return $.get($0);
						},
						shape: 'taper'
					});
				}

				var node_2 = $.sibling(node_1, 2);

				MeshLineMaterial(node_2, {
					width: 10,
					get color() {
						return $.get(color);
					},
					attenuate: false
				});

				$.append($$anchor, fragment_2);
			};

			let $0 = $.derived(() => 0.5 * Math.cos($.get(a)));
			let $1 = $.derived(() => 0.5 * Math.sin($.get(a)));

			CursorLine($$anchor, {
				get color() {
					return $.get(color);
				},

				get cursorPosition() {
					return cursorPosition.current;
				},

				get 'position.x'() {
					return $.get($0);
				},

				get 'position.y'() {
					return $.get($1);
				},
				children,
				$$slots: { default: true }
			});
		}
	});

	var node_3 = $.sibling(node, 2);

	$.component(node_3, () => T.OrthographicCamera, ($$anchor, T_OrthographicCamera) => {
		T_OrthographicCamera($$anchor, { zoom: 50, makeDefault: true });
	});

	var node_4 = $.sibling(node_3, 2);

	$.component(node_4, () => T.Mesh, ($$anchor, T_Mesh) => {
		T_Mesh($$anchor, {
			visible: false,
			onpointermove: (event) => {
				cursorPosition.set(event.point.toArray());
			},
			'position.z': -10,
			scale: 100,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = $.comment();
				var node_5 = $.first_child(fragment_3);

				$.component(node_5, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, {});
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}