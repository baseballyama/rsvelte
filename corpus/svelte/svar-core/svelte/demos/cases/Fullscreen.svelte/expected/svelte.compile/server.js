import * as $ from 'svelte/internal/server';
import { Fullscreen } from "../../src/index";
import { Button } from "../../src/index";
import { ColorPicker } from "../../src/index";
import { DatePicker } from "../../src/index";

export default function Fullscreen_1($$renderer) {
	$$renderer.push(`<div class="fullscreen-demo svelte-fufkhu">`);

	Fullscreen($$renderer, {
		hotkey: 'ctrl+shift+f',
		children: ($$renderer) => {
			$$renderer.push(`<div class="demo-box svelte-fufkhu"><h3>Fullscreen</h3> <p>Click button or press Ctrl + Shift + F to toggle fullscreen</p> <div class="demo-content svelte-fufkhu">`);
			ColorPicker($$renderer, { placeholder: 'Select a color...', value: '#65D3B3' });
			$$renderer.push(`<!----> `);
			ColorPicker($$renderer, { placeholder: 'Select a color...', value: '#65D3B3' });
			$$renderer.push(`<!----> `);
			ColorPicker($$renderer, { placeholder: 'Select a color...', value: '#65D3B3' });
			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Fullscreen($$renderer, {
		hotkey: 'ctrl+shift+f',
		children: ($$renderer) => {
			$$renderer.push(`<div class="demo-box svelte-fufkhu"><h3>Fullscreen</h3> <p>When encountering multiple instances with same hotkeys selects
				focused area first</p> <p>Click button or press Ctrl + Shift + F to toggle fullscreen</p> <div class="demo-content svelte-fufkhu">`);

			ColorPicker($$renderer, { placeholder: 'Select a color...', value: '#ffc975' });
			$$renderer.push(`<!----> `);
			ColorPicker($$renderer, { placeholder: 'Select a color...', value: '#ffc975' });
			$$renderer.push(`<!----> `);
			ColorPicker($$renderer, { placeholder: 'Select a color...', value: '#ffc975' });
			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function toggleButton($$renderer, onclick, inFullscreen) {
			$$renderer.push(`<div class="demo-button svelte-fufkhu">`);

			Button($$renderer, {
				onclick,
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(`Click me to ${inFullscreen ? "exit" : "enter"} fullscreen`)}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		Fullscreen($$renderer, {
			hotkey: 'ctrl+shift+space',
			toggleButton,
			children: ($$renderer) => {
				$$renderer.push(`<div class="demo-box svelte-fufkhu"><h3>Fullscreen with custom button</h3> <p>Click button or press Ctrl + Shift + Space to toggle fullscreen</p> <div class="demo-content svelte-fufkhu">`);
				DatePicker($$renderer, {});
				$$renderer.push(`<!----> `);
				DatePicker($$renderer, {});
				$$renderer.push(`<!----> `);
				DatePicker($$renderer, {});
				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { toggleButton: true, default: true }
		});
	}

	$$renderer.push(`<!----></div>`);
}