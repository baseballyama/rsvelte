import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { date } from '$lib/core/utils';

var root = $.from_html(`<div class="h-full w-full bg-zinc-200"></div>`);
var root_1 = $.from_html(`<p class="first-letter:uppercase"> </p>`);
var root_2 = $.from_html(`<div><div class="mb-2 flex items-start gap-4"><div class="h-5 w-5 shrink-0 overflow-hidden rounded-full"><!></div> <h6 class="flex-1 gap-1 capitalize"> </h6></div> <div class="flex gap-4"><div class="flex w-5 items-center justify-center"><div class="h-full min-h-[24px] w-[2px] bg-zinc-200"></div></div> <div class="flex flex-1 flex-col gap-1"><!> <span class="text-xs text-zinc-500"> </span></div></div></div>`);
var root_3 = $.from_html(`<div><h3 class="mb-4">Timeline</h3> <div class="flex flex-col gap-2"></div></div>`);

export default function _OrderTracking($$anchor, $$props) {
	$.push($$props, true);

	var div = root_3();
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 21, () => $$props.tracks, $.index, ($$anchor, t) => {
		var div_2 = root_2();
		var div_3 = $.child(div_2);
		var div_4 = $.child(div_3);
		var node = $.child(div_4);

		{
			var consequent = ($$anchor) => {
				LazyImg($$anchor, {
					get src() {
						return $.get(t).icon;
					},
					width: '20',
					height: '20',
					get alt() {
						return `${$.get(t).title ?? ''} icon`;
					},
					class: 'h-full w-full bg-zinc-100 object-contain object-center'
				});
			};

			var alternate = ($$anchor) => {
				var div_5 = root();

				$.append($$anchor, div_5);
			};

			$.if(node, ($$render) => {
				if ($.get(t).icon) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.reset(div_4);

		var h6 = $.sibling(div_4, 2);
		var text = $.only_child(h6, true);

		$.reset(div_3);

		var div_6 = $.sibling(div_3, 2);
		var div_7 = $.sibling($.child(div_6), 2);
		var node_1 = $.child(div_7);

		{
			var consequent_1 = ($$anchor) => {
				var p = root_1();
				var text_1 = $.only_child(p, true);

				$.template_effect(() => $.set_text(text_1, $.get(t).comment));
				$.append($$anchor, p);
			};

			$.if(node_1, ($$render) => {
				if ($.get(t).comment) $$render(consequent_1);
			});
		}

		var span = $.sibling(node_1, 2);
		var text_2 = $.only_child(span, true);

		$.reset(div_7);
		$.reset(div_6);
		$.reset(div_2);

		$.template_effect(
			($0) => {
				$.set_text(text, $.get(t).title);
				$.set_text(text_2, $0);
			},
			[() => date($.get(t).time)]
		);

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}