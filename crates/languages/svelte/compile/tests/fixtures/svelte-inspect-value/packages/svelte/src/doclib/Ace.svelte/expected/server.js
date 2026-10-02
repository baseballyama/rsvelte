import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';
import { untrack } from 'svelte';

export default function Ace($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, onchange, valid, message } = $$props;
		let editor = void 0;
		let div = void 0;

		function setValue(value) {
			editor?.setValue(value);
		}

		async function initEditor(ele) {
			const { default: ace } = await import('brace');

			editor = ace.edit(ele);

			if (editor) {
				editor.$blockScrolling = Infinity;
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			window['ace'] = ace;

			//@ts-expect-error nonono
			await import('brace/mode/javascript');

			await import('./brace-theme.js');

			if (editor) {
				editor.$blockScrolling = Infinity;
				editor.setTheme('ace/theme/inspect');
				editor.getSession().setMode('ace/mode/javascript');

				editor.setOptions({
					maxLines: 100,
					minLines: 12,
					showLineNumbers: false,
					showFoldWidgets: false,
					showPrintMargin: false,
					showGutter: false,
					highlightActiveLine: false
				});

				// editor!.setValue('const hello = "hello world!"')
				editor.session.on('change', () => {
					const val = editor?.getValue();

					if (val && onchange) {
						onchange(val);
					}
				});
			}
		}

		$$renderer.push(`<div${$.attr_class('wrapper svelte-12y4zxs', void 0, { 'valid': valid })}><div class="ace svelte-12y4zxs"></div> <span class="svelte-12y4zxs">`);

		if (message) {
			$$renderer.push(`<!--[0-->${$.escape(message)}`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></span></div>`);
		$.bind_props($$props, { setValue });
	});
}