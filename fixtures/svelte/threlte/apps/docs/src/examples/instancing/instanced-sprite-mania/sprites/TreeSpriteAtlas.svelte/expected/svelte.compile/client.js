import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InstancedSprite, buildSpritesheet } from '@threlte/extras';
import { AdaptedPoissonDiscSample as Sampler } from '../util';

export default function TreeSpriteAtlas($$anchor, $$props) {
	$.push($$props, true);

	let billboarding = $.prop($$props, 'billboarding', 3, false);

	const treeAtlasMeta = [
		{
			url: '/textures/sprites/trees-pixelart.png',
			type: 'rowColumn',
			width: 8,
			height: 3,
			animations: [
				{ name: 'green_0', frameRange: [0, 0] },
				{ name: 'green_1', frameRange: [1, 1] },
				{ name: 'green_2', frameRange: [2, 2] },
				{ name: 'green_3', frameRange: [3, 3] },
				{ name: 'green_4', frameRange: [4, 4] },
				{ name: 'green_5', frameRange: [5, 5] },
				{ name: 'green_6', frameRange: [6, 6] },
				{ name: 'green_7', frameRange: [7, 7] },
				{ name: 'green_8', frameRange: [12, 12] },
				{ name: 'green_9', frameRange: [13, 13] },
				{ name: 'green_10', frameRange: [14, 14] },
				{ name: 'green_11', frameRange: [15, 15] },
				{ name: 'red_0', frameRange: [8, 8] },
				{ name: 'red_1', frameRange: [9, 9] },
				{ name: 'red_2', frameRange: [10, 10] },
				{ name: 'red_3', frameRange: [11, 11] },
				{ name: 'red_4', frameRange: [20, 20] },
				{ name: 'red_5', frameRange: [21, 21] },
				{ name: 'red_6', frameRange: [22, 22] },
				{ name: 'red_7', frameRange: [23, 23] },
				{ name: 'dead_0', frameRange: [16, 16] },
				{ name: 'dead_1', frameRange: [17, 17] },
				{ name: 'dead_2', frameRange: [18, 18] },
				{ name: 'dead_3', frameRange: [19, 19] }
			]
		}
	];

	const treeAtlas = buildSpritesheet.from(treeAtlasMeta);
	const treePositions = [];

	for (let x = 0; x < 5; x++) {
		for (let z = 0; z < 5; z++) {
			treePositions.push([x, 0.5, z]);
		}
	}

	const REGION_W = 600;
	const REGION_Z = 600;
	const greenTrees = 11;
	const redTrees = 7;
	const deadTrees = 3;
	const maxRadius = 300;
	const sampler = new Sampler(4, [REGION_W, REGION_Z], undefined, Math.random);

	const points = sampler.GeneratePoints().filter((v) => {
		return Math.sqrt((v[0] ?? 0 - REGION_W / 2) ** 2 + (v[1] ?? 0 - REGION_Z / 2) ** 2) < maxRadius;
	});

	const pickRandomTreeType = () => {
		const rnd = Math.random();

		if (rnd > 0.97) {
			return `dead_${Math.floor(deadTrees * Math.random())}`;
		}

		if (rnd > 0.9) {
			return `red_${Math.floor(redTrees * Math.random())}`;
		}

		return `green_${Math.floor(greenTrees * Math.random())}`;
	};

	let sprite = $.state(void 0);

	$.user_effect(() => {
		// manually update once to apply tree atlas
		// also, flip random trees on X axis for more variety
		if ($.get(sprite)) {
			for (let i = 0; i < points.length; i++) {
				$.get(sprite).flipX.setAt(i, Math.random() > 0.6 ? true : false);
			}

			$.get(sprite).update();
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => treeAtlas.spritesheet, null, ($$anchor, spritesheet) => {
		{
			const children = ($$anchor, $$arg0) => {
				let Instance = () => ($$arg0?.()).Instance;
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				$.each(node_1, 17, () => points, $.index, ($$anchor, $$item, i) => {
					var $$array = $.derived(() => $.to_array($.get($$item), 2));
					let x = $.derived_safe_equal(() => $.fallback($.get($$array)[0], 0));
					let z = $.derived_safe_equal(() => $.fallback($.get($$array)[1], 0));
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					{
						var consequent = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_3 = $.first_child(fragment_4);

							{
								let $0 = $.derived(() => [$.get(x) - REGION_W / 2, 1.5, $.get(z) - REGION_Z / 2]);
								let $1 = $.derived(pickRandomTreeType);

								$.component(node_3, Instance, ($$anchor, Instance_1) => {
									Instance_1($$anchor, {
										get position() {
											return $.get($0);
										},
										id: i,
										get animationName() {
											return $.get($1);
										},
										scale: [3, 3]
									});
								});
							}

							$.append($$anchor, fragment_4);
						};

						var alternate = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_4 = $.first_child(fragment_5);

							{
								let $0 = $.derived(() => [$.get(x) - REGION_W / 2, 1.5, $.get(z) - REGION_Z / 2]);

								$.component(node_4, Instance, ($$anchor, Instance_2) => {
									Instance_2($$anchor, {
										get position() {
											return $.get($0);
										},
										id: i,
										scale: [3, 3],
										frameId: Math.floor(Math.random() * 24)
									});
								});
							}

							$.append($$anchor, fragment_5);
						};

						$.if(node_2, ($$render) => {
							if (i < points.length / 2) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_3);
				});

				$.append($$anchor, fragment_2);
			};

			InstancedSprite($$anchor, {
				get count() {
					return points.length;
				},
				autoUpdate: false,
				playmode: 'PAUSE',
				get billboarding() {
					return billboarding();
				},

				get spritesheet() {
					return $.get(spritesheet);
				},
				castShadow: true,
				get ref() {
					return $.get(sprite);
				},

				set ref($$value) {
					$.set(sprite, $$value, true);
				},
				children,
				$$slots: { default: true }
			});
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}