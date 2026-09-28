import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { parse } from './htmlSubsetParse';
import { resolve } from '$app/paths';

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<del> </del>`);
var root_2 = $.from_html(`<p></p>`);
var root_3 = $.from_html(`<pre><code> </code></pre>`);

export default function SubsetHTML($$anchor, $$props) {
	$.push($$props, true);

	const // for the purposes of typescript control flow,
	// .has() does not impact .get()
	// only support rewriting /item?id= links
	// which actually covers most legitimate uses
	// otherwise spit back original
	inline = ($$anchor, child = $.noop) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var text = $.text();

				$.template_effect(() => $.set_text(text, child().text));
				$.append($$anchor, text);
			};

			var consequent_2 = ($$anchor) => {
				const originalUrl = $.derived(() => new URL(child().href));
				var fragment_2 = $.comment();
				var node_1 = $.first_child(fragment_2);

				{
					var consequent_1 = ($$anchor) => {
						const computed_const = $.derived(() => {
							return tryRewriteLink($.get(originalUrl));
						});

						var a = root();
						var text_1 = $.only_child(a, true);

						$.template_effect(() => {
							$.set_attribute(a, 'href', $.get(computed_const).href);
							$.set_attribute(a, 'rel', $.get(computed_const).rel);
							$.set_text(text_1, child().text);
						});

						$.append($$anchor, a);
					};

					var d = $.derived(() => ['http:', 'https:'].includes($.get(originalUrl).protocol));

					var alternate = ($$anchor) => {
						var del = root_1();
						var text_2 = $.only_child(del, true);

						$.template_effect(() => $.set_text(text_2, child().text));
						$.append($$anchor, del);
					};

					$.if(node_1, ($$render) => {
						if ($.get(d)) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_2);
			};

			var consequent_3 = ($$anchor) => {
				var fragment_3 = $.comment();
				var node_2 = $.first_child(fragment_3);

				$.each(node_2, 17, () => child().children, $.index, ($$anchor, subchild) => {
					inline($$anchor, () => $.get(subchild));
				});

				$.append($$anchor, fragment_3);
			};

			$.if(node, ($$render) => {
				if (child().type === 'text') $$render(consequent); else if (child().type === 'link') $$render(consequent_2, 1); else if (child().type === 'italic') $$render(consequent_3, 2);
			});
		}

		$.append($$anchor, fragment);
	};

	const parsedContent = $.derived(() => parse($$props.content));
	const HN_HOSTNAME = 'news.ycombinator.com';

	function tryRewriteLink(originalUrl) {
		const { hostname, pathname, searchParams, hash, href } = originalUrl;

		if (hostname === HN_HOSTNAME && pathname === '/item') {
			// for the purposes of typescript control flow,
			// .has() does not impact .get()
			const itemId = searchParams.get('id');

			if (itemId) {
				// only support rewriting /item?id= links
				// which actually covers most legitimate uses
				return {
					href: `${resolve('/item/[id=numeric]', { id: itemId })}${hash}`,
					rel: undefined
				};
			}
		}

		// otherwise spit back original
		return { href, rel: 'external' };
	}

	var fragment_5 = $.comment();
	var node_3 = $.first_child(fragment_5);

	$.each(node_3, 17, () => $.get(parsedContent), $.index, ($$anchor, block) => {
		var fragment_6 = $.comment();
		var node_4 = $.first_child(fragment_6);

		{
			var consequent_4 = ($$anchor) => {
				var p = root_2();

				$.each(p, 21, () => $.get(block).children, $.index, ($$anchor, child) => {
					inline($$anchor, () => $.get(child));
				});

				$.reset(p);
				$.append($$anchor, p);
			};

			var alternate_1 = ($$anchor) => {
				var pre = root_3();
				var code = $.child(pre);
				var text_3 = $.only_child(code, true);

				$.reset(pre);
				$.template_effect(() => $.set_text(text_3, $.get(block).text));
				$.append($$anchor, pre);
			};

			$.if(node_4, ($$render) => {
				if ($.get(block).type === 'paragraph') $$render(consequent_4); else $$render(alternate_1, -1);
			});
		}

		$.append($$anchor, fragment_6);
	});

	$.append($$anchor, fragment_5);
	$.pop();
}