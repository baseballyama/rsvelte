import * as $ from 'svelte/internal/server';
import { Inspect } from '@components';
import { StateHistory } from 'runed';
import ColorPicker from 'svelte-awesome-color-picker';
import { themes } from './themes.js';
import Theming from './Theming.svelte';
import { onMount } from 'svelte';

export default function DefineTheme($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import Console from '$lib/components/icons/Console.svelte'
		let visible = false;

		onMount(() => {
			let tim = setTimeout(
				() => {
					visible = true;
				},
				600
			);

			return () => {
				clearTimeout(tim);
			};
		});

		let presets = Object.keys(themes);
		let selectedPreset = 'inspect';
		let preset = 'inspect';
		let panel = false;
		let backgroundColor = '#808080';
		let borderless = false;
		let font = 'monospace';
		let fontSize = 12;
		let fontSizePx = $.derived(() => fontSize + 'px');
		let indent = 0.75;
		let colors = { ...themes.inspect };
		let keys = $.derived(() => Object.keys(colors));
		let pickerOpen = Object.fromEntries(keys().map((k) => [k, false]));
		let historySrc = { colors: { ...themes.inspect } };

		const history = new StateHistory(() => ({ ...historySrc }), (entry) => {
			colors = { ...entry.colors };

			// selectedPreset = entry.selectedPreset
		});

		let style = $.derived(() => {
			return keys().map((k) => `${k}: ${colors[k]};`).join('') + 'flex-basis: 100%;';
		});

		let wroteToHistoryOnce = false;

		function loadPreset() {
			applyColors({ ...themes[selectedPreset] });
		}

		function applyColors(newColors) {
			colors = Object.fromEntries(keys().map((k) => {
				return [k, newColors[k]];
			}));
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('9qolj2', $$renderer, ($$renderer) => {
				$$renderer.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&amp;family=Fira+Code:wght@300..700&amp;family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&amp;family=Inconsolata:wght@200..900&amp;family=Reddit+Mono:wght@200..900&amp;family=Roboto+Mono:ital,wght@0,100..700;1,100..700&amp;family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&amp;family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&amp;display=swap" rel="stylesheet"/>`);
			});

			$$renderer.push(`<div class="controls svelte-9qolj2"><div class="sub-controls svelte-9qolj2"><label class="preset-loader svelte-9qolj2">Presets `);

			$$renderer.select(
				{ value: selectedPreset, class: '' },
				($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(presets);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let preset = each_array[$$index];

						$$renderer.option({ value: preset }, ($$renderer) => {
							$$renderer.push(`${$.escape(preset)}`);
						});
					}

					$$renderer.push(`<!--]-->`);
				},
				'svelte-9qolj2'
			);

			$$renderer.push(`</label> <button class="svelte-9qolj2">Load</button></div> <label class="svelte-9qolj2">Background `);

			$$renderer.select(
				{ value: backgroundColor, class: '' },
				($$renderer) => {
					$$renderer.option({ value: '#f2f2f2' }, ($$renderer) => {
						$$renderer.push(`bright`);
					});

					$$renderer.option({ value: '#808080' }, ($$renderer) => {
						$$renderer.push(`neutral`);
					});

					$$renderer.option({ value: '#111' }, ($$renderer) => {
						$$renderer.push(`dark`);
					});
				},
				'svelte-9qolj2'
			);

			$$renderer.push(`</label> <div class="sub-controls svelte-9qolj2"><label class="svelte-9qolj2">Panel <input type="checkbox"${$.attr('checked', panel, true)} class="svelte-9qolj2"/></label> <label class="svelte-9qolj2">Borderless <input type="checkbox"${$.attr('checked', borderless, true)} class="svelte-9qolj2"/></label></div></div> <div class="colors-and-preview svelte-9qolj2"${$.attr_style('', { opacity: visible ? '1' : '0' })}>`);

			$.css_props(
				$$renderer,
				true,
				{
					'--preview-bg': backgroundColor,
					'--indent': `${$.stringify(indent)}em`,
					'--inspect-font': font,
					'--inspect-font-size': fontSizePx()
				},
				() => {
					Theming($$renderer, { borderless, panel, colors, style: style() });
				}
			);

			$$renderer.push(` <div class="colors not-content svelte-9qolj2"><!--[-->`);

			const each_array_1 = $.ensure_array_like(keys());

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let key = each_array_1[$$index_1];

				$$renderer.push(`<div class="dark-picker svelte-9qolj2">`);

				ColorPicker($$renderer, {
					hex: colors[key],
					onInput: (color) => {
						colors = { ...colors, [key]: color.hex };
					},
					label: key.replaceAll('--base', ''),
					dir: 'rtl',
					get isOpen() {
						return pickerOpen[key];
					},

					set isOpen($$value) {
						pickerOpen[key] = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="controls svelte-9qolj2"><label class="svelte-9qolj2">Indent (em) <input type="number" style="max-width: 6em"${$.attr('step', 0.125)}${$.attr('value', indent)} class="svelte-9qolj2"/></label> <label class="svelte-9qolj2">Font `);

			$$renderer.select(
				{ value: font, class: '' },
				($$renderer) => {
					$$renderer.option({ value: 'monospace' }, ($$renderer) => {
						$$renderer.push(`monospace (system)`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Roboto Mono`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Inconsolata`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Source Code Pro`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`IBM Plex Mono`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Courier Prime`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Ubuntu Mono`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Fira Code`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Reddit Mono`);
					});

					$$renderer.option({ disabled: true }, ($$renderer) => {
						$$renderer.push(`Local install required:`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Consolas`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Pixel Code`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Dank Mono`);
					});

					$$renderer.option({}, ($$renderer) => {
						$$renderer.push(`Andale Mono`);
					});
				},
				'svelte-9qolj2'
			);

			$$renderer.push(`</label> <label class="svelte-9qolj2">Font size <input type="number" style="max-width: 6em"${$.attr('value', fontSize)} class="svelte-9qolj2"/></label> <button title="Output theme object to console" style="width: 2em; height: 2em;" class="svelte-9qolj2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19h8M4 17l6-6l-6-6"></path></svg></button> <button${$.attr('disabled', !history.canUndo, true)} class="svelte-9qolj2">Undo</button> <button${$.attr('disabled', !history.canRedo, true)} class="svelte-9qolj2">Redo</button></div> `);

			Inspect($$renderer, {
				values: { style: style(), history: history.log.map((h) => h.snapshot) }
			});

			$$renderer.push(`<!----> <h2 id="defining-a-theme">Defining a theme</h2> <p>Add your custom theme class to a global css file and import it, then set the theme-class using the
  class or theme-prop on the inspect component or via global options.</p> <pre class="svelte-9qolj2"><span class="selector svelte-9qolj2">.my-inspect-theme</span> {
<!--[-->`);

			const each_array_2 = $.ensure_array_like(keys());

			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let key = each_array_2[i];

				$$renderer.push(`<span class="key svelte-9qolj2">${$.escape(key)}</span>: <span class="value svelte-9qolj2">${$.escape(colors[key])}</span>;`);

				if (i !== 15) {
					$$renderer.push(`<!--[0--><br/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->
}</pre> <p>Alternatively, set css variables directly on the component.</p> <pre class="svelte-9qolj2">&lt;<span style="color:var(--blue);">Inspect</span>
  <span style="color: var(--green)">theme</span>=""
<!--[-->`);

			const each_array_3 = $.ensure_array_like(keys());

			for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
				let key = each_array_3[i];

				$$renderer.push(`<span class="value svelte-9qolj2" style="padding-left: 1em;">${$.escape(key)}</span>=<span style="color: var(--yellow);">"${$.escape(colors[key])}"</span>`);

				if (i !== 15) {
					$$renderer.push(`<!--[0--><br/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->
/>
</pre> <em>Note: these code blocks are updated with colors set in the theme editor above</em> <h2 id="extended-theming">Extended customization</h2> <p>Behind the scenes, the base16 theme is mapped to internal CSS-variables. This mapping can be
  overriden by setting additional CSS-variables on your custom theme class or passing them to the
  component.<br/> See the <a href="/theming/vars">full overview</a> of available css-variables than can be passed to <code>Inspect</code>.</p> <pre class="svelte-9qolj2">&lt;<span style="color:var(--blue);">Inspect</span>
<span style="padding-left: 1em;color: var(--green);">theme</span>=<span style="color: var(--yellow);">"inspect"</span>
<span style="padding-left: 1em;color: var(--green);">value</span>=<span style="color: var(--yellow);">{...}</span>
<span class="value svelte-9qolj2" style="padding-left: 1em;">--inspect-background</span>=<span style="color: var(--yellow);">"linear-gradient(45deg, var(--base00) 50%, hotpink)"</span>
<span class="value svelte-9qolj2" style="padding-left: 1em;">--caret-color</span>=<span style="color: var(--yellow);">"#b4da55"</span>
<span class="value svelte-9qolj2" style="padding-left: 1em;">--caret-focus-color</span>=<span style="color: var(--yellow);">"hotpink"</span>
<span class="value svelte-9qolj2" style="padding-left: 1em;">--bullet-color</span>=<span style="color: var(--yellow);">"hotpink"</span>
<span class="value svelte-9qolj2" style="padding-left: 1em;">--string-value-color</span>=<span style="color: var(--yellow);">"var(--base08)"</span>
/>
</pre> Result: `);

			$.css_props(
				$$renderer,
				true,
				{
					'--inspect-background': 'linear-gradient(45deg, var(--base00) 50%, hotpink)',
					'--text-color': 'var(--base05)',
					'--caret-color': '#b4da55',
					'--caret-focus-color': 'hotpink',
					'--bullet-color': 'hotpink',
					'--string-value-color': 'var(--base08)'
				},
				() => {
					Inspect($$renderer, {
						theme: 'inspect',
						value: { test: 'lorem ipsum dolor sit amet' }
					});
				}
			);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}