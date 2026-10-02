import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { clickOutside, calculatePosition, getAbsParent } from "@svar-ui/lib-dom";
import { onMount } from "svelte";

var root = $.from_html(`<div><!></div>`);

export default function Popup($$anchor, $$props) {
	$.push($$props, true);

	let left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		at = $.prop($$props, 'at', 3, "bottom"),
		parent = $.prop($$props, 'parent', 3, null),
		width = $.prop($$props, 'width', 3, "auto"),
		css = $.prop($$props, 'css', 3, ""),
		trackScroll = $.prop($$props, 'trackScroll', 3, false);

	let self = $.state(null);
	let x = $.state(0);
	let y = $.state(0);
	let w = $.state("auto");
	let portal;

	function getWidth(calcWidth) {
		if (parent() && (width() + "").indexOf("%") > -1) {
			return width().replace(/(\d+)%/, (match, value) => {
				value = value * parent().offsetWidth / 100 + "px";

				return width().replace(match, value);
			});
		}

		return width() && width() !== "auto" ? width() : calcWidth;
	}

	function updatePosition() {
		if (!$.get(self)) return;

		const result = calculatePosition($.get(self), parent(), at(), left(), top());

		if (result) {
			$.set(x, result.x, true);
			$.set(y, result.y, true);
			$.set(w, getWidth(result.width), true);
		}
	}

	function onScroll(e) {
		if ($$props.oncancel && e.target !== portal && $.get(self) && !$.get(self).contains(e.target)) $$props.oncancel(e);
	}

	onMount(() => {
		let resizeObserver;

		requestAnimationFrame(() => {
			updatePosition();

			if (trackScroll()) {
				portal = getAbsParent($.get(self));

				if (portal) portal.addEventListener("scroll", onScroll, true);
			}

			if (parent()) {
				resizeObserver = new ResizeObserver(updatePosition);
				resizeObserver.observe(parent());
			}
		});

		return () => {
			if (trackScroll() && portal) portal.removeEventListener("scroll", onScroll, true);
			if (resizeObserver) resizeObserver.disconnect();
		};
	});

	$.user_effect(() => {
		updatePosition();
	});

	function down(e) {
		$$props.oncancel && $$props.oncancel(e);
	}

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.action(div, ($$node, $$action_arg) => clickOutside?.($$node, $$action_arg), () => ({ callback: down, parent: () => parent() }));
	$.bind_this(div, ($$value) => $.set(self, $$value), () => $.get(self));

	$.template_effect(() => {
		$.set_class(div, 1, `wx-popup ${css() ?? ''}`, 'svelte-18sx8fa');
		$.set_style(div, `position:absolute;top:${$.get(y) ?? ''}px;left:${$.get(x) ?? ''}px;width:${$.get(w) ?? ''};`);
	});

	$.append($$anchor, div);
	$.pop();
}