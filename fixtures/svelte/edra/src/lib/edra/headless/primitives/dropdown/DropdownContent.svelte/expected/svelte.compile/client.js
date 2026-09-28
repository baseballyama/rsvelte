import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getDropdown } from './context.ts';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

var root = $.from_html(`<div style="left: 0; top: 0; width: max-content; min-width: 8rem; visibility: hidden;" role="menu"><!></div>`);

export default function DropdownContent($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		align = $.prop($$props, 'align', 3, 'start'),
		side = $.prop($$props, 'side', 3, 'bottom');

	const ctx = getDropdown();
	let element = $.state(null);

	$.user_effect(() => {
		ctx.setContent($.get(element));
	});

	$.user_effect(() => {
		if (ctx.open && ctx.triggerEl && $.get(element)) {
			updatePosition();
		}
	});

	function updatePosition() {
		if (!ctx.triggerEl || !$.get(element)) return;

		const placement = `${side()}${align() !== 'center' ? '-' + align() : ''}`;

		computePosition(ctx.triggerEl, $.get(element), {
			placement,
			middleware: [offset(4), flip(), shift({ padding: 8 })]
		}).then(({ x, y }) => {
			if ($.get(element)) {
				$.get(element).style.left = `${x}px`;
				$.get(element).style.top = `${y}px`;
				$.get(element).style.visibility = 'visible';
			}
		});
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.snippet(node_1, () => $$props.children);
			$.reset(div);
			$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));
			$.template_effect(() => $.set_class(div, 1, `edra-dropdown-content dropdown-content ${className() ?? ''}`, 'svelte-1mu033d'));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (ctx.open) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}