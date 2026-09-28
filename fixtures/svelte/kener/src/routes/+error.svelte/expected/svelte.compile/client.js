import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";

var root = $.from_html(`<meta http-equiv="refresh" content="30"/>`);
var root_1 = $.from_html(`<h1 class="svelte-1j96wlh">This status page is temporarily unavailable</h1> <p class="svelte-1j96wlh">We are having trouble serving this page right now. It usually resolves on its own.</p> <p class="svelte-1j96wlh">This page will retry automatically in 30 seconds.</p>`, 1);
var root_2 = $.from_html(`<h1 class="svelte-1j96wlh">Something went wrong</h1> <p class="svelte-1j96wlh"> </p>`, 1);
var root_3 = $.from_html(`<div class="error-wrap svelte-1j96wlh"><div class="error-card svelte-1j96wlh"><!> <div class="error-code svelte-1j96wlh"> </div></div></div>`);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	// This boundary renders when a route group's layout load fails (e.g. the
	// database is unreachable), so it must not depend on app CSS or any server
	// data — everything here is self-contained.
	const isServerFailure = $.derived(() => page.status >= 500);

	var div = root_3();

	$.head('1j96wlh', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var meta = root();

				$.append($$anchor, meta);
			};

			$.if(node, ($$render) => {
				if ($.get(isServerFailure)) $$render(consequent);
			});
		}

		$.deferred_template_effect(() => {
			$.document.title = `${page.status ?? ''} — ${$.get(isServerFailure)
				? "Status page temporarily unavailable"
				: "Something went wrong"}`;
		});

		$.append($$anchor, fragment);
	});

	var div_1 = $.child(div);
	var node_1 = $.child(div_1);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = root_1();

			$.next(4);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_2();
			var p = $.sibling($.first_child(fragment_2), 2);
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, page.error?.message || "The page you requested could not be loaded."));
			$.append($$anchor, fragment_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isServerFailure)) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	var div_2 = $.sibling(node_1, 2);
	var text_1 = $.only_child(div_2, true);

	$.reset(div_1);
	$.reset(div);
	$.template_effect(() => $.set_text(text_1, page.status));
	$.append($$anchor, div);
	$.pop();
}