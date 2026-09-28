import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { format } from '@layerstack/utils';
import { Button, H1 } from '@layerstack/docs/markdown/components';
import LucideChevronLeft from '~icons/lucide/chevron-left';
import ReleaseContent from '../ReleaseContent.svelte';

var root = $.from_html(`<span class="text-xs bg-warning/10 px-2 py-0.5 rounded border border-warning text-warning">pre-release</span>`);
var root_1 = $.from_html(`<div><!> <div class="mb-8"><!> <div class="flex items-center gap-3 text-sm text-surface-content/70 mb-4"><time> </time> <span class="text-xs bg-surface-content/10 px-2 py-0.5 rounded border"> </span> <!></div> <div class="flex gap-3"><a target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline">View on GitHub →</a></div></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const release = $.derived(() => $$props.data.release);
	var div = root_1();
	var node = $.child(div);

	Button(node, {
		size: 'sm',
		get icon() {
			return LucideChevronLeft;
		},
		href: '/docs/releases',
		class: 'mb-2 border',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('All releases');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	H1(node_1, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text();

			$.template_effect(() => $.set_text(text_1, $.get(release).title));
			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node_1, 2);
	var time = $.child(div_2);
	var text_2 = $.only_child(time, true);
	var span = $.sibling(time, 2);
	var text_3 = $.only_child(span, true);
	var node_2 = $.sibling(span, 2);

	{
		var consequent = ($$anchor) => {
			var span_1 = root();

			$.append($$anchor, span_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(release).prerelease) $$render(consequent);
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var a = $.only_child(div_3);

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	ReleaseContent(node_3, {
		get release() {
			return $.get(release);
		}
	});

	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(time, 'datetime', $0);
			$.set_text(text_2, $1);
			$.set_text(text_3, $.get(release).tag);
			$.set_attribute(a, 'href', $.get(release).url);
		},
		[
			() => $.get(release).date.toISOString(),
			() => format($.get(release).date, 'day', { variant: 'long' })
		]
	);

	$.append($$anchor, div);
	$.pop();
}