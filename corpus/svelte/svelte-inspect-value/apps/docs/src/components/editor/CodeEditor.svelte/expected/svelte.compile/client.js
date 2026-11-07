import 'svelte/internal/disclose-version';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import { inspectTheme, inspectThemeLight } from './ace-inspect-theme';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { starlightTheme } from '../global-opts/sltheme.svelte.js';

var root = $.from_html(`<link rel="stylesheet" href="/ace.css"/>`);
var root_1 = $.from_html(`<span class="svelte-1r1nfkp"> </span>`);
var root_2 = $.from_html(`<div><div></div> <!></div>`);

export default function CodeEditor($$anchor, $$props) {
	$.push($$props, true);

	let div = $.state(void 0);
	let editor = $.state(void 0);
	let ready = $.state(false);

	function setValue(value) {
		$.get(editor)?.setValue(value, -1);
	}

	onMount(() => {
		ace.config.set('basePath', '../../../node_modules/ace-builds/src-noconflict');

		if ($.get(div)) {
			$.set(editor, ace.edit($.get(div)), true);
			$.get(editor).setTheme(inspectTheme);
			$.get(editor).session.setMode('ace/mode/javascript');
			$.get(editor).setValue($$props.value, -1);

			$.get(editor).setOptions({
				maxLines: 100,
				minLines: 12,
				showLineNumbers: false,
				showFoldWidgets: false,
				showPrintMargin: false,
				showGutter: false,
				highlightActiveLine: false
			});

			$.get(editor).container.style.lineHeight = '1.5';
			$.get(editor).container.style.fontFamily = 'monospace';
			$.get(editor).renderer.updateFull(true);

			$.get(editor).session.on('change', () => {
				const val = $.get(editor)?.getValue();

				if (val && $$props.onchange) {
					$$props.onchange(val);
				}
			});

			$.set(ready, true);
		}

		return () => {
			$.get(editor)?.destroy();
		};
	});

	$.user_effect(() => {
		if ($.get(editor) && starlightTheme.current) {
			if (starlightTheme.current === 'light') {
				$.get(editor).setTheme(inspectThemeLight);
			} else {
				$.get(editor).setTheme(inspectTheme);
			}
		}
	});

	var $$exports = { setValue };
	var div_1 = root_2();

	$.head('1r1nfkp', ($$anchor) => {
		var link = root();

		$.append($$anchor, link);
	});

	let classes;
	var div_2 = $.child(div_1);
	let classes_1;

	$.bind_this(div_2, ($$value) => $.set(div, $$value), () => $.get(div));

	var node = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var span = root_1();
			var text = $.only_child(span, true);

			$.template_effect(() => $.set_text(text, $$props.message));
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($$props.message) $$render(consequent);
		});
	}

	$.reset(div_1);

	$.template_effect(() => {
		classes = $.set_class(div_1, 1, 'wrapper not-content svelte-1r1nfkp', null, classes, { valid: $$props.valid });
		classes_1 = $.set_class(div_2, 1, 'ace svelte-1r1nfkp', null, classes_1, { ready: $.get(ready) });
	});

	$.append($$anchor, div_1);

	return $.pop($$exports);
}