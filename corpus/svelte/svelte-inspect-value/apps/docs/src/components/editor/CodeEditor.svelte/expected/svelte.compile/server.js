import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { starlightTheme } from '../global-opts/sltheme.svelte.js';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import { inspectTheme, inspectThemeLight } from './ace-inspect-theme';

export default function CodeEditor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, onchange, valid, message } = $$props;
		let div = void 0;
		let editor = void 0;
		let ready = false;

		function setValue(value) {
			editor?.setValue(value, -1);
		}

		onMount(() => {
			ace.config.set('basePath', '../../../node_modules/ace-builds/src-noconflict');

			if (div) {
				editor = ace.edit(div);
				editor.setTheme(inspectTheme);
				editor.session.setMode('ace/mode/javascript');
				editor.setValue(value, -1);

				editor.setOptions({
					maxLines: 100,
					minLines: 12,
					showLineNumbers: false,
					showFoldWidgets: false,
					showPrintMargin: false,
					showGutter: false,
					highlightActiveLine: false
				});

				editor.container.style.lineHeight = '1.5';
				editor.container.style.fontFamily = 'monospace';
				editor.renderer.updateFull(true);

				editor.session.on('change', () => {
					const val = editor?.getValue();

					if (val && onchange) {
						onchange(val);
					}
				});

				ready = true;
			}

			return () => {
				editor?.destroy();
			};
		});

		$.head('1r1nfkp', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="stylesheet" href="/ace.css"/>`);
		});

		$$renderer.push(`<div${$.attr_class('wrapper not-content svelte-1r1nfkp', void 0, { 'valid': valid })}><div${$.attr_class('ace svelte-1r1nfkp', void 0, { 'ready': ready })}></div> `);

		if (message) {
			$$renderer.push(`<!--[0--><span class="svelte-1r1nfkp">${$.escape(message)}</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { setValue });
	});
}