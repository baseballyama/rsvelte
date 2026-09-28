import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { trapFocus } from "$lib/utils/actions";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { setSidebarContext, setActiveUrlContext } from "$lib/context";
import { sineIn } from "svelte/easing";
import { writable } from "svelte/store";
import { fly } from "svelte/transition";
import { sidebar } from "./theme";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'isOpen',
	'closeSidebar',
	'isSingle',
	'breakpoint',
	'alwaysOpen',
	'position',
	'activateClickOutside',
	'backdrop',
	'backdropClass',
	'transition',
	'params',
	'divClass',
	'ariaLabel',
	'nonActiveClass',
	'activeClass',
	'activeUrl',
	'class',
	'classes',
	'disableBreakpoints'
]);

var root = $.from_html(`<div role="presentation"></div>`);
var root_1 = $.from_html(`<div role="presentation" class="fixed start-0 top-0 z-50 h-full w-full"></div>`);
var root_2 = $.from_html(`<!> <aside><div><!></div></aside>`, 1);
var root_3 = $.from_html(`<aside><div><!></div></aside>`);

export default function Sidebar($$anchor, $$props) {
	$.push($$props, true);

	let isOpen = $.prop($$props, 'isOpen', 7, false),
		isSingle = $.prop($$props, 'isSingle', 3, true),
		breakpoint = $.prop($$props, 'breakpoint', 3, "md"),
		alwaysOpen = $.prop($$props, 'alwaysOpen', 3, false),
		position = $.prop($$props, 'position', 3, "fixed"),
		activateClickOutside = $.prop($$props, 'activateClickOutside', 3, true),
		backdrop = $.prop($$props, 'backdrop', 3, true),
		transition = $.prop($$props, 'transition', 3, fly),
		activeUrl = $.prop($$props, 'activeUrl', 3, ""),
		disableBreakpoints = $.prop($$props, 'disableBreakpoints', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Sidebar",
		untrack(() => ({
			backdropClass: $$props.backdropClass,
			divClass: $$props.divClass,
			nonActiveClass: $$props.nonActiveClass,
			activeClass: $$props.activeClass
		})),
		{
			backdropClass: "backdrop",
			divClass: "div",
			nonActiveClass: "nonactive",
			activeClass: "active"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		backdrop: $$props.backdropClass,
		div: $$props.divClass,
		nonactive: $$props.nonActiveClass,
		active: $$props.activeClass
	});

	const theme = $.derived(() => getTheme("sidebar"));
	const breakpointValues = { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 };
	let innerWidth = $.state(-1);

	let isLargeScreen = $.derived(() => disableBreakpoints()
		? false
		: alwaysOpen() || $.get(innerWidth) >= breakpointValues[breakpoint()]);

	// Create reactive context for activeUrl using getter
	const activeUrlContext = {
		get value() {
			return activeUrl();
		}
	};

	setActiveUrlContext(activeUrlContext);

	$.user_effect(() => {
		if (disableBreakpoints()) isOpen(true);
	});

	const $$d = $.derived(() => sidebar({
			isOpen: isOpen(),
			breakpoint: breakpoint(),
			position: position(),
			backdrop: backdrop(),
			alwaysOpen: alwaysOpen() && !disableBreakpoints()
		})),
		base = $.derived(() => $.get($$d).base),
		active = $.derived(() => $.get($$d).active),
		nonactive = $.derived(() => $.get($$d).nonactive),
		div = $.derived(() => $.get($$d).div),
		backdropCls = $.derived(() => $.get($$d).backdrop);

	const selectedStore = $.derived(() => isSingle() ? writable(null) : undefined);

	let sidebarCtx = {
		get closeSidebar() {
			return $$props.closeSidebar;
		},

		get activeClass() {
			return $.get(active)({ class: clsx($.get(theme)?.active, $.get(styling).active) });
		},

		get nonActiveClass() {
			return $.get(nonactive)({
				class: clsx($.get(theme)?.nonactive, $.get(styling).nonactive)
			});
		},

		get isSingle() {
			return isSingle();
		},

		get selected() {
			return $.get(selectedStore);
		}
	};

	let transitionParams = $.derived(() => $$props.params
		? $$props.params
		: { x: -320, duration: 200, easing: sineIn });

	setSidebarContext(sidebarCtx);

	// Handler for Escape key
	const handleEscape = () => {
		$$props.closeSidebar?.();
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_2 = root_2();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							{
								var consequent = ($$anchor) => {
									var div_1 = root();

									$.template_effect(($0) => $.set_class(div_1, 1, $0), [
										() => $.clsx($.get(backdropCls)({ class: clsx($.get(theme)?.backdrop, $.get(styling).backdrop) }))
									]);

									$.delegated('click', div_1, function (...$$args) {
										$$props.closeSidebar?.apply(this, $$args);
									});

									$.append($$anchor, div_1);
								};

								var consequent_1 = ($$anchor) => {
									var div_2 = root();

									$.template_effect(($0) => $.set_class(div_2, 1, $0), [
										() => $.clsx($.get(backdropCls)({ class: clsx($.get(theme)?.backdrop, $.get(styling).backdrop) }))
									]);

									$.append($$anchor, div_2);
								};

								var consequent_2 = ($$anchor) => {
									var div_3 = root_1();

									$.delegated('click', div_3, function (...$$args) {
										$$props.closeSidebar?.apply(this, $$args);
									});

									$.append($$anchor, div_3);
								};

								var consequent_3 = ($$anchor) => {
									var div_4 = root_1();

									$.append($$anchor, div_4);
								};

								$.if(node_3, ($$render) => {
									if (backdrop() && activateClickOutside()) $$render(consequent); else if (backdrop() && !activateClickOutside()) $$render(consequent_1, 1); else if (!backdrop() && activateClickOutside()) $$render(consequent_2, 2); else if (!backdrop() && !activateClickOutside()) $$render(consequent_3, 3);
								});
							}

							$.append($$anchor, fragment_3);
						};

						$.if(node_2, ($$render) => {
							if (isOpen() && !alwaysOpen()) $$render(consequent_4);
						});
					}

					var aside = $.sibling(node_2, 2);

					$.attribute_effect(aside, ($0) => ({ ...restProps, class: $0, 'aria-label': $$props.ariaLabel }), [
						() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
					]);

					var div_5 = $.child(aside);
					var node_4 = $.child(div_5);

					$.snippet(node_4, () => $$props.children);
					$.reset(div_5);
					$.reset(aside);

					$.action(aside, ($$node, $$action_arg) => trapFocus?.($$node, $$action_arg), () => !$.get(isLargeScreen) && isOpen() && !alwaysOpen()
						? { onEscape: $$props.closeSidebar ? handleEscape : undefined }
						: null);

					$.template_effect(($0) => $.set_class(div_5, 1, $0), [
						() => $.clsx($.get(div)({ class: clsx($.get(theme)?.base, $.get(styling).div) }))
					]);

					$.transition(3, aside, transition, () => !alwaysOpen() ? $.get(transitionParams) : undefined);
					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if (isOpen() || $.get(isLargeScreen)) $$render(consequent_5);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var aside_1 = root_3();

			$.attribute_effect(aside_1, ($0) => ({ ...restProps, class: $0, 'aria-label': $$props.ariaLabel }), [
				() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
			]);

			var div_6 = $.child(aside_1);
			var node_5 = $.child(div_6);

			$.snippet(node_5, () => $$props.children);
			$.reset(div_6);
			$.reset(aside_1);

			$.action(aside_1, ($$node, $$action_arg) => trapFocus?.($$node, $$action_arg), () => isOpen()
				? { onEscape: $$props.closeSidebar ? handleEscape : undefined }
				: null);

			$.template_effect(($0) => $.set_class(div_6, 1, $0), [
				() => $.clsx($.get(div)({ class: clsx($.get(theme)?.base, $.get(styling).div) }))
			]);

			$.append($$anchor, aside_1);
		};

		$.if(node, ($$render) => {
			if (!disableBreakpoints()) $$render(consequent_6); else $$render(alternate, -1);
		});
	}

	$.bind_window_size('innerWidth', ($$value) => $.set(innerWidth, $$value, true));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);