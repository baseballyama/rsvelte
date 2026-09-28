import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { blogConfig } from 'virtual:sveltepress/blog-config';

var root = $.from_html(`<img class="sp-sidebar__avatar svelte-1lk6cpv" alt="" width="80" height="80"/>`);
var root_1 = $.from_html(`<p class="sp-sidebar__bio svelte-1lk6cpv"> </p>`);
var root_2 = $.from_html(`<li><a rel="me" class="svelte-1lk6cpv"> </a></li>`);
var root_3 = $.from_html(`<ul class="sp-sidebar__socials svelte-1lk6cpv"></ul>`);
var root_4 = $.from_html(`<div class="sp-sidebar__about svelte-1lk6cpv"></div>`);
var root_5 = $.from_html(`<section class="sp-sidebar__profile svelte-1lk6cpv"><!> <div class="sp-sidebar__name svelte-1lk6cpv"> </div> <!> <!> <!></section>`);
var root_6 = $.from_html(`<a class="svelte-1lk6cpv"> </a>`);
var root_7 = $.from_html(`<nav class="sp-sidebar__nav svelte-1lk6cpv" aria-label="Primary"></nav>`);
var root_8 = $.from_html(`<button type="button" class="sp-sidebar__search svelte-1lk6cpv" aria-label="Search" title="Search (⌘K / Ctrl+K)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> <span class="sp-sidebar__search-label svelte-1lk6cpv">Search</span> <kbd class="sp-sidebar__search-kbd svelte-1lk6cpv">⌘K</kbd></button>`);
var root_9 = $.from_html(`<aside class="sp-sidebar svelte-1lk6cpv"><a class="sp-sidebar__brand svelte-1lk6cpv"> </a> <!> <!> <div class="sp-sidebar__actions svelte-1lk6cpv"><!> <!></div></aside>`);

export default function Sidebar($$anchor, $$props) {
	$.push($$props, true);

	const links = $.prop($$props, 'links', 19, () => []);
	const author = $.derived(() => blogConfig.author);
	const about = $.derived(() => blogConfig.about);

	// User-configured nav links and asset paths use site-relative paths like
	// "/avatar.png" or "/timeline/"; prepend SvelteKit's `base` so they resolve
	// under a subpath deploy. Leaves protocol-qualified URLs alone.
	function href(to) {
		if ((/^(?:[a-z]+:)?\/\//i).test(to)) return to;

		return to.startsWith('/') ? `${base}${to}` : to;
	}

	const socialDefs = [
		{
			key: 'github',
			label: 'GitHub',
			href: (v) => `https://github.com/${v}`
		},

		{
			key: 'twitter',
			label: 'Twitter/X',
			href: (v) => `https://x.com/${v}`
		},
		{ key: 'mastodon', label: 'Mastodon', href: (v) => v },
		{
			key: 'bluesky',
			label: 'Bluesky',
			href: (v) => `https://bsky.app/profile/${v}`
		},
		{ key: 'email', label: 'Email', href: (v) => `mailto:${v}` },
		{ key: 'website', label: 'Website', href: (v) => v },
		{ key: 'rss', label: 'RSS', href: (v) => v }
	];

	const socials = $.derived(() => {
		const s = $.get(author)?.socials;
		const out = [];

		if (s) {
			for (const d of socialDefs) {
				const v = s[d.key];

				if (v) out.push({ label: d.label, href: href(d.href(v)) });
			}
		}

		return out;
	});

	function openSearch() {
		dispatchEvent(new CustomEvent('sp-search-open'));
	}

	var aside = root_9();
	var a = $.child(aside);
	var text = $.only_child(a, true);
	var node = $.sibling(a, 2);

	{
		var consequent_4 = ($$anchor) => {
			var section = root_5();
			var node_1 = $.child(section);

			{
				var consequent = ($$anchor) => {
					var img = root();

					$.template_effect(($0) => $.set_attribute(img, 'src', $0), [() => href($.get(author).avatar)]);
					$.append($$anchor, img);
				};

				$.if(node_1, ($$render) => {
					if ($.get(author).avatar) $$render(consequent);
				});
			}

			var div = $.sibling(node_1, 2);
			var text_1 = $.only_child(div, true);
			var node_2 = $.sibling(div, 2);

			{
				var consequent_1 = ($$anchor) => {
					var p = root_1();
					var text_2 = $.only_child(p, true);

					$.template_effect(() => $.set_text(text_2, $.get(author).bio));
					$.append($$anchor, p);
				};

				$.if(node_2, ($$render) => {
					if ($.get(author).bio) $$render(consequent_1);
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var ul = root_3();

					$.each(ul, 21, () => $.get(socials), (s) => s.label, ($$anchor, s) => {
						var li = root_2();
						var a_1 = $.child(li);
						var text_3 = $.only_child(a_1, true);

						$.reset(li);

						$.template_effect(() => {
							$.set_attribute(a_1, 'href', $.get(s).href);
							$.set_text(text_3, $.get(s).label);
						});

						$.append($$anchor, li);
					});

					$.reset(ul);
					$.append($$anchor, ul);
				};

				$.if(node_3, ($$render) => {
					if ($.get(socials).length) $$render(consequent_2);
				});
			}

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_1 = root_4();

					$.html(div_1, () => $.get(about).html, true);
					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				$.if(node_4, ($$render) => {
					if ($.get(about)?.html) $$render(consequent_3);
				});
			}

			$.reset(section);
			$.template_effect(() => $.set_text(text_1, $.get(author).name));
			$.append($$anchor, section);
		};

		$.if(node, ($$render) => {
			if ($.get(author)) $$render(consequent_4);
		});
	}

	var node_5 = $.sibling(node, 2);

	{
		var consequent_5 = ($$anchor) => {
			var nav = root_7();

			$.each(nav, 21, links, (link) => link.to, ($$anchor, link) => {
				var a_2 = root_6();
				var text_4 = $.only_child(a_2, true);

				$.template_effect(
					($0) => {
						$.set_attribute(a_2, 'href', $0);
						$.set_text(text_4, $.get(link).title);
					},
					[() => href($.get(link).to)]
				);

				$.append($$anchor, a_2);
			});

			$.reset(nav);
			$.append($$anchor, nav);
		};

		$.if(node_5, ($$render) => {
			if (links().length) $$render(consequent_5);
		});
	}

	var div_2 = $.sibling(node_5, 2);
	var node_6 = $.child(div_2);

	{
		var consequent_6 = ($$anchor) => {
			var fragment = $.comment();
			var node_7 = $.first_child(fragment);

			$.snippet(node_7, () => $$props.search);
			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var button = root_8();

			$.delegated('click', button, openSearch);
			$.append($$anchor, button);
		};

		$.if(node_6, ($$render) => {
			if ($$props.search) $$render(consequent_6); else $$render(alternate, -1);
		});
	}

	var node_8 = $.sibling(node_6, 2);

	$.snippet(node_8, () => $$props.toggle ?? $.noop);
	$.reset(div_2);
	$.reset(aside);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `${base ?? ''}/`);
		$.set_text(text, $$props.title);
	});

	$.append($$anchor, aside);
	$.pop();
}

$.delegate(['click']);