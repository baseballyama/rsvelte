import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from 'svelte-ux';
import { LoadingPlaceholder } from '@layerstack/docs/components';
import OpenWithButton from '$lib/components/OpenWithButton.svelte';
import { examples } from '@layerstack/docs/context';
import { page } from '$app/state';
import LucideChevronLeft from '~icons/lucide/chevron-left';
import LucideChevronRight from '~icons/lucide/chevron-right';

var root = $.from_html(`<!> <a class="text-primary"> </a>`, 1);
var root_1 = $.from_html(`<div class="text-sm text-surface-content/70"> </div> <div class="flex gap-2 mt-3"><!></div>`, 1);
var root_2 = $.from_html(`<div class="mb-4"><!> <div class="flex items-center gap-2 text-xs font-bold"><div class="text-surface-content/50 capitalize"> </div> <!></div> <div class="flex items-center gap-4"><h1 class="text-3xl font-bold"> </h1></div> <!></div> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const metadata = $.derived(() => $$props.data.metadata);

	// Add examples to context for Example component to use
	const examplesContext = {
		get current() {
			return $$props.data.examples;
		}
	};

	examples.set(examplesContext);

	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, {
				size: 'sm',
				get icon() {
					return LucideChevronLeft;
				},

				get href() {
					return `/docs/utils/${page.params.name ?? ''}`;
				},
				class: 'mb-4 border',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, `Back to ${page.params.name ?? ''}`));
					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (page.params.example) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var text_1 = $.only_child(div_2, true);
	var node_1 = $.sibling(div_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_3 = root();
			var node_2 = $.first_child(fragment_3);

			LucideChevronRight(node_2, { class: 'text-sm opacity-25' });

			var a = $.sibling(node_2, 2);
			var text_2 = $.only_child(a, true);

			$.template_effect(() => {
				$.set_attribute(a, 'href', `/docs/utils/${page.params.name ?? ''}`);
				$.set_text(text_2, $.get(metadata).name);
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_1, ($$render) => {
			if (page.params.example) $$render(consequent_1);
		});
	}

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var h1 = $.child(div_3);
	var text_3 = $.only_child(h1, true);

	$.reset(div_3);

	var node_3 = $.sibling(div_3, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_4 = root_1();
			var div_4 = $.first_child(fragment_4);
			var text_4 = $.only_child(div_4, true);
			var div_5 = $.sibling(div_4, 2);
			var node_4 = $.child(div_5);

			OpenWithButton(node_4, {
				get metadata() {
					return $.get(metadata);
				}
			});

			$.reset(div_5);
			$.template_effect(() => $.set_text(text_4, $.get(metadata).description));
			$.append($$anchor, fragment_4);
		};

		$.if(node_3, ($$render) => {
			if (page.params.example == null) $$render(consequent_2);
		});
	}

	$.reset(div);

	var node_5 = $.sibling(div, 2);

	{
		const pending = ($$anchor) => {
			LoadingPlaceholder($$anchor, {});
		};

		$.boundary(node_5, { pending }, ($$anchor) => {
			var fragment_6 = $.comment();
			var node_6 = $.first_child(fragment_6);

			$.snippet(node_6, () => $$props.children);
			$.append($$anchor, fragment_6);
		});
	}

	$.template_effect(
		($0) => {
			$.set_text(text_1, $.get(metadata).category);
			$.set_text(text_3, $0);
		},
		[
			() => page.params.example?.replaceAll('-', ' ') ?? $.get(metadata).name
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}