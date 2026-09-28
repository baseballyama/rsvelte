import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'name',
	'size',
	'viewBox',
	'flip',
	'rotate'
]);

var root = $.from_svg(`<svg><path class="svelte-194f7vy"></path></svg>`);

export default function Icon($$anchor, $$props) {
	$.push($$props, true);

	let size = $.prop($$props, 'size', 3, '24'),
		viewBox = $.prop($$props, 'viewBox', 3, '0 0 24 24'),
		flip = $.prop($$props, 'flip', 3, 'none'),
		rotate = $.prop($$props, 'rotate', 3, 0),
		rest = $.rest_props($$props, rest_excludes);

	let sx = $.derived(() => ['both', 'horizontal'].includes(flip()) ? '-1' : '1');
	let sy = $.derived(() => ['both', 'vertical'].includes(flip()) ? '-1' : '1');
	let r = $.derived(() => Number.isNaN(rotate()) ? rotate() : `${rotate()}deg`);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(node, () => import(`@mdi/js`), null, ($$anchor, paths) => {
		var svg = root();

		$.attribute_effect(
			svg,
			() => ({
				width: size(),
				height: size(),
				viewBox: viewBox(),
				style: `--sx:${$.get(sx) ?? ''}; --sy:${$.get(sy) ?? ''}; --r:${$.get(r) ?? ''}`,
				...rest,
				[$.CLASS]: { spin: $$props.name === 'mdiLoading' }
			}),
			void 0,
			void 0,
			void 0,
			'svelte-194f7vy'
		);

		var path = $.only_child(svg);

		$.template_effect(() => $.set_attribute(path, 'd', $.get(paths)[$$props.name]));
		$.append($$anchor, svg);
	});

	$.append($$anchor, fragment);
	$.pop();
}