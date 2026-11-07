import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li><button> </button></li>`);
var root_1 = $.from_html(`<aside class="scrollbar-hidden sticky top-[calc(96px+2rem)] hidden max-h-[calc(100vh-96px-4rem)] w-[220px] shrink-0 overflow-y-auto xl:block"><div class="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">On this page</div> <nav><ul class="m-0 list-none p-0"></ul></nav></aside>`);

export default function DocsTableOfContents($$anchor, $$props) {
	$.push($$props, true);

	let activeId = $.state("");

	$.user_effect(() => {
		// Re-run whenever items changes (e.g. on soft navigation)
		const currentItems = $$props.items;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						$.set(activeId, entry.target.id, true);
					}
				}
			},
			{ rootMargin: "-80px 0px -80% 0px", threshold: 0 }
		);

		// Wait a tick for the DOM to update with new content
		const timeout = setTimeout(
			() => {
				for (const item of currentItems) {
					const element = document.getElementById(item.id);

					if (element) {
						observer.observe(element);
					}
				}
			},
			50
		);

		return () => {
			clearTimeout(timeout);
			observer.disconnect();
		};
	});

	function scrollToHeading(id) {
		const element = document.getElementById(id);

		if (element) {
			const offset = 120; // Account for navbar height (96px) + some padding
			const elementPosition = element.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.scrollY - offset;

			window.scrollTo({ top: offsetPosition, behavior: "smooth" });
			$.set(activeId, id, true);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var aside = root_1();
			var nav = $.sibling($.child(aside), 2);
			var ul = $.child(nav);

			$.each(ul, 23, () => $$props.items, (item, index) => `${item.id}-${index}`, ($$anchor, item) => {
				var li = root();
				let classes;
				var button = $.child(li);
				let classes_1;
				var text = $.only_child(button, true);

				$.reset(li);

				$.template_effect(() => {
					classes = $.set_class(li, 1, 'mb-0', null, classes, {
						'pl-3': $.get(item).level === 3,
						'pl-6': $.get(item).level === 4
					});

					classes_1 = $.set_class(button, 1, 'text-muted-foreground hover:text-foreground block cursor-pointer border-none bg-transparent py-1 text-left text-[0.8125rem] no-underline transition-colors duration-200 svelte-m0vs27', null, classes_1, { active: $.get(activeId) === $.get(item).id });
					$.set_text(text, $.get(item).text);
				});

				$.delegated('click', button, () => scrollToHeading($.get(item).id));
				$.append($$anchor, li);
			});

			$.reset(ul);
			$.reset(nav);
			$.reset(aside);
			$.append($$anchor, aside);
		};

		$.if(node, ($$render) => {
			if ($$props.items.length > 0) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);