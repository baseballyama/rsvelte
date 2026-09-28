import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import External from './icons/External.svelte';
import { getPathFromBase } from './utils';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<a><!> <!> <!> <!></a>`);

export default function Link($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * @typedef {object} Props
	 * @property {string} [label] - Link label
	 * @property {string} [to] - Link URL
	 * @property {boolean} [inline] - Whether the link is inline
	 * @property {boolean} [active] - Whether the link is active
	 * @property {boolean} [highlight] - Whether the link should be highlighted
	 * @property {boolean} [withBase] - Whether the link should have the base URL
	 * @property {string} [target] - Link target attribute (e.g., '_blank', '_self')
	 * @property {import('svelte').Snippet} [labelRenderer] - Prepend content
	 * @property {import('svelte').Snippet} [pre] - Prepend content
	 * @property {import('svelte').Snippet} [children] - Children content
	 */
	/** @type {Props} */
	const label = $.prop($$props, 'label', 3, ''),
		to = $.prop($$props, 'to', 3, ''),
		inline = $.prop($$props, 'inline', 3, true),
		active = $.prop($$props, 'active', 3, false),
		highlight = $.prop($$props, 'highlight', 3, true),
		withBase = $.prop($$props, 'withBase', 3, true);

	let isExternal = $.derived(() => (/^https?|mailto:/).test(to()));
	let toWithBase = $.derived(() => $.get(isExternal) ? to() : getPathFromBase(to()));
	var a = root_1();

	$.attribute_effect(
		a,
		() => ({
			href: withBase() ? $.get(toWithBase) : to(),
			class: 'link',
			...$$props.target
				? { target: $$props.target }
				: $.get(isExternal) ? { target: '_blank' } : {},
			'aria-label': label(),
			[$.CLASS]: {
				'no-inline': !inline(),
				active: active(),
				highlight: highlight()
			}
		}),
		void 0,
		void 0,
		void 0,
		'svelte-m704aw'
	);

	var node = $.child(a);

	$.snippet(node, () => $$props.pre ?? $.noop);

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.snippet(node_2, () => $$props.labelRenderer ?? $.noop);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var span = root();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, label()));
			$.append($$anchor, span);
		};

		$.if(node_1, ($$render) => {
			if ($$props.labelRenderer) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			External($$anchor, {});
		};

		$.if(node_3, ($$render) => {
			if ($.get(isExternal)) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	$.snippet(node_4, () => $$props.children ?? $.noop);
	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}