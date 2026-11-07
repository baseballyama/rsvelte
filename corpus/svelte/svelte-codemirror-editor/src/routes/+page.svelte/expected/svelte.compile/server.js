import * as $ from 'svelte/internal/server';
import CodeMirror from "$lib";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { cssValue, htmlValue, javascriptValue, typescriptValue } from "./_util/code";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "";

		let props = {
			allowMultiSelect: true,
			useTab: true,
			editable: true,
			lineWrapping: false,
			lineNumbers: true,
			highlight: {
				activeLine: true,
				activeLineGutter: true,
				specialChars: true,
				selectionMatches: true
			},
			history: true,
			foldGutter: true,
			drawSelection: true,
			dropCursor: true,
			indentOnInput: true,
			syntaxHighlighting: true,
			bracketMatching: true,
			closeBrackets: true,
			autocompletion: true,
			rectangularSelection: true,
			crosshairCursor: true,
			readonly: false,
			tabSize: 2,
			placeholder: null,
			lang: null,
			theme: null,
			nodebounce: false
		};

		const languages = ["custom", "javascript", "typescript", "css", "html"];
		let language = "custom";
		const themes = ["default", "onedark"];
		let theme = "default";

		function on_language_change() {
			switch (language) {
				case "custom":
					props.lang = null;
					break;

				case "javascript":
					props.lang = javascript();
					value = javascriptValue();
					break;

				case "typescript":
					props.lang = javascript({ typescript: true });
					value = typescriptValue();
					break;

				case "html":
					props.lang = html({ matchClosingTags: true });
					value = htmlValue();
					break;

				case "css":
					props.lang = css();
					value = cssValue();
					break;
			}
		}

		function on_theme_change() {
			switch (theme) {
				case "default":
					props.theme = null;
					break;

				case "onedark":
					props.theme = oneDark;
					break;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="demo svelte-1uha8ag">`);

			CodeMirror($$renderer, $.spread_props([
				{ class: 'editor' },
				props,
				{
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				}
			]));

			$$renderer.push(`<!----> <div class="props svelte-1uha8ag"><h5 class="svelte-1uha8ag">Basic setup</h5> <div class="props-section svelte-1uha8ag"><div class="toggle svelte-1uha8ag"><input id="basic" type="checkbox"${$.attr('checked', props.allowMultiSelect, true)}/> <label for="basic" class="svelte-1uha8ag">Allow multi-select</label></div> <div class="toggle svelte-1uha8ag"><input id="editable" type="checkbox"${$.attr('checked', props.editable, true)}/> <label for="editable" class="svelte-1uha8ag">Editable</label></div> <div class="toggle svelte-1uha8ag"><input id="readonly" type="checkbox"${$.attr('checked', props.readonly, true)}/> <label for="readonly" class="svelte-1uha8ag">Read-only</label></div> <div class="toggle svelte-1uha8ag"><input id="lineWrapping" type="checkbox"${$.attr('checked', props.lineWrapping, true)}/> <label for="lineWrapping" class="svelte-1uha8ag">Line Wrapping</label></div> <div class="toggle svelte-1uha8ag"><input id="nodebounce" type="checkbox"${$.attr('checked', props.nodebounce, true)}/> <label for="nodebounce" class="svelte-1uha8ag">No debounce</label></div></div> <div class="props-section svelte-1uha8ag"><div class="toggle svelte-1uha8ag"><input id="basic" type="checkbox"${$.attr('checked', props.lineNumbers, true)}/> <label for="basic" class="svelte-1uha8ag">Show line numbers</label></div> <div class="toggle svelte-1uha8ag"><input id="editable" type="checkbox"${$.attr('checked', props.history, true)}/> <label for="editable" class="svelte-1uha8ag">History</label></div> <div class="toggle svelte-1uha8ag"><input id="readonly" type="checkbox"${$.attr('checked', props.foldGutter, true)}/> <label for="readonly" class="svelte-1uha8ag">Fold Gutter</label></div> <div class="toggle svelte-1uha8ag"><input id="lineWrapping" type="checkbox"${$.attr('checked', props.drawSelection, true)}/> <label for="lineWrapping" class="svelte-1uha8ag">Draw Selection</label></div> <div class="toggle svelte-1uha8ag"><input id="nodebounce" type="checkbox"${$.attr('checked', props.dropCursor, true)}/> <label for="nodebounce" class="svelte-1uha8ag">Drop Cursor</label></div></div> <div class="props-section svelte-1uha8ag"><div class="toggle svelte-1uha8ag"><input id="basic" type="checkbox"${$.attr('checked', props.indentOnInput, true)}/> <label for="basic" class="svelte-1uha8ag">Indent on Input</label></div> <div class="toggle svelte-1uha8ag"><input id="editable" type="checkbox"${$.attr('checked', props.syntaxHighlighting, true)}/> <label for="editable" class="svelte-1uha8ag">Syntax Highlighting</label></div> <div class="toggle svelte-1uha8ag"><input id="readonly" type="checkbox"${$.attr('checked', props.bracketMatching, true)}/> <label for="readonly" class="svelte-1uha8ag">Bracket Matching</label></div> <div class="toggle svelte-1uha8ag"><input id="lineWrapping" type="checkbox"${$.attr('checked', props.closeBrackets, true)}/> <label for="lineWrapping" class="svelte-1uha8ag">Close Brackets</label></div> <div class="toggle svelte-1uha8ag"><input id="nodebounce" type="checkbox"${$.attr('checked', props.autocompletion, true)}/> <label for="nodebounce" class="svelte-1uha8ag">Autocompletion</label></div></div> <div class="props-section svelte-1uha8ag"><div class="toggle svelte-1uha8ag"><input id="basic" type="checkbox"${$.attr('checked', props.rectangularSelection, true)}/> <label for="basic" class="svelte-1uha8ag">Rectangular Selection</label></div> <div class="toggle svelte-1uha8ag"><input id="editable" type="checkbox"${$.attr('checked', props.crosshairCursor, true)}/> <label for="editable" class="svelte-1uha8ag">Crosshair Cursor</label></div></div> <h5 class="svelte-1uha8ag">Tab</h5> <div class="props-section svelte-1uha8ag"><div class="toggle svelte-1uha8ag"><input id="useTab" type="checkbox"${$.attr('checked', props.useTab, true)}/> <label for="useTab" class="svelte-1uha8ag">Enable Tab</label></div> <div class="input svelte-1uha8ag"><label for="tabSize" class="svelte-1uha8ag">Tab size</label> <input id="tabSize" type="number"${$.attr('value', props.tabSize)} step="1" class="svelte-1uha8ag"/></div></div> <h5 class="svelte-1uha8ag">Language</h5> <div class="props-section svelte-1uha8ag"><div class="input svelte-1uha8ag"><label for="language" class="svelte-1uha8ag">Language</label> `);

			$$renderer.select(
				{
					id: 'language',
					value: language,
					onchange: on_language_change
				},
				($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(languages);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let lang = each_array[$$index];

						$$renderer.option({}, lang);
					}

					$$renderer.push(`<!--]-->`);
				}
			);

			$$renderer.push(`</div></div> <h5 class="svelte-1uha8ag">Theme</h5> <div class="props-section svelte-1uha8ag"><div class="input svelte-1uha8ag"><label for="theme" class="svelte-1uha8ag">Theme</label> `);

			$$renderer.select({ id: 'theme', value: theme, onchange: on_theme_change }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array_1 = $.ensure_array_like(themes);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let thm = each_array_1[$$index_1];

					$$renderer.option({}, thm);
				}

				$$renderer.push(`<!--]-->`);
			});

			$$renderer.push(`</div></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}