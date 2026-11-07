import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div role="presentation"><div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"></div> <!></div>`);

export default function SpotlightCard($$anchor, $$props) {
	let className = $.prop($$props, 'class', 3, ''),
		spotlightColor = $.prop($$props, 'spotlightColor', 3, 'rgba(255, 255, 255, 0.25)');

	let divRef;
	let isFocused = $.state(false);
	let posX = $.state(0);
	let posY = $.state(0);
	let opacity = $.state(0);

	function handleMouseMove(e) {
		if (!divRef || $.get(isFocused)) return;

		const rect = divRef.getBoundingClientRect();

		$.set(posX, e.clientX - rect.left);
		$.set(posY, e.clientY - rect.top);
	}

	function handleFocus() {
		$.set(isFocused, true);
		$.set(opacity, 0.6);
	}

	function handleBlur() {
		$.set(isFocused, false);
		$.set(opacity, 0);
	}

	function handleMouseEnter() {
		$.set(opacity, 0.6);
	}

	function handleMouseLeave() {
		$.set(opacity, 0);
	}

	var div = root();
	var div_1 = $.child(div);
	var node = $.sibling(div_1, 2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => divRef = $$value, () => divRef);

	$.template_effect(() => {
		$.set_class(div, 1, `relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden p-8 ${className()}`);
		$.set_style(div_1, `opacity:${$.get(opacity) ?? ''};background:radial-gradient(circle at ${$.get(posX) ?? ''}px ${$.get(posY) ?? ''}px, ${spotlightColor() ?? ''}, transparent 80%);`);
	});

	$.delegated('mousemove', div, handleMouseMove);
	$.event('focus', div, handleFocus);
	$.event('blur', div, handleBlur);
	$.event('mouseenter', div, handleMouseEnter);
	$.event('mouseleave', div, handleMouseLeave);
	$.append($$anchor, div);
}

$.delegate(['mousemove']);