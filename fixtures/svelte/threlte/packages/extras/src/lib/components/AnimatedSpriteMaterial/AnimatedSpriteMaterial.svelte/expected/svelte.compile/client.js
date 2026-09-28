import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'textureUrl',
	'dataUrl',
	'animation',
	'loop',
	'autoplay',
	'fps',
	'filter',
	'alphaTest',
	'delay',
	'transparent',
	'flipX',
	'startFrame',
	'endFrame',
	'rows',
	'columns',
	'totalFrames',
	'is',
	'ref',
	'onload',
	'onstart',
	'onend',
	'onloop'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function AnimatedSpriteMaterial($$anchor, $$props) {
	$.push($$props, true);

	const $parent = () => $.store_get(parent, '$parent', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let dataUrl = $.prop($$props, 'dataUrl', 3, ''),
		animation = $.prop($$props, 'animation', 3, ''),
		loop = $.prop($$props, 'loop', 3, true),
		autoplay = $.prop($$props, 'autoplay', 3, true),
		fps = $.prop($$props, 'fps', 3, 10),
		filter = $.prop($$props, 'filter', 3, 'nearest'),
		alphaTest = $.prop($$props, 'alphaTest', 3, 0.1),
		delay = $.prop($$props, 'delay', 3, 0),
		transparent = $.prop($$props, 'transparent', 3, true),
		flipX = $.prop($$props, 'flipX', 3, false),
		startFrame = $.prop($$props, 'startFrame', 3, 0),
		endFrame = $.prop($$props, 'endFrame', 3, undefined),
		rows = $.prop($$props, 'rows', 3, 1),
		columns = $.prop($$props, 'columns', 3, undefined),
		totalFrames = $.prop($$props, 'totalFrames', 3, 0),
		is = $.prop($$props, 'is', 7),
		ref = $.prop($$props, 'ref', 15),
		props = $.rest_props($$props, rest_excludes);

	const parent = useParent();
	const supportedDirections = ['forward', 'reverse'];

	const isSupportedDirection = (value) => {
		const isSupported = supportedDirections.includes(value);

		if (!isSupported) {
			console.warn(`frame tag direction: "${value}" is not supported.${dataUrl() != ''
				? `\nsource dataURL: ${dataUrl()}`
				: `\ntexture URL: ${$$props.textureUrl}`}`);
		}

		return isSupported;
	};

	let timerOffset = 0;
	let currentFrame = startFrame();
	let numFrames = 0;
	let flipOffset = flipX() ? -1 : 1;
	let frameWidth = 0;
	let frameHeight = 0;
	let texture = $.state(void 0);
	let json;
	let frameNames = [];
	let direction = 'forward';
	let frameTag;
	let spritesheetSize = { w: 0, h: 0 };
	let fpsInterval = $.derived(() => 1000 / fps());
	let isMesh = $.derived(() => $parent() !== undefined && isInstanceOf($parent(), 'Mesh'));

	$.user_pre_effect(() => {
		is(is() ?? ($.get(isMesh) ? new MeshBasicMaterial() : new SpriteMaterial()));
	});

	const suspend = useSuspense();

	const textureStore = suspend(useTexture($$props.textureUrl, {
		transform: (value) => {
			value.matrixAutoUpdate = false;
			value.generateMipmaps = false;
			value.premultiplyAlpha = false;
			value.wrapS = value.wrapT = RepeatWrapping;
			value.magFilter = value.minFilter = filter() === 'nearest' ? NearestFilter : LinearFilter;

			return value;
		}
	}));

	const jsonStore = suspend(dataUrl()
		? useLoader(FileLoader).load(dataUrl(), {
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
		const cols = columns() ?? totalFrames();

		numFrames = totalFrames();

		const frameWidth = width / cols;
		const frameHeight = height / rows();

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
			: frameOffsetX * (frame.x / frameHeight) - $.get(texture).repeat.x;

		const y = Math.abs(1 - frameOffsetY) - frameOffsetY * (frame.y / frameHeight);

		$.get(texture)?.offset.set(x, y);
		$.get(texture)?.updateMatrix();
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
		$$props.onstart?.();
	};

	let playQueued = false;
	let running = $.state(false);

	/**
	 * Plays the animation.
	 */
	const play = async () => {
		playQueued = true;
		await Promise.all([textureStore, jsonStore]);

		if (!playQueued) return;

		timerOffset = performance.now() - delay();
		$.set(running, true);
	};

	/**
	 * Pauses the animation.
	 */
	const pause = () => {
		playQueued = false;
		$.set(running, false);
	};

	useTask(
		() => {
			if (!json) return;

			const now = performance.now();
			const diff = now - timerOffset;
			const name = frameNames[currentFrame];
			const { frame, duration } = json.frames[name];
			const interval = duration ?? $.get(fpsInterval);

			if (diff <= interval) return;

			timerOffset = now - diff % interval;

			// start and end are the first and last frames of the animation respectively
			const start = direction === 'forward'
				? frameTag?.from ?? startFrame() ?? 0
				: frameTag?.to ?? endFrame() ?? numFrames - 1;

			const end = direction === 'forward'
				? frameTag?.to ?? endFrame() ?? numFrames - 1
				: frameTag?.from ?? startFrame() ?? 0;

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

				if (loop()) {
					$$props.onloop?.();
				} else {
					pause();
					$$props.onend?.();
				}
			}
		},
		{ running: () => $.get(running) }
	);

	observe.pre(() => [textureStore, jsonStore], ([nextTexture, nextJson]) => {
		if (nextTexture === undefined || nextJson === undefined) return;

		$.set(texture, nextTexture.clone(), true);
		json = nextJson;
		frameNames = Object.keys(json.frames);
		numFrames = frameNames.length;
		spritesheetSize = json.meta.size;

		const { sourceSize } = Object.values(json.frames)[0];

		frameWidth = sourceSize.w;
		frameHeight = sourceSize.h;
		$.get(texture).repeat.set(1 * flipOffset / (spritesheetSize.w / frameWidth), 1 / (spritesheetSize.h / frameHeight));
		setAnimation(animation());
		$$props.onload?.();

		if (autoplay()) {
			play();
		}
	});

	$.user_pre_effect(() => {
		setAnimation(animation());

		if (autoplay()) {
			play();
		}
	});

	var $$exports = { play, pause };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			T(node_1, $.spread_props(
				{
					get is() {
						return is();
					},

					get map() {
						return $.get(texture);
					},
					toneMapped: false,
					get side() {
						return DoubleSide;
					},

					get shadowSide() {
						return DoubleSide;
					},

					get transparent() {
						return transparent();
					},

					get alphaTest() {
						return alphaTest();
					}
				},
				() => props,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => T.MeshDepthMaterial, ($$anchor, T_MeshDepthMaterial) => {
				T_MeshDepthMaterial($$anchor, {
					attach: 'customDepthMaterial',
					get depthPacking() {
						return RGBADepthPacking;
					},

					get map() {
						return $.get(texture);
					},

					get alphaTest() {
						return alphaTest();
					}
				});
			});

			$.append($$anchor, fragment_1);
		};

		var consequent_1 = ($$anchor) => {
			T($$anchor, $.spread_props(
				{
					get is() {
						return is();
					},

					get map() {
						return $.get(texture);
					},
					toneMapped: false,
					get transparent() {
						return transparent();
					},

					get alphaTest() {
						return alphaTest();
					}
				},
				() => props,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));
		};

		$.if(node, ($$render) => {
			if ($.get(texture) && $.get(isMesh)) $$render(consequent); else if ($.get(texture)) $$render(consequent_1, 1);
		});
	}

	$.append($$anchor, fragment);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}