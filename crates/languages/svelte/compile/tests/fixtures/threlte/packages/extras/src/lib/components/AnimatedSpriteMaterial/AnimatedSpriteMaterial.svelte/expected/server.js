import * as $ from 'svelte/internal/server';

import {
	asyncWritable,
	isInstanceOf,
	T,
	useLoader,
	useParent,
	useTask,
	observe
} from '@threlte/core';

import {
	DoubleSide,
	FileLoader,
	LinearFilter,
	MeshBasicMaterial,
	NearestFilter,
	RepeatWrapping,
	RGBADepthPacking,
	SpriteMaterial
} from 'three';

import { useTexture } from '../../hooks/useTexture.js';
import { useSuspense } from '../../suspense/useSuspense.js';

export default function AnimatedSpriteMaterial($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			textureUrl,
			dataUrl = '',
			animation = '',
			loop = true,
			autoplay = true,
			fps = 10,
			filter = 'nearest',
			alphaTest = 0.1,
			delay = 0,
			transparent = true,
			flipX = false,
			startFrame = 0,
			endFrame = undefined,
			rows = 1,
			columns = undefined,
			totalFrames = 0,
			is,
			ref = void 0,
			onload,
			onstart,
			onend,
			onloop,
			$$slots,
			$$events,
			...props
		} = $$props;

		const parent = useParent();
		const supportedDirections = ['forward', 'reverse'];

		const isSupportedDirection = (value) => {
			const isSupported = supportedDirections.includes(value);

			if (!isSupported) {
				console.warn(`frame tag direction: "${value}" is not supported.${dataUrl != ''
					? `\nsource dataURL: ${dataUrl}`
					: `\ntexture URL: ${textureUrl}`}`);
			}

			return isSupported;
		};

		let timerOffset = 0;
		let currentFrame = startFrame;
		let numFrames = 0;
		let flipOffset = flipX ? -1 : 1;
		let frameWidth = 0;
		let frameHeight = 0;
		let texture = void 0;
		let json;
		let frameNames = [];
		let direction = 'forward';
		let frameTag;
		let spritesheetSize = { w: 0, h: 0 };
		let fpsInterval = $.derived(() => 1000 / fps);
		let isMesh = $.derived(() => $.store_get($$store_subs ??= {}, '$parent', parent) !== undefined && isInstanceOf($.store_get($$store_subs ??= {}, '$parent', parent), 'Mesh'));
		const suspend = useSuspense();

		const textureStore = suspend(useTexture(textureUrl, {
			transform: (value) => {
				value.matrixAutoUpdate = false;
				value.generateMipmaps = false;
				value.premultiplyAlpha = false;
				value.wrapS = value.wrapT = RepeatWrapping;
				value.magFilter = value.minFilter = filter === 'nearest' ? NearestFilter : LinearFilter;

				return value;
			}
		}));

		const jsonStore = suspend(dataUrl
			? useLoader(FileLoader).load(dataUrl, {
				transform: (file) => {
					if (typeof file !== 'string') return;

					try {
						return JSON.parse(file);
					} catch {
						return;
					}
				}
			})
			: asyncWritable(new Promise((resolve) => {
				const unsub = textureStore.subscribe((value) => {
					if (!value) return;

					unsub();
					resolve(createData(value));
				});
			})));

		/**
		 * Creates metadata if no JSON file is supplied.
		 */
		const createData = (texture) => {
			const { width, height } = texture.image;
			const cols = columns ?? totalFrames;

			numFrames = totalFrames;

			const frameWidth = width / cols;
			const frameHeight = height / rows;

			const data = {
				frames: {},
				meta: {
					app: '',
					image: '',
					format: '',
					frameTags: [],
					version: '1.0',
					size: { w: width, h: height },
					scale: 1
				}
			};

			for (let i = 0; i < numFrames; i += 1) {
				// Calculate the row and column for the current frame
				const row = Math.floor(i / cols);

				const col = i % cols;

				// Calculate the x, y coordinates of the frame within the sprite sheet
				const x = col * frameWidth;

				const y = row * frameHeight;

				data.frames[`${i}`] = {
					frame: { x, y, w: frameWidth, h: frameHeight },
					spriteSourceSize: { x: 0, y: 0, w: frameWidth, h: frameHeight },
					sourceSize: { w: frameWidth, h: frameHeight }
				};
			}

			return data;
		};

		const setFrame = (frame) => {
			const horizontalFrames = spritesheetSize.w / frameWidth;
			const verticalFrames = spritesheetSize.h / frameHeight;
			const frameOffsetX = 1 / horizontalFrames;
			const frameOffsetY = 1 / verticalFrames;

			const x = flipOffset > 0
				? frameOffsetX * (frame.x / frameWidth)
				: frameOffsetX * (frame.x / frameHeight) - texture.repeat.x;

			const y = Math.abs(1 - frameOffsetY) - frameOffsetY * (frame.y / frameHeight);

			texture?.offset.set(x, y);
			texture?.updateMatrix();
		};

		const setAnimation = (name) => {
			if (!json) return;

			frameTag = json?.meta.frameTags.find((tag) => tag.name === name);
			direction = 'forward';

			if (frameTag?.direction) {
				direction = isSupportedDirection(frameTag?.direction) ? frameTag.direction : 'forward';
			}

			currentFrame = direction === 'forward' ? frameTag?.from ?? 0 : frameTag?.to ?? numFrames - 1;
			setFrame(json.frames[frameNames[currentFrame]].frame);
			onstart?.();
		};

		let playQueued = false;
		let running = false;

		/**
		 * Plays the animation.
		 */
		const play = async () => {
			playQueued = true;
			await Promise.all([textureStore, jsonStore]);

			if (!playQueued) return;

			timerOffset = performance.now() - delay;
			running = true;
		};

		/**
		 * Pauses the animation.
		 */
		const pause = () => {
			playQueued = false;
			running = false;
		};

		useTask(
			() => {
				if (!json) return;

				const now = performance.now();
				const diff = now - timerOffset;
				const name = frameNames[currentFrame];
				const { frame, duration } = json.frames[name];
				const interval = duration ?? fpsInterval();

				if (diff <= interval) return;

				timerOffset = now - diff % interval;

				// start and end are the first and last frames of the animation respectively
				const start = direction === 'forward'
					? frameTag?.from ?? startFrame ?? 0
					: frameTag?.to ?? endFrame ?? numFrames - 1;

				const end = direction === 'forward'
					? frameTag?.to ?? endFrame ?? numFrames - 1
					: frameTag?.from ?? startFrame ?? 0;

				setFrame(frame);

				switch (direction) {
					case 'forward':
						currentFrame += 1;
						break;

					case 'reverse':
						currentFrame -= 1;
						break;

					default:
						break;
				}

				if (direction === 'forward' && currentFrame > end || direction === 'reverse' && currentFrame < end) {
					currentFrame = start;

					if (loop) {
						onloop?.();
					} else {
						pause();
						onend?.();
					}
				}
			},
			{ running: () => running }
		);

		observe.pre(() => [textureStore, jsonStore], ([nextTexture, nextJson]) => {
			if (nextTexture === undefined || nextJson === undefined) return;

			texture = nextTexture.clone();
			json = nextJson;
			frameNames = Object.keys(json.frames);
			numFrames = frameNames.length;
			spritesheetSize = json.meta.size;

			const { sourceSize } = Object.values(json.frames)[0];

			frameWidth = sourceSize.w;
			frameHeight = sourceSize.h;
			texture.repeat.set(1 * flipOffset / (spritesheetSize.w / frameWidth), 1 / (spritesheetSize.h / frameHeight));
			setAnimation(animation);
			onload?.();

			if (autoplay) {
				play();
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (texture && isMesh()) {
				$$renderer.push('<!--[0-->');

				T($$renderer, $.spread_props([
					{
						is,
						map: texture,
						toneMapped: false,
						side: DoubleSide,
						shadowSide: DoubleSide,
						transparent,
						alphaTest
					},
					props,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));

				$$renderer.push(`<!----> `);

				if (T.MeshDepthMaterial) {
					$$renderer.push('<!--[-->');

					T.MeshDepthMaterial($$renderer, {
						attach: 'customDepthMaterial',
						depthPacking: RGBADepthPacking,
						map: texture,
						alphaTest
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else if (texture) {
				$$renderer.push('<!--[1-->');

				T($$renderer, $.spread_props([
					{ is, map: texture, toneMapped: false, transparent, alphaTest },
					props,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						}
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { ref, play, pause });
	});
}