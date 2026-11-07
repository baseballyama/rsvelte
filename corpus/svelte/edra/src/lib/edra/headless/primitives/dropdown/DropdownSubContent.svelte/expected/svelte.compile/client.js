import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';

var root = $.from_html(`<div style="left: 0; top: 0; width: max-content; min-width: 8rem; visibility: hidden;" role="menu" tabindex="-1"><!></div>`);

export default function DropdownSubContent($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, '');
	const subCtx = getContext('edra-dropdown-sub');
	let element = $.state(null);

	$.user_effect(() => {
		subCtx.contentEl = $.get(element);
	});

	$.user_effect(() => {
		if (subCtx.open && subCtx.triggerEl && $.get(element)) {
			updatePosition();
		}
	});

	function updatePosition() {
		if (!subCtx.triggerEl || !$.get(element)) return;

		computePosition(subCtx.triggerEl, $.get(element), {
			placement: 'right-start',
			middleware: [offset(4), flip(), shift({ padding: 8 })]
		}).then(({ x, y }) => {
			if ($.get(element)) {
				$.get(element).style.left = `${x}px`;
				$.get(element).style.top = `${y}px`;
				$.get(element).style.visibility = 'visible';
			}
		});
	}

	let timeout;

	function handleMouseLeave() {
		clearTimeout(timeout);

		timeout = setTimeout(
			() => {
				if (subCtx.triggerEl && !subCtx.triggerEl.matches(':hover')) {
					subCtx.open = false;
				}
			},
			100
		);
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
			$.template_effect(() => $.set_class(div, 1, `edra-dropdown-content dropdown-subcontent ${className() ?? ''}`, 'svelte-1rd6k5p'));
			$.event('mouseleave', div, handleMouseLeave);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (subCtx.open) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}