import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Audio } from '@threlte/extras';
import { Tween } from 'svelte/motion';
import { arenaBorderWidth, arenaHeight, arenaWidth, blockGap } from '../config';
import { useTimeout } from '../hooks/useTimeout.svelte';
import { levels } from './levels';
import { game } from '../Game.svelte';
import Block from '../objects/Block.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Level($$anchor, $$props) {
	$.push($$props, true);

	let blocks = $.state($.proxy([]));
	const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const bgVolume = new Tween(0.6);

	const map = (value, inMin, inMax, outMin, outMax) => {
		return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	};

	const playbackRate = map(game.levelIndex, 0, levels.length - 1, 1.0, 2);
	let levelStarted = false;

	const buildBlocks = async () => {
		if (game.state !== 'level-loading') return;

		const { rows, columns } = levels[game.levelIndex];
		const blockSize = (arenaWidth - arenaBorderWidth - ((columns - 1) * blockGap + 2 * blockGap)) / columns;
		const startAtX = (arenaWidth - arenaBorderWidth) / 2 * -1 + blockSize / 2;
		const startAtZ = (arenaHeight - arenaBorderWidth) / 2 * -1 + blockSize / 2 + blockGap;

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < columns; j++) {
				$.get(blocks).push({
					position: {
						x: startAtX + blockGap + j * blockGap + j * blockSize,
						z: startAtZ + i * blockGap + i * blockSize
					},
					hit: false,
					size: blockSize,
					freeze: false,
					staticColors: { inner: 'blue', outer: 'red' },
					blinkingColors: undefined
				});

				$.set(blocks, $.get(blocks), true);
				await wait(16);
			}
		}

		levelStarted = true;
		game.state = 'await-ball-spawn';
	};

	const { timeout } = useTimeout();

	buildBlocks();

	const onGameOver = async () => {
		if (!levelStarted) return;

		$.get(blocks).forEach((block) => {
			block.freeze = true;

			if (!block.hit) {
				block.blinkingColors = { innerA: 'red', innerB: 'black', outerA: 'red', outerB: 'red' };
			} else {
				block.blinkingColors = undefined;
				block.staticColors = { inner: 'black', outer: 'red' };
			}
		});

		timeout(
			() => {
				$.get(blocks).forEach((block) => {
					block.blinkingColors = undefined;

					if (!block.hit) {
						block.staticColors = { inner: 'red', outer: 'red' };
					} else {
						block.staticColors = { inner: 'black', outer: 'red' };
					}
				});
			},
			1e3
		);

		bgVolume.set(0, { duration: 300 });
		game.sound.play('gameOver2', { volume: 0.5 })?.onEnded();
	};

	const onLevelComplete = async () => {
		if (!levelStarted) return;

		$.get(blocks).forEach((block) => {
			block.freeze = true;

			block.blinkingColors = {
				innerA: 'black',
				innerB: 'green',
				outerA: 'white',
				outerB: 'white'
			};
		});

		timeout(
			() => {
				$.get(blocks).forEach((block) => {
					block.staticColors = { inner: 'green', outer: 'white' };
					block.blinkingColors = undefined;
				});
			},
			1e3
		);

		bgVolume.set(0.2, { duration: 200 });
		await game.sound.play('levelComplete')?.onEnded();
		bgVolume.set(0.6, { duration: 200 });
	};

	$.user_effect(() => {
		if (game.state === 'game-over') onGameOver();
		if (game.state === 'level-complete') onLevelComplete();
	});

	const onHit = (block) => {
		if (game.state === 'game-over' || game.state === 'level-complete') return;

		game.score += 1;
		block.hit = true;
		block.blinkingColors = undefined;
		block.staticColors = { inner: 'yellow', outer: 'red' };

		if ($.get(blocks).every((block) => block.hit)) {
			game.state = 'level-complete';
		}
	};

	var fragment = root();
	var node = $.first_child(fragment);

	Audio(node, {
		src: '/audio/level_slow.m4a',
		loop: true,
		autoplay: true,
		get volume() {
			return bgVolume.current;
		},

		get playbackRate() {
			return playbackRate;
		}
	});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => $.get(blocks), (block) => block, ($$anchor, block) => {
		Block($$anchor, $.spread_props(() => block, {
			onHit: () => {
				onHit(block);
			}
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}