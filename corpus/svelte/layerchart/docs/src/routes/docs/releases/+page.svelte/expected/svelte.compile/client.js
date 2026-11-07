import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { H1 } from '@layerstack/docs/markdown/components';
import { format } from '@layerstack/utils';
import { Button } from 'svelte-ux';
import ReleaseContent from './ReleaseContent.svelte';
import LucideChevronLeft from '~icons/lucide/chevron-left';
import LucideChevronRight from '~icons/lucide/chevron-right';

var root = $.from_html(`Releases <span class="text-xl text-surface-content/70"> </span>`, 1);
var root_1 = $.from_html(`<span class="text-xs bg-warning/10 px-2 py-0.5 rounded border border-warning text-warning">pre-release</span>`);
var root_2 = $.from_html(`<article class="border-b pb-6 last:border-b-0"><div class="flex items-start justify-between gap-4"><div class="flex-1"><h2 class="text-2xl font-semibold mb-2"><a class="hover:text-primary no-underline"> </a></h2> <div class="flex items-center gap-3 text-sm text-surface-content/70 mb-3"><time> </time> <span class="text-xs bg-surface-content/10 px-2 py-0.5 rounded border"> </span> <!></div></div></div> <!></article>`);
var root_3 = $.from_html(`<div class="flex items-center justify-between mt-8 pt-6 border-t"><!> <div class="text-sm text-surface-content/70"> </div> <!></div>`);
var root_4 = $.from_html(`<div class="prose max-w-4xl"><!> <div class="space-y-6 mt-8"></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const pagination = $.derived(() => $$props.data.pagination);
	var div = root_4();
	var node = $.child(div);

	H1(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment = root();
			var span = $.sibling($.first_child(fragment));
			var text = $.only_child(span);

			$.template_effect(() => $.set_text(text, `(${$.get(pagination).totalReleases ?? ''})`));
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 21, () => $$props.data.releases, $.index, ($$anchor, release) => {
		var article = root_2();
		var div_2 = $.child(article);
		var div_3 = $.child(div_2);
		var h2 = $.child(div_3);
		var a = $.child(h2);
		var text_1 = $.only_child(a, true);

		$.reset(h2);

		var div_4 = $.sibling(h2, 2);
		var time = $.child(div_4);
		var text_2 = $.only_child(time, true);
		var span_1 = $.sibling(time, 2);
		var text_3 = $.only_child(span_1, true);
		var node_1 = $.sibling(span_1, 2);

		{
			var consequent = ($$anchor) => {
				var span_2 = root_1();

				$.append($$anchor, span_2);
			};

			$.if(node_1, ($$render) => {
				if ($.get(release).prerelease) $$render(consequent);
			});
		}

		$.reset(div_4);
		$.reset(div_3);
		$.reset(div_2);

		var node_2 = $.sibling(div_2, 2);

		ReleaseContent(node_2, {
			get release() {
				return $.get(release);
			}
		});

		$.reset(article);

		$.template_effect(
			($0, $1) => {
				$.set_attribute(a, 'href', `/docs/releases/${$.get(release).slug ?? ''}`);
				$.set_text(text_1, $.get(release).title);
				$.set_attribute(time, 'datetime', $0);
				$.set_text(text_2, $1);
				$.set_text(text_3, $.get(release).tag);
			},
			[
				() => $.get(release).date.toISOString(),
				() => format($.get(release).date, 'day', { variant: 'long' })
			]
		);

		$.append($$anchor, article);
	});

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_3();
			var node_4 = $.child(div_5);

			{
				let $0 = $.derived(() => $.get(pagination).currentPage - 1);
				let $1 = $.derived(() => !$.get(pagination).hasPrevPage);

				Button(node_4, {
					get href() {
						return `/docs/releases?page=${$.get($0) ?? ''}`;
					},

					get icon() {
						return LucideChevronLeft;
					},

					get disabled() {
						return $.get($1);
					},
					variant: 'outline',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text('Previous');

						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			}

			var div_6 = $.sibling(node_4, 2);
			var text_5 = $.only_child(div_6);
			var node_5 = $.sibling(div_6, 2);

			{
				const append = ($$anchor) => {
					LucideChevronRight($$anchor, {});
				};

				let $0 = $.derived(() => $.get(pagination).currentPage + 1);
				let $1 = $.derived(() => !$.get(pagination).hasNextPage);

				Button(node_5, {
					get href() {
						return `/docs/releases?page=${$.get($0) ?? ''}`;
					},

					get disabled() {
						return $.get($1);
					},
					variant: 'outline',
					size: 'sm',
					append,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_6 = $.text('Next');

						$.append($$anchor, text_6);
					},
					$$slots: { append: true, default: true }
				});
			}

			$.reset(div_5);
			$.template_effect(() => $.set_text(text_5, `Page ${$.get(pagination).currentPage ?? ''} of ${$.get(pagination).totalPages ?? ''}`));
			$.append($$anchor, div_5);
		};

		$.if(node_3, ($$render) => {
			if ($.get(pagination).totalPages > 1) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}