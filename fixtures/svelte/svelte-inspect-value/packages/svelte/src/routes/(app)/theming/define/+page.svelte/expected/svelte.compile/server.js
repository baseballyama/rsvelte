import * as $ from 'svelte/internal/server';
import DevOnly from '$lib/components/DevOnly.svelte';
import Console from '$lib/components/icons/Console.svelte';
import Inspect from '$lib/Inspect.svelte';
import { colord } from 'colord';
import HueRotate from './HueRotate.svelte';
import { themes } from './themes.js';
import Theming from './Theming.svelte';
import { createPageTitle } from '$doclib/util.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let font = 'monospace';
		let fontSize = 12;
		let fontSizePx = $.derived(() => fontSize + 'px');
		let indent = 0.75;
		let colors = { ...themes.inspect };
		let lockedColors = [];
		let keys = $.derived(() => Object.keys(colors));
		let rotated = void 0;
		let rotation = 0;
		let steps = [{ ...themes.inspect }];
		let currentStep = 0;
		let currentColors = $.derived(() => rotated == null ? colors : rotated);
		let style = $.derived(() => keys().map((k) => `${k}: ${currentColors()[k]};`).join(''));
		let presets = Object.keys(themes);
		let selectedPreset = 'inspect';

		function rotateColors(value) {
			rotated = {
				...Object.fromEntries(keys().map((k) => [
					k,
					lockedColors.includes(k) ? colors[k] : colord(colors[k]).rotate(value).toHex()
				]))
			};
		}

		function loadPreset() {
			applyToUnlocked({ ...themes[selectedPreset] });
			saveStep();
			rotated = undefined;
			rotation = 0;
		}

		function applyToUnlocked(newColors) {
			colors = Object.fromEntries(keys().map((k) => {
				if (lockedColors.includes(k)) {
					return [k, colors[k]];
				} else {
					return [k, newColors[k]];
				}
			}));
		}

		function undo() {
			let prevStep = steps[currentStep - 1];

			if (prevStep) {
				colors = { ...prevStep };
				currentStep -= 1;
			}
		}

		function redo() {
			let nextStep = steps[currentStep + 1];

			if (nextStep) {
				colors = { ...nextStep };
				currentStep += 1;
			}
		}

		function saveStep(changeCurrentStep = true) {
			steps.push($.snapshot(colors));

			if (changeCurrentStep) currentStep = steps.length - 1;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$.head('c49e4a', $$renderer, ($$renderer) => {
				$$renderer.title(($$renderer) => {
					$$renderer.push(`<title>${$.escape(createPageTitle('Define Theme'))}</title>`);
				});

				$$renderer.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/> <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&amp;family=Fira+Code:wght@300..700&amp;family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&amp;family=Inconsolata:wght@200..900&amp;family=Reddit+Mono:wght@200..900&amp;family=Roboto+Mono:ital,wght@0,100..700;1,100..700&amp;family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&amp;family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&amp;display=swap" rel="stylesheet"/>`);
			});

			$$renderer.push(`<div class="flex row gap align-end svelte-c49e4a"><label class="svelte-c49e4a">presets `);

			$$renderer.select({ value: selectedPreset }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(presets);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let preset = each_array[$$index];

					$$renderer.option({}, preset);
				}

				$$renderer.push(`<!--]-->`);
			});

			$$renderer.push(`</label> <button>load</button></div> <div class="colors-and-preview svelte-c49e4a"><div class="colors svelte-c49e4a"><!--[-->`);

			const each_array_1 = $.ensure_array_like(keys());

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let key = each_array_1[$$index_1];
				const locked = lockedColors.includes(key);

				$$renderer.push(`<label class="color svelte-c49e4a">${$.escape(key.replaceAll('--base', ''))} <div class="colorpicker svelte-c49e4a"><input${$.attributes(
					{
						type: 'color',
						value: currentColors()[key],
						defaultvalue: '#ffffff',
						disabled: rotated != null || locked,
						class: ''
					},
					'svelte-c49e4a',
					void 0,
					void 0,
					4
				)}/></div> `);

				DevOnly($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<button type="button" title="lock" class="unstyled sm lock svelte-c49e4a"><small>${$.escape(locked ? 'unlock' : 'lock')}</small></button>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></label>`);
			}

			$$renderer.push(`<!--]--></div> <div style="flex-basis: 100%">`);

			$.css_props(
				$$renderer,
				true,
				{
					'--indent': `${$.stringify(indent)}em`,
					'--inspect-font': font,
					'--inspect-font-size': fontSizePx()
				},
				() => {
					Theming($$renderer, { style: style(), colors });
				}
			);

			$$renderer.push(`</div></div> <div class="flex row flex-wrap gap svelte-c49e4a"><label class="svelte-c49e4a">indent (em) <input type="number" style="max-width: 5em"${$.attr('step', 0.125)}${$.attr('value', indent)}/></label> <label class="svelte-c49e4a">font `);

			$$renderer.select({ value: font }, ($$renderer) => {
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
			});

			$$renderer.push(`</label> <label class="svelte-c49e4a">font-size <input type="number"${$.attr('value', fontSize)}/></label> <button title="output theme object to console" class="unstyled" style="width: 2em; height: 2em;">`);
			Console($$renderer, {});
			$$renderer.push(`<!----></button> <button class="unstyled" type="button"${$.attr('disabled', steps[currentStep - 1] == null, true)}>undo</button> <button class="unstyled" type="button"${$.attr('disabled', steps[currentStep + 1] == null, true)}>redo</button></div> `);

			HueRotate($$renderer, {
				oncancel: () => {
					rotated = undefined;
					rotation = 0;
				},

				onapply: () => {
					if (rotated) applyToUnlocked({ ...rotated });

					saveStep();
					rotated = undefined;
					rotation = 0;
				},

				get rotation() {
					return rotation;
				},

				set rotation($$value) {
					rotation = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			DevOnly($$renderer, {
				children: ($$renderer) => {
					Inspect($$renderer, { value: { steps, currentStep } });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h2 id="defining-a-theme">Defining a theme</h2> <p>Add your custom theme class to a global css file and import it, then set the theme-class using the
  class or theme-prop on the inspect component or via global options.</p> <pre class="svelte-c49e4a"><span class="selector svelte-c49e4a">.my-inspect-theme</span> {
<!--[-->`);

			const each_array_2 = $.ensure_array_like(keys());

			for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
				let key = each_array_2[i];

				$$renderer.push(`<span class="key svelte-c49e4a">${$.escape(key)}</span>: <span class="value svelte-c49e4a">${$.escape(colors[key])}</span>;`);

				if (i !== 15) {
					$$renderer.push(`<!--[0--><br/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->
}</pre> <p>Alternatively, set css variables directly on the component.</p> <pre class="svelte-c49e4a">&lt;<span style="color:var(--blue);">Inspect</span>
  <span style="color: var(--green)">theme</span>=""
<!--[-->`);

			const each_array_3 = $.ensure_array_like(keys());

			for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
				let key = each_array_3[i];

				$$renderer.push(`<span class="value svelte-c49e4a" style="padding-left: 1em;">${$.escape(key)}</span>=<span style="color: var(--yellow);">"${$.escape(colors[key])}"</span>`);

				if (i !== 15) {
					$$renderer.push(`<!--[0--><br/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]-->
/>
</pre> <h2 id="extended-theming">Extended customization</h2> <p>Behind the scenes, the base16 theme is mapped to internal CSS-variables. This mapping can be
  overriden by setting additional CSS-variables on your custom theme class or passing them to the
  component.<br/> See the <a href="/theming/vars">full overview</a> of available css-variables than can be passed to <code>Inspect</code>.</p> <pre class="svelte-c49e4a">&lt;<span style="color:var(--blue);">Inspect</span>
<span style="padding-left: 1em;color: var(--green);">theme</span>=<span style="color: var(--yellow);">"inspect"</span>
<span style="padding-left: 1em;color: var(--green);">value</span>=<span style="color: var(--yellow);">{...}</span>
<span class="value svelte-c49e4a" style="padding-left: 1em;">--inspect-background</span>=<span style="color: var(--yellow);">"linear-gradient(45deg, var(--base00) 50%, hotpink)"</span>
<span class="value svelte-c49e4a" style="padding-left: 1em;">--caret-color</span>=<span style="color: var(--yellow);">"white"</span>
<span class="value svelte-c49e4a" style="padding-left: 1em;">--caret-focus-color</span>=<span style="color: var(--yellow);">"hotpink"</span>
<span class="value svelte-c49e4a" style="padding-left: 1em;">--bullet-color</span>=<span style="color: var(--yellow);">"hotpink"</span>
<span class="value svelte-c49e4a" style="padding-left: 1em;">--string-value-color</span>=<span style="color: var(--yellow);">"var(--base08)"</span>
/>
</pre> Result: `);

			$.css_props(
				$$renderer,
				true,
				{
					'--inspect-background': 'linear-gradient(45deg, var(--base00) 50%, hotpink)',
					'--caret-color': 'white',
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