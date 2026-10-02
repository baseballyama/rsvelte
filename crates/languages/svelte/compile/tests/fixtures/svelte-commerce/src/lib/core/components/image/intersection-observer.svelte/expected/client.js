import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var root = $.from_html(`<span><!></span>`);

export default function Intersection_observer($$anchor, $$props) {
	$.push($$props, true);

	let once = $.prop($$props, 'once', 3, false),
		top = $.prop($$props, 'top', 3, 0),
		bottom = $.prop($$props, 'bottom', 3, 0),
		left = $.prop($$props, 'left', 3, 0),
		right = $.prop($$props, 'right', 3, 0);

	let intersecting = $.state(false);
	let container = $.state(void 0);

	onMount(() => {
		if (typeof IntersectionObserver !== 'undefined') {
			const rootMargin = `${bottom()}px ${left()}px ${top()}px ${right()}px`;

			const observer = new IntersectionObserver(
				(entries) => {
					$.set(intersecting, entries[0].isIntersecting, true);

					if ($.get(intersecting) && once()) {
						observer.unobserve($.get(container));
					}
				},
				{ rootMargin }
			);

			observer.observe($.get(container));

			return () => observer.unobserve($.get(container));
		}
	});

	const children_render = $.derived(() => $$props.children);
	var span = root();
	var node = $.child(span);

	$.snippet(node, () => $.get(children_render) ?? $.noop, () => ({ intersecting: $.get(intersecting) }));
	$.reset(span);
	$.bind_this(span, ($$value) => $.set(container, $$value), () => $.get(container));
	$.append($$anchor, span);
	$.pop();
}