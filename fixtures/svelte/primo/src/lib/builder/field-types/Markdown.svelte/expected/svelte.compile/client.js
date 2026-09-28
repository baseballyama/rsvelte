import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MarkdownCodeMirror from '$lib/builder/components/CodeEditor/MarkdownCodeMirror.svelte';

var root = $.from_html(`<label class="svelte-1ntnb93"><span class="primo--field-label svelte-1ntnb93"> </span> <!></label>`);

export default function Markdown($$anchor, $$props) {
	$.push($$props, true);

	function handle_change(value) {
		$$props.onchange({ [$$props.field.key]: { 0: { value } } });
	}

	var label = root();
	var span = $.child(label);
	var text = $.only_child(span, true);
	var node = $.sibling(span, 2);

	{
		let $0 = $.derived(() => $$props.entry?.value);

		MarkdownCodeMirror(node, {
			get id() {
				return $$props.field.id;
			},

			get value() {
				return $.get($0);
			},
			$$events: { change: ({ detail }) => handle_change(detail.value) }
		});
	}

	$.reset(label);

	$.template_effect(() => {
		$.set_attribute(label, 'for', $$props.field.id);
		$.set_text(text, $$props.field.label);
	});

	$.append($$anchor, label);
	$.pop();
}