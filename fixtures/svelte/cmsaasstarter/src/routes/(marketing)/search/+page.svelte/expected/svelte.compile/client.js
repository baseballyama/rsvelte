import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/stores";
import { browser } from "$app/environment";
import { onMount } from "svelte";
import Fuse from "fuse.js";
import { goto } from "$app/navigation";
import { dev } from "$app/environment";

var root = $.from_html(`<meta name="description" content="Search our website."/>`);
var root_1 = $.from_html(`<div class="text-center mt-10 text-accent text-xl">Loading...</div>`);
var root_2 = $.from_html(`<div class="text-center mt-10 text-accent text-xl">Error connecting to search. Please try again later.</div>`);

var root_3 = $.from_html(`<div class="text-center mt-4 font-mono">Development mode only message: if you're missing content, rebuild your
        local search index with \`npm run build\`</div>`);

var root_4 = $.from_html(`<div class="text-center mt-10 text-accent text-xl">No results found</div> <!>`, 1);
var root_5 = $.from_html(`<a class="card my-6 bg-white shadow-xl flex-row overflow-hidden focus:mx-[-10px] focus:my-[-5px] focus:border-4 focus:border-secondary"><div class="flex-none w-6 md:w-32 bg-secondary"></div> <div class="py-6 px-6"><div class="text-xl"> </div> <div class="text-sm text-accent"> </div> <div class="text-slate-500"> </div></div></a>`);
var root_6 = $.from_html(`<div class="py-8 lg:py-12 px-6 max-w-lg mx-auto"><div class="text-3xl lg:text-5xl font-medium text-primary flex gap-3 items-baseline text-center place-content-center"><div class="text-center leading-relaxed font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">Search</div></div> <label class="input input-bordered flex items-center gap-2 mt-10 mb-5 w-full"><input id="search-input" type="text" class="grow w-full" placeholder="Search" aria-label="Search input"/></label> <!> <!> <!> <div></div> <div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const fuseOptions = {
		keys: [
			{ name: "title", weight: 3 },
			{ name: "description", weight: 2 },
			{ name: "body", weight: 1 }
		],
		ignoreLocation: true,
		threshold: 0.3
	};

	let fuse = $.state(void 0);
	let loading = $.state(true);
	let error = $.state(false);

	onMount(async () => {
		try {
			const response = await fetch("/search/api.json");

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const searchData = await response.json();

			if (searchData && searchData.index && searchData.indexData) {
				const index = Fuse.parseIndex(searchData.index);

				$.set(fuse, new Fuse(searchData.indexData, fuseOptions, index), true);
			}
		} catch(e) {
			console.error("Failed to load search data", e);
			$.set(error, true);
		} finally {
			$.set(loading, false);
			document.getElementById("search-input")?.focus();
		}
	});

	let results = $.state($.proxy([]));

	// searchQuery is $page.url.hash minus the "#" at the beginning if present
	let searchQuery = $.state($.proxy(decodeURIComponent($page().url.hash.slice(1) ?? "")));

	$.user_effect(() => {
		if ($.get(fuse)) {
			$.set(results, $.get(fuse).search($.get(searchQuery)), true);
		}
	});

	// Update the URL hash when searchQuery changes so the browser can bookmark/share the search results
	$.user_effect(() => {
		if (browser && window.location.hash.slice(1) !== $.get(searchQuery)) {
			goto("#" + $.get(searchQuery), { keepFocus: true });
		}
	});

	let focusItem = $.state(0);

	function onKeyDown(event) {
		if (event.key === "Escape") {
			$.set(searchQuery, "");
		} else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			$.set(focusItem, $.get(focusItem) + (event.key === "ArrowDown" ? 1 : -1));

			if ($.get(focusItem) < 0) {
				$.set(focusItem, 0);
			} else if ($.get(focusItem) > $.get(results).length) {
				$.set(focusItem, $.get(results).length, true);
			}

			if ($.get(focusItem) === 0) {
				document.getElementById("search-input")?.focus();
			} else {
				document.getElementById(`search-result-${$.get(focusItem)}`)?.focus();
			}
		}
	}

	var div = root_6();

	$.event('keydown', $.window, onKeyDown);

	$.head('1ou5319', ($$anchor) => {
		var meta = root();

		$.effect(() => {
			$.document.title = 'Search';
		});

		$.append($$anchor, meta);
	});

	var label = $.sibling($.child(div), 2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.reset(label);

	var node = $.sibling(label, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(loading) && $.get(searchQuery).length > 0) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_2();

			$.append($$anchor, div_2);
		};

		$.if(node_1, ($$render) => {
			if ($.get(error)) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment = root_4();
			var node_3 = $.sibling($.first_child(fragment), 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_3 = root_3();

					$.append($$anchor, div_3);
				};

				$.if(node_3, ($$render) => {
					if (dev) $$render(consequent_2);
				});
			}

			$.append($$anchor, fragment);
		};

		$.if(node_2, ($$render) => {
			if (!$.get(loading) && $.get(searchQuery).length > 0 && $.get(results).length === 0 && !$.get(error)) $$render(consequent_3);
		});
	}

	var div_4 = $.sibling(node_2, 2);

	$.each(div_4, 21, () => $.get(results), $.index, ($$anchor, result, i) => {
		var a = root_5();

		$.set_attribute(a, 'id', `search-result-${i + 1}`);

		var div_5 = $.sibling($.child(a), 2);
		var div_6 = $.child(div_5);
		var text = $.only_child(div_6, true);
		var div_7 = $.sibling(div_6, 2);
		var text_1 = $.only_child(div_7, true);
		var div_8 = $.sibling(div_7, 2);
		var text_2 = $.only_child(div_8, true);

		$.reset(div_5);
		$.reset(a);

		$.template_effect(() => {
			$.set_attribute(a, 'href', $.get(result).item.path || "/");
			$.set_text(text, $.get(result).item.title);
			$.set_text(text_1, $.get(result).item.path);
			$.set_text(text_2, $.get(result).item.description);
		});

		$.append($$anchor, a);
	});

	$.reset(div_4);
	$.next(2);
	$.reset(div);
	$.event('focus', input, () => $.set(focusItem, 0));
	$.bind_value(input, () => $.get(searchQuery), ($$value) => $.set(searchQuery, $$value));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}