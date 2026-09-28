import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, useTask } from '@threlte/core';
import { Instance, InstancedMesh, useTexture } from '@threlte/extras';
import { Color, DoubleSide, MathUtils } from 'three';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Stars($$anchor, $$props) {
	$.push($$props, true);

	let STARS_COUNT = 350;
	let colors = ['#fcaa67', '#C75D59', '#ffffc7', '#8CC5C6', '#A5898C'];
	let stars = $.proxy([]);
	const map = useTexture('/spaceship-tutorial/textures/star.png');

	function r(min, max) {
		let diff = Math.random() * (max - min);

		return min + diff;
	}

	function resetStar(star) {
		if (r(0, 1) > 0.8) {
			star.position = [r(-10, -30), r(-5, 5), r(6, -6)];
			star.length = r(1.5, 15);
		} else {
			star.position = [r(-15, -45), r(-10.5, 1.5), r(30, -45)];
			star.length = r(2.5, 20);
		}

		star.speed = r(19.5, 42);
		star.color.set(colors[Math.floor(Math.random() * colors.length)] ?? 'white').convertSRGBToLinear().multiplyScalar(1.3);
	}

	for (let i = 0; i < STARS_COUNT; i++) {
		const star = {
			id: MathUtils.generateUUID(),
			position: [0, 0, 0],
			length: 0,
			speed: 0,
			color: new Color()
		};

		resetStar(star);
		stars.push(star);
	}

	useTask((delta) => {
		for (const star of stars) {
			star.position[0] += star.speed * delta;

			if (star.position[0] > 40) {
				resetStar(star);
			}
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => map, null, ($$anchor, value) => {
		InstancedMesh($$anchor, {
			limit: STARS_COUNT,
			range: STARS_COUNT,
			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_1 = $.first_child(fragment_2);

				$.component(node_1, () => T.PlaneGeometry, ($$anchor, T_PlaneGeometry) => {
					T_PlaneGeometry($$anchor, { args: [1, 0.05] });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => T.MeshBasicMaterial, ($$anchor, T_MeshBasicMaterial) => {
					T_MeshBasicMaterial($$anchor, {
						get side() {
							return DoubleSide;
						},

						get alphaMap() {
							return $.get(value);
						},
						transparent: true
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.each(node_3, 17, () => stars, ({ id, position, length, color }) => id, ($$anchor, $$item) => {
					let id = () => $.get($$item).id;
					let position = () => $.get($$item).position;
					let length = () => $.get($$item).length;
					let color = () => $.get($$item).color;

					{
						let $0 = $.derived(() => [length(), 1, 1]);

						Instance($$anchor, {
							get position() {
								return position();
							},

							get scale() {
								return $.get($0);
							},

							get color() {
								return color();
							}
						});
					}
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}