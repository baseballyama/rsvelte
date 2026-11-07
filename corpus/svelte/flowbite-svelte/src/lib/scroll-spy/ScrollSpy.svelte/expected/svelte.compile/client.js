import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scrollspy } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'items',
	'position',
	'offset',
	'sticky',
	'activeClass',
	'inactiveClass',
	'class',
	'smoothScroll',
	'scrollContainer',
	'onActiveChange',
	'onNavigate',
	'classes'
]);

var root_1 = $.from_html(`<li><a> </a></li>`);
var root_2 = $.from_html(`<nav><div><ul role="list"></ul></div></nav>`);

export default function ScrollSpy($$anchor, $$props) {
	$.push($$props, true);

	let position = $.prop($$props, 'position', 3, "top"),
		offset = $.prop($$props, 'offset', 3, 0),
		sticky = $.prop($$props, 'sticky', 3, true),
		activeClass = $.prop($$props, 'activeClass', 3, ""),
		inactiveClass = $.prop($$props, 'inactiveClass', 3, ""),
		className = $.prop($$props, 'class', 3, ""),
		smoothScroll = $.prop($$props, 'smoothScroll', 3, true),
		restProps = $.rest_props($$props, rest_excludes);

	const browser = typeof window !== "undefined";
	const styles = $.derived(() => getTheme("scrollspy"));
	const INTERSECTION_RATIO_EPSILON = 0.01;

	// Bottom margin determines how far up the viewport a section must scroll before becoming inactive
	const ROOT_MARGIN_BOTTOM = "-40%";

	let activeId = $.state("");

	$.user_effect(() => {
		$.set(activeId, $$props.items.length > 0 ? $$props.items[0].id : "", true);
	});

	let isSticky = $.state(false);
	let navElement = $.state(null);
	let scrollElement = $.state($.proxy(browser ? window : null));

	// Track intersecting sections and their IntersectionObserverEntries
	let intersectingSections = $.proxy(new Map());

	const theme = $.derived(() => {
		const { base, container, list, li } = scrollspy({
			position: position(),
			sticky: sticky(),
			isSticky: $.get(isSticky)
		});

		const { link: activeLink } = scrollspy({ active: true });
		const { link: inactiveLink } = scrollspy({ active: false });

		return {
			base: base({ class: clsx($.get(styles)?.base, className()) }),
			container: container({
				class: clsx($.get(styles)?.container, $$props.classes?.container)
			}),
			list: list({ class: clsx($.get(styles)?.list, $$props.classes?.list) }),
			activeLink: activeLink({ class: clsx($.get(styles)?.link, $$props.classes?.link) }),
			inactiveLink: inactiveLink({ class: clsx($.get(styles)?.link, $$props.classes?.link) }),
			li: li({ class: clsx($.get(styles)?.li, $$props.classes?.li) })
		};
	});

	function getItemClass(itemId) {
		const isActive = $.get(activeId) === itemId;
		const link = isActive ? $.get(theme).activeLink : $.get(theme).inactiveLink;
		const customClass = isActive ? activeClass() : inactiveClass();

		return clsx(link, customClass);
	}

	function scrollToSection(itemId, event) {
		if (!browser) return;
		if (event) event.preventDefault();

		const element = document.getElementById(itemId);

		if (!element) {
			console.warn(`ScrollSpy: Element with id "${itemId}" not found`);

			return;
		}

		const container = !$.get(scrollElement) || $.get(scrollElement) === window ? window : $.get(scrollElement);
		const isWindow = container === window;
		const elementRect = element.getBoundingClientRect();
		let targetPosition;

		if (isWindow) {
			const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

			targetPosition = elementRect.top + currentScrollY - offset();
		} else {
			const currentScrollTop = container.scrollTop; // Type assertion
			const containerRect = container.getBoundingClientRect(); // Type assertion

			targetPosition = elementRect.top - containerRect.top + currentScrollTop - offset();
		}

		try {
			if (isWindow) {
				window.scrollTo({
					top: targetPosition,
					behavior: smoothScroll() ? "smooth" : "auto"
				});
			} else {
				container.scrollTo({
					// Type assertion
					top: targetPosition,
					behavior: smoothScroll() ? "smooth" : "auto"
				});
			}
		} catch(error) {
			console.error("Scroll error:", error);
		}

		$.set(activeId, itemId, true);
		$$props.onNavigate?.(itemId);
	}

	function handleKeydown(event, itemId) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			scrollToSection(itemId);
		}
	}

	function updateActiveSection() {
		if (intersectingSections.size === 0) {
			// No sections visible — highlight first item
			if ($.get(activeId) !== $$props.items[0]?.id) {
				$.set(activeId, $$props.items[0]?.id || "", true);
				$$props.onActiveChange?.($.get(activeId));
			}

			return;
		}

		// Sort by intersection ratio descending, then by items order ascending
		const itemIndexMap = new Map($$props.items.map((item, index) => [item.id, index]));

		const sorted = Array.from(intersectingSections.entries()).sort((a, b) => {
			const ratioA = a[1].intersectionRatio;
			const ratioB = b[1].intersectionRatio;

			if (Math.abs(ratioA - ratioB) > INTERSECTION_RATIO_EPSILON) {
				return ratioB - ratioA;
			}

			const indexA = itemIndexMap.get(a[0]) ?? -1;
			const indexB = itemIndexMap.get(b[0]) ?? -1;

			return indexA - indexB;
		});

		const [newActiveId] = sorted[0];

		if ($.get(activeId) !== newActiveId) {
			$.set(activeId, newActiveId, true);
			$$props.onActiveChange?.(newActiveId);
		}
	}

	function setupIntersectionObserver() {
		if (!browser) return { disconnect: () => {} };

		const root = $$props.scrollContainer
			? document.querySelector($$props.scrollContainer)
			: null;

		if ($$props.scrollContainer && !root) {
			console.warn("ScrollSpy: Scroll container not found:", $$props.scrollContainer);
		}

		const rootMargin = `-${offset()}px 0px ${ROOT_MARGIN_BOTTOM} 0px`;

		// Use threshold range 0.0 → 1.0 in 0.1 steps for smooth updates with better performance
		const thresholds = Array.from({ length: 11 }, (_, i) => i / 10);

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const id = entry.target.id;

					if (entry.isIntersecting) {
						intersectingSections.set(id, entry);
					} else {
						intersectingSections.delete(id);
					}
				});

				updateActiveSection();
			},
			{ root, rootMargin, threshold: thresholds }
		);

		$$props.items.forEach((item) => {
			const element = document.getElementById(item.id);

			if (element) observer.observe(element); else console.warn(`ScrollSpy: Section with id "${item.id}" not found in DOM`);
		});

		return observer;
	}

	function handleScroll() {
		if (!browser || !$.get(navElement) || !sticky() || !$.get(scrollElement)) return;

		const container = $.get(scrollElement) instanceof Window ? window : $.get(scrollElement);
		const isWindow = container === window;
		const scrollPosition = isWindow ? window.scrollY : container.scrollTop; // Type assertion here

		$.set(isSticky, scrollPosition > 0);
		updateActiveSection();
	}

	$.user_effect(() => {
		if (!browser) return;

		if ($$props.scrollContainer) {
			const container = document.querySelector($$props.scrollContainer);

			if (container instanceof HTMLElement) $.set(scrollElement, container, true); else {
				console.warn("ScrollSpy: Scroll container not found:", $$props.scrollContainer);
				$.set(scrollElement, window, true);
			}
		} else {
			$.set(scrollElement, window, true);
		}

		const observer = setupIntersectionObserver();
		const container = $.get(scrollElement) instanceof Window ? window : $.get(scrollElement);

		container.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			observer.disconnect();
			container.removeEventListener("scroll", handleScroll);
		};
	});

	var nav = root_2();

	$.attribute_effect(nav, () => ({
		...restProps,
		class: $.get(theme).base,
		'aria-label': 'Scroll spy navigation'
	}));

	var div = $.child(nav);
	var ul = $.child(div);

	$.each(ul, 21, () => $$props.items, (item) => item.id, ($$anchor, item) => {
		var li_1 = root_1();
		var a_1 = $.child(li_1);
		var text = $.only_child(a_1, true);

		$.reset(li_1);

		$.template_effect(
			($0) => {
				$.set_class(li_1, 1, $.clsx($.get(theme).li));
				$.set_attribute(a_1, 'href', $.get(item).href || `#${$.get(item).id}`);
				$.set_class(a_1, 1, $0);
				$.set_attribute(a_1, 'aria-current', $.get(activeId) === $.get(item).id ? "location" : undefined);
				$.set_text(text, $.get(item).label);
			},
			[() => $.clsx(getItemClass($.get(item).id))]
		);

		$.delegated('click', a_1, (e) => {
			scrollToSection($.get(item).id, e);
		});

		$.delegated('keydown', a_1, (e) => handleKeydown(e, $.get(item).id));
		$.append($$anchor, li_1);
	});

	$.reset(ul);
	$.reset(div);
	$.reset(nav);
	$.bind_this(nav, ($$value) => $.set(navElement, $$value), () => $.get(navElement));

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx($.get(theme).container));
		$.set_class(ul, 1, $.clsx($.get(theme).list));
	});

	$.append($$anchor, nav);
	$.pop();
}

$.delegate(['click', 'keydown']);