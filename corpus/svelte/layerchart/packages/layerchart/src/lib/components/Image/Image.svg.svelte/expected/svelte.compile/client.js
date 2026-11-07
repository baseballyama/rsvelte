import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cls } from '@layerstack/tailwind';
import { createId } from '$lib/utils/createId.js';
import { ImageState, imageMarkInfo } from './Image.shared.svelte.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'href',
	'ref',
	'preserveAspectRatio',
	'crossOrigin',
	'imageRendering',
	'class',
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
	'opacity'
]);

var root = $.from_svg(`<defs><clipPath><circle></circle></clipPath></defs>`);
var root_1 = $.from_svg(`<!><image></image>`, 1);

export default function Image_svg($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let refProp = $.prop($$props, 'ref', 15),
		preserveAspectRatio = $.prop($$props, 'preserveAspectRatio', 3, 'xMidYMid meet'),
		// Pull out props that collide with `<image>` SVG attribute names so spread
		// doesn't clobber our explicit attrs.
		rest = $.rest_props($$props, rest_excludes);

	const c = new ImageState(() => ({
		href: $$props.href,
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
		opacity: $$props.opacity,
		...rest
	}));

	const clipId = createId('image-clip', uid);
	let ref = $.state(void 0);

	$.user_pre_effect(() => {
		refProp($.get(ref));
	});

	c.chartCtx.registerComponent({
		name: 'Image',
		kind: 'mark',
		markInfo: () => imageMarkInfo({ x: $$props.x, y: $$props.y, data: $$props.data, ...rest }, c.dataMode)
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 19, () => c.resolvedItems, (item) => item.key, ($$anchor, item, i) => {
				const resolvedHrefValue = $.derived(() => c.resolveHref($.get(item).d));
				const renderX = $.derived(() => $.get(item).x - $.get(item).width / 2);
				const renderY = $.derived(() => $.get(item).y - $.get(item).height / 2);
				var fragment_2 = root_1();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent = ($$anchor) => {
						var defs = root();
						var clipPath = $.child(defs);
						var circle = $.only_child(clipPath);

						$.reset(defs);

						$.template_effect(() => {
							$.set_attribute(clipPath, 'id', `${clipId ?? ''}-${$.get(i) ?? ''}`);
							$.set_attribute(circle, 'cx', $.get(item).x);
							$.set_attribute(circle, 'cy', $.get(item).y);
							$.set_attribute(circle, 'r', $.get(item).r);
						});

						$.append($$anchor, defs);
					};

					$.if(node_2, ($$render) => {
						if ($.get(item).r !== undefined) $$render(consequent);
					});
				}

				var image = $.sibling(node_2);

				$.attribute_effect(
					image,
					($0) => ({
						...rest,
						href: $.get(resolvedHrefValue),
						x: $.get(renderX),
						y: $.get(renderY),
						width: $.get(item).width,
						height: $.get(item).height,
						'clip-path': $.get(item).r !== undefined ? `url(#${clipId}-${$.get(i)})` : undefined,
						transform: $.get(item).rotate
							? `rotate(${$.get(item).rotate}, ${$.get(item).x}, ${$.get(item).y})`
							: undefined,
						preserveAspectRatio: preserveAspectRatio(),
						crossorigin: $$props.crossOrigin,
						'image-rendering': $$props.imageRendering,
						opacity: $$props.opacity,
						class: $0
					}),
					[() => cls('lc-image', $$props.class)]
				);

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = root_1();
			var node_3 = $.first_child(fragment_3);

			{
				var consequent_2 = ($$anchor) => {
					var defs_1 = root();
					var clipPath_1 = $.child(defs_1);
					var circle_1 = $.only_child(clipPath_1);

					$.reset(defs_1);

					$.template_effect(() => {
						$.set_attribute(clipPath_1, 'id', clipId);
						$.set_attribute(circle_1, 'cx', c.motionX);
						$.set_attribute(circle_1, 'cy', c.motionY);
						$.set_attribute(circle_1, 'r', c.pixelR);
					});

					$.append($$anchor, defs_1);
				};

				$.if(node_3, ($$render) => {
					if (c.pixelR !== undefined) $$render(consequent_2);
				});
			}

			var image_1 = $.sibling(node_3);

			$.attribute_effect(
				image_1,
				($0) => ({
					...rest,
					href: typeof $$props.href === 'string' ? $$props.href : undefined,
					x: c.motionX - c.motionWidth / 2,
					y: c.motionY - c.motionHeight / 2,
					width: c.motionWidth,
					height: c.motionHeight,
					'clip-path': c.pixelR !== undefined ? `url(#${clipId})` : undefined,
					transform: c.pixelRotate
						? `rotate(${c.pixelRotate}, ${c.motionX}, ${c.motionY})`
						: undefined,
					preserveAspectRatio: preserveAspectRatio(),
					crossorigin: $$props.crossOrigin,
					'image-rendering': $$props.imageRendering,
					opacity: $$props.opacity,
					class: $0
				}),
				[() => cls('lc-image', $$props.class)]
			);

			$.bind_this(image_1, ($$value) => $.set(ref, $$value), () => $.get(ref));
			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (c.dataMode) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}