import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from '$app/environment';
import { untrack } from 'svelte';

var root = $.from_html(`<div><div class="ace svelte-12y4zxs"></div> <span class="svelte-12y4zxs"><!></span></div>`);

export default function Ace($$anchor, $$props) {
	$.push($$props, true);

	let editor = $.state(void 0);
	let div = $.state(void 0);

	function setValue(value) {
		$.get(editor)?.setValue(value);
	}

	async function initEditor(ele) {
		const { default: ace } = await import('brace');

		$.set(editor, ace.edit(ele), true);

		if ($.get(editor)) {
			$.get(editor).$blockScrolling = Infinity;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		window['ace'] = ace;

		//@ts-expect-error nonono
		await import('brace/mode/javascript');

		await import('./brace-theme.js');

		if ($.get(editor)) {
			$.get(editor).$blockScrolling = Infinity;
			$.get(editor).setTheme('ace/theme/inspect');
			$.get(editor).getSession().setMode('ace/mode/javascript');

			$.get(editor).setOptions({
				maxLines: 100,
				minLines: 12,
				showLineNumbers: false,
				showFoldWidgets: false,
				showPrintMargin: false,
				showGutter: false,
				highlightActiveLine: false
			});

			// editor!.setValue('const hello = "hello world!"')
			$.get(editor).session.on('change', () => {
				const val = $.get(editor)?.getValue();

				if (val && $$props.onchange) {
					$$props.onchange(val);
				}
			});
		}
	}

	$.user_effect(() => {
		if ($.get(editor) && $$props.value) {
			$.get(editor).setValue($$props.value, -1);
			$.get(editor).resize(true);
		}
	});

	$.user_effect(() => {
		if ($.get(div) && browser) {
			untrack(() => {
				if ($.get(div)) initEditor($.get(div));
			});
		}

		return () => {
			$.get(editor)?.destroy();
		};
	});

	var $$exports = { setValue };
	var div_1 = root();
	let classes;
	var div_2 = $.child(div_1);

	$.bind_this(div_2, ($$value) => $.set(div, $$value), () => $.get(div));

	var span = $.sibling(div_2, 2);
	var node = $.child(span);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.message));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($$props.message) $$render(consequent);
		});
	}

	$.reset(span);
	$.reset(div_1);
	$.template_effect(() => classes = $.set_class(div_1, 1, 'wrapper svelte-12y4zxs', null, classes, { valid: $$props.valid }));
	$.append($$anchor, div_1);

	return $.pop($$exports);
}