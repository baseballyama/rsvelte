import * as $ from 'svelte/internal/server';
import { scrollspy } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";

export default function ScrollSpy($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items,
			position = "top",
			offset = 0,
			sticky = true,
			activeClass = "",
			inactiveClass = "",
			class: className = "",
			smoothScroll = true,
			scrollContainer,
			onActiveChange,
			onNavigate,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const browser = typeof window !== "undefined";
		const styles = $.derived(() => getTheme("scrollspy"));
		const INTERSECTION_RATIO_EPSILON = 0.01;

		// Bottom margin determines how far up the viewport a section must scroll before becoming inactive
		const ROOT_MARGIN_BOTTOM = "-40%";

		let activeId = "";
		let isSticky = false;
		let navElement = null;
		let scrollElement = browser ? window : null;

		// Track intersecting sections and their IntersectionObserverEntries
		let intersectingSections = new Map();

		const theme = $.derived(() => {
			const { base, container, list, li } = scrollspy({ position, sticky, isSticky });
			const { link: activeLink } = scrollspy({ active: true });
			const { link: inactiveLink } = scrollspy({ active: false });

			return {
				base: base({ class: clsx(styles()?.base, className) }),
				container: container({ class: clsx(styles()?.container, classes?.container) }),
				list: list({ class: clsx(styles()?.list, classes?.list) }),
				activeLink: activeLink({ class: clsx(styles()?.link, classes?.link) }),
				inactiveLink: inactiveLink({ class: clsx(styles()?.link, classes?.link) }),
				li: li({ class: clsx(styles()?.li, classes?.li) })
			};
		});

		function getItemClass(itemId) {
			const isActive = activeId === itemId;
			const link = isActive ? theme().activeLink : theme().inactiveLink;
			const customClass = isActive ? activeClass : inactiveClass;

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

			const container = !scrollElement || scrollElement === window ? window : scrollElement;
			const isWindow = container === window;
			const elementRect = element.getBoundingClientRect();
			let targetPosition;

			if (isWindow) {
				const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

				targetPosition = elementRect.top + currentScrollY - offset;
			} else {
				const currentScrollTop = container.scrollTop; // Type assertion
				const containerRect = container.getBoundingClientRect(); // Type assertion

				targetPosition = elementRect.top - containerRect.top + currentScrollTop - offset;
			}

			try {
				if (isWindow) {
					window.scrollTo({
						top: targetPosition,
						behavior: smoothScroll ? "smooth" : "auto"
					});
				} else {
					container.scrollTo({
						// Type assertion
						top: targetPosition,
						behavior: smoothScroll ? "smooth" : "auto"
					});
				}
			} catch(error) {
				console.error("Scroll error:", error);
			}

			activeId = itemId;
			onNavigate?.(itemId);
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
				if (activeId !== items[0]?.id) {
					activeId = items[0]?.id || "";
					onActiveChange?.(activeId);
				}

				return;
			}

			// Sort by intersection ratio descending, then by items order ascending
			const itemIndexMap = new Map(items.map((item, index) => [item.id, index]));

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

			if (activeId !== newActiveId) {
				activeId = newActiveId;
				onActiveChange?.(newActiveId);
			}
		}

		function setupIntersectionObserver() {
			if (!browser) return { disconnect: () => {} };

			const root = scrollContainer ? document.querySelector(scrollContainer) : null;

			if (scrollContainer && !root) {
				console.warn("ScrollSpy: Scroll container not found:", scrollContainer);
			}

			const rootMargin = `-${offset}px 0px ${ROOT_MARGIN_BOTTOM} 0px`;

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

			items.forEach((item) => {
				const element = document.getElementById(item.id);

				if (element) observer.observe(element); else console.warn(`ScrollSpy: Section with id "${item.id}" not found in DOM`);
			});

			return observer;
		}

		function handleScroll() {
			if (!browser || !navElement || !sticky || !scrollElement) return;

			const container = scrollElement instanceof Window ? window : scrollElement;
			const isWindow = container === window;
			const scrollPosition = isWindow ? window.scrollY : container.scrollTop; // Type assertion here

			isSticky = scrollPosition > 0;
			updateActiveSection();
		}

		$$renderer.push(`<nav${$.attributes({
			...restProps,
			class: $.clsx(theme().base),
			'aria-label': 'Scroll spy navigation'
		})}><div${$.attr_class($.clsx(theme().container))}><ul${$.attr_class($.clsx(theme().list))} role="list"><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<li${$.attr_class($.clsx(theme().li))}><a${$.attr('href', item.href || `#${item.id}`)}${$.attr_class($.clsx(getItemClass(item.id)))}${$.attr('aria-current', activeId === item.id ? "location" : undefined)}>${$.escape(item.label)}</a></li>`);
		}

		$$renderer.push(`<!--]--></ul></div></nav>`);
	});
}