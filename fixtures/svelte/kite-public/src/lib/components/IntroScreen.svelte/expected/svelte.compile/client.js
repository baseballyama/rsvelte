import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useOverlayScrollbars } from 'overlayscrollbars-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import 'overlayscrollbars/overlayscrollbars.css';

var root = $.from_html(`<div class="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-dark-bg" data-overlayscrollbars-initialize=""><div class="flex min-h-full items-center justify-center p-4 sm:p-8"><div class="w-full max-w-3xl rounded-lg bg-primary-50 p-8"><div class="mb-8 flex items-start justify-between"><div class="w-full"><h1 class="mb-2 text-3xl font-bold text-primary"> </h1> <p class="text-primary-600"> </p></div></div> <div class="space-y-6 text-primary-700"><section><h2 class="mb-3 text-xl font-semibold text-primary"></h2> <p class="mb-4"></p></section> <section><h2 class="mb-3 text-xl font-semibold text-primary"></h2> <p class="mb-4 text-primary-700"></p> <p class="mb-4 text-primary-700"></p> <p class="mb-4 text-primary-700"></p></section> <section><h2 class="mb-3 text-xl font-semibold text-primary"></h2> <ul class="space-y-2"><li> </li> <li> </li> <li> </li> <li> </li> <li> </li> <li> </li></ul></section> <section><h2 class="mb-3 text-xl font-semibold text-primary"></h2> <p></p></section> <section><h2 class="mb-3 text-xl font-semibold text-primary"></h2> <p></p></section> <section class="mt-6 rounded-lg bg-primary-100 p-4"><p class="text-sm text-primary-600 text-center"> </p></section> <div class="mt-8 flex justify-center"><button class="focus:ring-opacity-75 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-25 transition-colors duration-200 ease-in-out hover:bg-primary-800 focus:ring-2 focus:ring-primary-400 focus:outline-none"></button></div></div></div></div></div>`);

export default function IntroScreen($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let visible = $.prop($$props, 'visible', 3, false);

	// OverlayScrollbars setup
	let scrollableElement = $.state(undefined);

	let [initialize, instance] = useOverlayScrollbars({ defer: true });

	function handleClose() {
		// Scroll to top of the page
		if (browser) {
			window.scrollTo({ top: 0, behavior: 'instant' });
		}

		if ($$props.onClose) $$props.onClose();
	}

	function handleKeydown(e) {
		if (e.key === 'Escape' && visible()) {
			handleClose();
		}
	}

	// Close on escape key
	$.user_effect(() => {
		if (browser) {
			if (visible()) {
				document.addEventListener('keydown', handleKeydown);
			} else {
				document.removeEventListener('keydown', handleKeydown);
			}

			// Cleanup
			return () => {
				document.removeEventListener('keydown', handleKeydown);
			};
		}
	});

	// Initialize OverlayScrollbars
	$.user_effect(() => {
		if ($.get(scrollableElement)) {
			initialize($.get(scrollableElement));
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var div_2 = $.child(div_1);
			var div_3 = $.child(div_2);
			var div_4 = $.child(div_3);
			var h1 = $.child(div_4);
			var text = $.only_child(h1, true);
			var p = $.sibling(h1, 2);
			var text_1 = $.only_child(p, true);

			$.reset(div_4);
			$.reset(div_3);

			var div_5 = $.sibling(div_3, 2);
			var section = $.child(div_5);
			var h2 = $.child(section);

			$.html(h2, () => s("about.why.title") || "Why Kite?", true);
			$.reset(h2);

			var p_1 = $.sibling(h2, 2);

			$.html(p_1, () => s("about.why.description") || "Kite provides a better way to read news.", true);
			$.reset(p_1);
			$.reset(section);

			var section_1 = $.sibling(section, 2);
			var h2_1 = $.child(section_1);

			$.html(h2_1, () => s("about.approach.title") || "Our Approach", true);
			$.reset(h2_1);

			var p_2 = $.sibling(h2_1, 2);

			$.html(p_2, () => s("about.approach.description1") || "We aggregate news from multiple sources.", true);
			$.reset(p_2);

			var p_3 = $.sibling(p_2, 2);

			$.html(p_3, () => s("about.approach.description2") || "We provide summaries and context.", true);
			$.reset(p_3);

			var p_4 = $.sibling(p_3, 2);

			$.html(p_4, () => s("about.approach.description3") || "We respect your privacy.", true);
			$.reset(p_4);
			$.reset(section_1);

			var section_2 = $.sibling(section_1, 2);
			var h2_2 = $.child(section_2);

			$.html(h2_2, () => s("about.principles.title") || "Our Principles", true);
			$.reset(h2_2);

			var ul = $.sibling(h2_2, 2);
			var li = $.child(ul);
			var text_2 = $.only_child(li);
			var li_1 = $.sibling(li, 2);
			var text_3 = $.only_child(li_1);
			var li_2 = $.sibling(li_1, 2);
			var text_4 = $.only_child(li_2);
			var li_3 = $.sibling(li_2, 2);
			var text_5 = $.only_child(li_3);
			var li_4 = $.sibling(li_3, 2);
			var text_6 = $.only_child(li_4);
			var li_5 = $.sibling(li_4, 2);
			var text_7 = $.only_child(li_5);

			$.reset(ul);
			$.reset(section_2);

			var section_3 = $.sibling(section_2, 2);
			var h2_3 = $.child(section_3);

			$.html(h2_3, () => s("about.customization.title") || "Customization", true);
			$.reset(h2_3);

			var p_5 = $.sibling(h2_3, 2);

			$.html(p_5, () => s("about.customization.description") || "Customize Kite to fit your reading preferences.", true);
			$.reset(p_5);
			$.reset(section_3);

			var section_4 = $.sibling(section_3, 2);
			var h2_4 = $.child(section_4);

			$.html(h2_4, () => s("about.contact.title") || "Contact", true);
			$.reset(h2_4);

			var p_6 = $.sibling(h2_4, 2);

			$.html(p_6, () => s("about.contact.description") || "Questions or feedback? Contact us at news@kagi.com", true);
			$.reset(p_6);
			$.reset(section_4);

			var section_5 = $.sibling(section_4, 2);
			var p_7 = $.child(section_5);
			var text_8 = $.only_child(p_7);

			$.reset(section_5);

			var div_6 = $.sibling(section_5, 2);
			var button = $.child(div_6);

			$.html(button, () => s("about.understand.button") || "Got it!", true);
			$.reset(button);
			$.reset(div_6);
			$.reset(div_5);
			$.reset(div_2);
			$.reset(div_1);
			$.reset(div);
			$.bind_this(div, ($$value) => $.set(scrollableElement, $$value), () => $.get(scrollableElement));

			$.template_effect(
				($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) => {
					$.set_text(text, $0);
					$.set_text(text_1, $1);
					$.set_text(text_2, `• ${$2 ?? ''}`);
					$.set_text(text_3, `• ${$3 ?? ''}`);
					$.set_text(text_4, `• ${$4 ?? ''}`);
					$.set_text(text_5, `• ${$5 ?? ''}`);
					$.set_text(text_6, `• ${$6 ?? ''}`);
					$.set_text(text_7, `• ${$7 ?? ''}`);

					$.set_text(text_8, `${$8 ?? ''}
               
              ${$9 ?? ''}`);
				},
				[
					() => s("app.title") || "Kite",
					() => s("about.subtitle") || "News app by Kagi",
					() => s("about.principles.item1") || "No tracking or cookies",
					() => s("about.principles.item2") || "No ads or sponsored content",
					() => s("about.principles.item3") || "Multiple perspectives",
					() => s("about.principles.item4") || "Source transparency",
					() => s("about.principles.item5") || "Fast and lightweight",
					() => s("about.principles.item6") || "Open source",
					() => s("app.disclaimerAutoGenerated") || "Summaries are AI-generated and Kite can make mistakes.",
					() => s("app.disclaimerVerify") || "Please verify important information."
				]
			);

			$.delegated('click', button, handleClose);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (visible()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);