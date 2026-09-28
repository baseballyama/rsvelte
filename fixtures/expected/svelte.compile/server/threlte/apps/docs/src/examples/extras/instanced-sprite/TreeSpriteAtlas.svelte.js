import * as $ from 'svelte/internal/server';
import { InstancedSprite, buildSpritesheet } from '@threlte/extras';
import { AdaptedPoissonDiscSample as Sampler } from './util';

export default function TreeSpriteAtlas($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { billboarding = false } = $$props;

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
		const maxRadius = 107;
		const sampler = new Sampler(4, [REGION_W, REGION_Z], undefined, Math.random);

		const points = sampler.GeneratePoints().filter(([x, y]) => {
			return Math.sqrt(((x ?? 0) - REGION_W / 2) ** 2 + ((y ?? 0) - REGION_Z / 2) ** 2) < maxRadius;
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

		let sprite = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.await($$renderer, treeAtlas.spritesheet, () => {}, (spritesheet) => {
				{
					function children($$renderer, { Instance }) {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(points);

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let [x, z] = each_array[i];

							if (i < points.length / 2) {
								$$renderer.push('<!--[0-->');

								if (Instance) {
									$$renderer.push('<!--[-->');

									Instance($$renderer, {
										position: [x - REGION_W / 2, 1.5, z - REGION_Z / 2],
										id: i,
										animationName: pickRandomTreeType(),
										scale: [3, 3]
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');

								if (Instance) {
									$$renderer.push('<!--[-->');

									Instance($$renderer, {
										position: [x - REGION_W / 2, 1.5, z - REGION_Z / 2],
										id: i,
										scale: [3, 3],
										frameId: Math.floor(Math.random() * 24)
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					}

					InstancedSprite($$renderer, {
						count: points.length,
						autoUpdate: false,
						playmode: 'PAUSE',
						billboarding,
						spritesheet,
						castShadow: true,
						get ref() {
							return sprite;
						},

						set ref($$value) {
							sprite = $$value;
							$$settled = false;
						},
						children,
						$$slots: { default: true }
					});
				}
			});

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}