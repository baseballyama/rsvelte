import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { sineIn } from "svelte/easing";
import { prefersReducedMotion } from "svelte/motion";
import { fade, fly, scale, slide } from "svelte/transition";
import { navbarUl } from "./theme";
import { getNavbarStateContext, getNavbarBreakpointContext } from "$lib/context";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'activeUrl',
	'ulClass',
	'slideParams',
	'transition',
	'transitionParams',
	'activeClass',
	'nonActiveClass',
	'respectMotionPreference',
	'class',
	'classes'
]);

var root = $.from_html(`<div><ul><!></ul></div>`);

export default function NavUl($$anchor, $$props) {
	$.push($$props, true);

	let navState = getNavbarStateContext();
	let navBreakpointCtx = getNavbarBreakpointContext();

	let transition = $.prop($$props, 'transition', 3, slide),
		respectMotionPreference = $.prop($$props, 'respectMotionPreference', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"NavUl",
		untrack(() => ({
			ulClass: $$props.ulClass,
			activeClass: $$props.activeClass,
			nonActiveClass: $$props.nonActiveClass
		})),
		{
			ulClass: "ul",
			activeClass: "active",
			nonActiveClass: "nonActive"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		ul: $$props.ulClass,
		active: $$props.activeClass,
		nonActive: $$props.nonActiveClass
	});

	const theme = $.derived(() => getTheme("navbarUl"));

	// Default parameters for different transitions
	const getDefaultParams = (transitionFn) => {
		if (transitionFn === slide) return { delay: 0, duration: 200, easing: sineIn };
		if (transitionFn === fly) return { delay: 0, duration: 200, y: -10, easing: sineIn };
		if (transitionFn === fade) return { delay: 0, duration: 200, easing: sineIn };
		if (transitionFn === scale) return { delay: 0, duration: 200, start: 0.95, easing: sineIn };

		return { delay: 0, duration: 200, easing: sineIn };
	};

	// Support legacy slideParams prop
	const defaultParams = $.derived(() => getDefaultParams(transition()));

	const finalParams = $.derived(() => $$props.transitionParams ?? $$props.slideParams ?? $.get(defaultParams));

	// Create motion-aware parameters
	const transitionOptions = $.derived(() => () => {
		if (respectMotionPreference() && prefersReducedMotion.current) {
			return { ...$.get(finalParams), duration: 0, delay: 0 };
		}

		return $.get(finalParams);
	});

	let hidden = $.derived(() => navState?.hidden ?? true);

	let $$d = $.derived(() => navbarUl({
			hidden: $.get(hidden),
			breakpoint: navBreakpointCtx?.value ?? "md"
		})),
		base = $.derived(() => $.get($$d).base),
		ul = $.derived(() => $.get($$d).ul),
		active = $.derived(() => $.get($$d).active),
		nonActive = $.derived(() => $.get($$d).nonActive);

	$.user_effect(() => {
		if (!navState) return;

		navState.activeClass = $.get(active)({ class: clsx($.get(theme)?.active, $.get(styling).active) });

		navState.nonActiveClass = $.get(nonActive)({
			class: clsx($.get(theme)?.nonActive, $.get(styling).nonActive)
		});

		navState.activeUrl = $$props.activeUrl;
	});

	let divCls = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));
	let ulCls = $.derived(() => $.get(ul)({ class: clsx($.get(theme)?.ul, $.get(styling).ul) }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...restProps, class: $.get(divCls) }));

			var ul_1 = $.child(div);
			var node_1 = $.child(ul_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.reset(ul_1);
			$.reset(div);
			$.template_effect(() => $.set_class(ul_1, 1, $.clsx($.get(ulCls))));
			$.transition(3, div, transition, () => $.get(transitionOptions)());
			$.append($$anchor, div);
		};

		var alternate = ($$anchor) => {
			var div_1 = root();

			$.attribute_effect(div_1, () => ({ ...restProps, class: $.get(divCls) }));

			var ul_2 = $.child(div_1);
			var node_2 = $.child(ul_2);

			$.snippet(node_2, () => $$props.children ?? $.noop);
			$.reset(ul_2);
			$.reset(div_1);
			$.template_effect(() => $.set_class(ul_2, 1, $.clsx($.get(ulCls))));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (!$.get(hidden)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}