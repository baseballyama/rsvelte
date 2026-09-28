import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PlusIcon from '@lucide/svelte/icons/plus';

var root = $.from_html(`<section class="relative"><!> <div><!></div></section>`);

export default function Decor_corners($$anchor, $$props) {
	let corners = $.prop($$props, 'corners', 19, () => []);

	const cornerClasses = {
		tl: 'top-0 left-0 translate-x-[-50%] translate-y-[-50%]',
		tr: 'top-0 right-0 translate-x-[50%] translate-y-[-50%]',
		bl: 'bottom-0 left-0 translate-x-[-50%] translate-y-[50%]',
		br: 'bottom-0 right-0 translate-x-[50%] translate-y-[50%]'
	};

	var section = root();
	var node = $.child(section);

	$.each(node, 17, corners, $.index, ($$anchor, corner) => {
		PlusIcon($$anchor, {
			get class() {
				return `absolute stroke-surface-600-400 size-elem-sm ${cornerClasses[$.get(corner)] ?? ''}`;
			}
		});
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(div);
	$.reset(section);
	$.template_effect(() => $.set_class(div, 1, $.clsx($$props.class)));
	$.append($$anchor, section);
}