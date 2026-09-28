import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import ChevronRight from '@lucide/svelte/icons/chevron-right';

var root = $.from_html(`<div role="menuitem" tabindex="0"><!> <!></div>`);

export default function DropdownSubTrigger($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		openDelay = $.prop($$props, 'openDelay', 3, 300);

	const subCtx = getContext('edra-dropdown-sub');
	let element = $.state(null);

	$.user_effect(() => {
		subCtx.triggerEl = $.get(element);
	});

	let timeout;

	function handleMouseEnter() {
		clearTimeout(timeout);

		timeout = setTimeout(
			() => {
				subCtx.open = true;
			},
			openDelay()
		);
	}

	function handleMouseLeave() {
		clearTimeout(timeout);

		timeout = setTimeout(
			() => {
				if (subCtx.contentEl && !subCtx.contentEl.matches(':hover')) {
					subCtx.open = false;
				}
			},
			100
		);
	}

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);

	var node_1 = $.sibling(node, 2);

	ChevronRight(node_1, { class: 'arrow-icon' });
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));
	$.template_effect(() => $.set_class(div, 1, `dropdown-subtrigger ${className() ?? ''}`, 'svelte-vxnylo'));
	$.event('mouseenter', div, handleMouseEnter);
	$.event('mouseleave', div, handleMouseLeave);

	$.delegated('click', div, (e) => {
		e.stopPropagation();
		subCtx.open = !subCtx.open;
	});

	$.delegated('keydown', div, (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			subCtx.open = !subCtx.open;
		}
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'keydown']);