import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from '@svelte-put/popover';
import { compute } from '$lib/popover/compute';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<div><button><svg inline-src="runes" width="80" height="80"></svg> <span class="sr-only">Run support</span></button> <div><div class="arrow"></div> <p>Compatible with or powered directly by <a href="https://svelte.dev/blog/runes" class="c-link">Svelte runes</a>.</p></div></div>`);

export default function Runes($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let controlEl;
	let targetEl;
	let arrowEl;
	let cleanup = () => {};

	const popover = new Popover({
		triggers: { hover: true, focus: true },
		plugins: () => ({
			target: {
				attributes: {
					role: 'tooltip',
					onbeforetoggle: (e) => {
						if (e.newState !== 'open') return cleanup();

						cleanup = compute(controlEl, targetEl, arrowEl);
					}
				},
				actions: [
					(node) => {
						node.classList.toggle('enhanced', true);
					}
				]
			}
		})
	});

	var div = root();

	$.attribute_effect(div, () => ({ class: `not-prose ${$$props.class ?? ''}`, ...rest }));

	var button = $.child(div);

	$.attribute_effect(button, () => ({
		type: 'button',
		class: 'c-btn c-btn--icon',
		...popover.control.attributes
	}));

	$.bind_this(button, ($$value) => controlEl = $$value, () => controlEl);
	$.action(button, ($$node) => popover.control.actions?.($$node));

	var div_1 = $.sibling(button, 2);

	$.attribute_effect(div_1, () => ({ ...popover.target.attributes, class: 'c-tooltip' }));

	var div_2 = $.child(div_1);

	$.bind_this(div_2, ($$value) => arrowEl = $$value, () => arrowEl);
	$.next(2);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => targetEl = $$value, () => targetEl);
	$.action(div_1, ($$node) => popover.target.actions?.($$node));
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}