import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { ImageState, imageMarkInfo } from './Image.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'href',
	'crossOrigin',
	'class',
	'opacity',
	'x',
	'y',
	'width',
	'height',
	'r',
	'rotate',
	'initialX',
	'initialY',
	'initialWidth',
	'initialHeight',
	'data',
	'key',
	'motion',
	'preserveAspectRatio',
	'imageRendering'
]);

var root = $.from_html(`<img/>`);

export default function Image_html($$anchor, $$props) {
	$.push($$props, true);

	let // Pull internal-only props out
	rest = $.rest_props($$props, rest_excludes);

	const c = new ImageState(() => ({
		href: $$props.href,
		crossOrigin: $$props.crossOrigin,
		class: $$props.class,
		opacity: $$props.opacity,
		x: $$props.x,
		y: $$props.y,
		width: $$props.width,
		height: $$props.height,
		r: $$props.r,
		rotate: $$props.rotate,
		initialX: $$props.initialX,
		initialY: $$props.initialY,
		initialWidth: $$props.initialWidth,
		initialHeight: $$props.initialHeight,
		data: $$props.data,
		key: $$props.key,
		motion: $$props.motion,
		preserveAspectRatio: $$props.preserveAspectRatio,
		imageRendering: $$props.imageRendering,
		...rest
	}));

	c.chartCtx.registerComponent({
		name: 'Image',
		kind: 'mark',
		markInfo: () => imageMarkInfo({ x: $$props.x, y: $$props.y, data: $$props.data, ...rest }, c.dataMode)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, () => c.resolvedItems, (item) => item.key, ($$anchor, item) => {
				const resolvedHrefValue = $.derived(() => c.resolveHref($.get(item).d));
				var img = root();

				$.attribute_effect(
					img,
					($0) => ({
						src: $.get(resolvedHrefValue),
						alt: '',
						crossorigin: $$props.crossOrigin,
						class: $0,
						...rest,
						[$.STYLE]: {
							position: 'absolute',
							left: `${$.get(item).x - $.get(item).width / 2}px`,
							top: `${$.get(item).y - $.get(item).height / 2}px`,
							width: `${$.get(item).width ?? ''}px`,
							height: `${$.get(item).height ?? ''}px`,
							'clip-path': $.get(item).r !== undefined ? `circle(${$.get(item).r}px at center)` : undefined,
							transform: $.get(item).rotate ? `rotate(${$.get(item).rotate}deg)` : undefined,
							opacity: $$props.opacity,
							'object-fit': 'cover'
						}
					}),
					[() => cls('lc-image', $$props.class)]
				);

				$.replay_events(img);
				$.append($$anchor, img);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var img_1 = root();

			$.attribute_effect(
				img_1,
				($0) => ({
					src: typeof $$props.href === 'string' ? $$props.href : undefined,
					alt: '',
					crossorigin: $$props.crossOrigin,
					class: $0,
					...rest,
					[$.STYLE]: {
						position: 'absolute',
						left: `${c.motionX - c.motionWidth / 2}px`,
						top: `${c.motionY - c.motionHeight / 2}px`,
						width: `${c.motionWidth ?? ''}px`,
						height: `${c.motionHeight ?? ''}px`,
						'clip-path': c.pixelR !== undefined ? `circle(${c.pixelR}px at center)` : undefined,
						transform: c.pixelRotate ? `rotate(${c.pixelRotate}deg)` : undefined,
						opacity: $$props.opacity,
						'object-fit': 'cover'
					}
				}),
				[() => cls('lc-image', $$props.class)]
			);

			$.replay_events(img_1);
			$.append($$anchor, img_1);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}