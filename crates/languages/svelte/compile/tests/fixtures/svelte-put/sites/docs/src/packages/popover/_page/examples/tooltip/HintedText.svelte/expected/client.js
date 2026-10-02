import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from '@svelte-put/popover';
import { compute } from './compute';
import './tooltip.css';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'hint',
	'class'
]);

var root = $.from_html(`<button><!></button> <span><span class="arrow"></span> <!></span>`, 1);

export default function HintedText($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	let controlEl;
	let targetEl;
	let arrowEl;
	let cleanup = () => {};

	const tooltipPlugin = () => ({
		name: 'tooltip',
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
	});

	const popover = new Popover({
		triggers: { hover: true, focus: true },
		plugins: tooltipPlugin
	});

	var fragment = root();
	var button = $.first_child(fragment);

	$.attribute_effect(button, () => ({
		class: `inline-block ${$$props.class ?? ''}`,
		...popover.control.attributes,
		...rest
	}));

	var node_1 = $.child(button);

	$.snippet(node_1, () => $$props.children);
	$.reset(button);
	$.bind_this(button, ($$value) => controlEl = $$value, () => controlEl);
	$.action(button, ($$node) => popover.control.actions?.($$node));

	var span = $.sibling(button, 2);

	$.attribute_effect(span, () => ({ class: 'text-hint', ...popover.target.attributes }));

	var span_1 = $.child(span);

	$.bind_this(span_1, ($$value) => arrowEl = $$value, () => arrowEl);

	var node_2 = $.sibling(span_1, 2);

	$.snippet(node_2, () => $$props.hint);
	$.reset(span);
	$.bind_this(span, ($$value) => targetEl = $$value, () => targetEl);
	$.action(span, ($$node) => popover.target.actions?.($$node));
	$.append($$anchor, fragment);
	$.pop();
}