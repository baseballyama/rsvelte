import * as $ from 'svelte/internal/server';
import KbdArrowKeys from "./kbd-arrow-keys.svelte";
import KbdBasic from "./kbd-basic.svelte";
import KbdGroupExample from "./kbd-group-example.svelte";
import KbdInInputGroup from "./kbd-in-input-group.svelte";
import KbdInTooltip from "./kbd-in-tooltip.svelte";
import KbdModifierKeys from "./kbd-modifier-keys.svelte";
import KbdWithIconsAndText from "./kbd-with-icons-and-text.svelte";
import KbdWithIcons from "./kbd-with-icons.svelte";
import KbdWithSamp from "./kbd-with-samp.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Kbd($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			KbdBasic($$renderer, {});
			$$renderer.push(`<!----> `);
			KbdModifierKeys($$renderer, {});
			$$renderer.push(`<!----> `);
			KbdGroupExample($$renderer, {});
			$$renderer.push(`<!----> `);
			KbdArrowKeys($$renderer, {});
			$$renderer.push(`<!----> `);
			KbdWithIcons($$renderer, {});
			$$renderer.push(`<!----> `);
			KbdWithIconsAndText($$renderer, {});
			$$renderer.push(`<!----> `);
			KbdInInputGroup($$renderer, {});
			$$renderer.push(`<!----> `);
			KbdInTooltip($$renderer, {});
			$$renderer.push(`<!----> `);
			KbdWithSamp($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}