import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CopyIcon from '@lucide/svelte/icons/copy';
import ThumbsUpIcon from '@lucide/svelte/icons/thumbs-up';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'filename',
	'highlights',
	'language'
]);

var root = $.from_html(`<header class="pb-2 flex justify-between items-center"><span class="text-xs opacity-50"> </span> <button class="btn-icon btn-icon-sm preset-outlined-surface-200-800 hover:preset-tonal"><!></button></header>`);
var root_1 = $.from_html(`<div class="prose-pre shadow-lg"><!> <pre><!></pre></div>`);

export default function Pre($$anchor, $$props) {
	$.push($$props, true);

	const rest = $.rest_props($$props, rest_excludes);
	let preRef = $.state(void 0);
	let copied = $.state(false);

	$.user_effect(() => {
		if (!$.get(copied)) return;

		const timeout = setTimeout(() => $.set(copied, false), 2000);

		return () => clearTimeout(timeout);
	});

	async function copyCode() {
		const code = $.get(preRef)?.textContent;

		if (!code) return;

		await navigator.clipboard.writeText(code);
		$.set(copied, true);
	}

	var div = root_1();
	var node = $.child(div);

	{
		var consequent_1 = ($$anchor) => {
			var header = root();
			var span = $.child(header);
			var text = $.only_child(span, true);
			var button = $.sibling(span, 2);
			var node_1 = $.child(button);

			{
				var consequent = ($$anchor) => {
					ThumbsUpIcon($$anchor, {});
				};

				var alternate = ($$anchor) => {
					CopyIcon($$anchor, {});
				};

				$.if(node_1, ($$render) => {
					if ($.get(copied)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(button);
			$.reset(header);
			$.template_effect(() => $.set_text(text, $$props.filename ?? $$props.language));
			$.delegated('click', button, copyCode);
			$.append($$anchor, header);
		};

		$.if(node, ($$render) => {
			if ($$props.filename || $$props.language) $$render(consequent_1);
		});
	}

	var pre = $.sibling(node, 2);

	$.attribute_effect(pre, () => ({ ...rest, style: 'white-space: pre-wrap;' }));

	var node_2 = $.child(pre);

	$.snippet(node_2, () => $$props.children ?? $.noop);
	$.reset(pre);
	$.bind_this(pre, ($$value) => $.set(preRef, $$value), () => $.get(preRef));
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);