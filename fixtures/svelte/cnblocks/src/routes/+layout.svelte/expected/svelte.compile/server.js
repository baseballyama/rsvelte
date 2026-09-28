import * as $ from 'svelte/internal/server';
import { ModeWatcher, toggleMode } from "mode-watcher";
import "../app.css";
import { activeElement, PressedKeys } from "runed";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		let keys = new PressedKeys();

		keys.onKeys(["d"], () => {
			if (activeElement.current?.localName === "input" || activeElement.current?.localName === "textarea") return;

			toggleMode();
		});

		ModeWatcher($$renderer, {});
		$$renderer.push(`<!----> `);
		children($$renderer);
		$$renderer.push(`<!---->`);
	});
}