import * as $ from 'svelte/internal/server';
import Android from "./Android.svelte";
import DefaultMockup from "./DefaultMockup.svelte";
import Desktop from "./Desktop.svelte";
import Ios from "./Ios.svelte";
import Laptop from "./Laptop.svelte";
import Smartwatch from "./Smartwatch.svelte";
import Tablet from "./Tablet.svelte";

export default function DeviceMockup($$renderer, $$props) {
	let { children, device = "default" } = $$props;

	const componets = {
		android: Android,
		ios: Ios,
		tablet: Tablet,
		default: DefaultMockup,
		smartwatch: Smartwatch,
		laptop: Laptop,
		desktop: Desktop
	};

	let DeviceComponent = $.derived(() => componets[device]);

	if (DeviceComponent()) {
		$$renderer.push('<!--[-->');

		DeviceComponent()($$renderer, {
			children: ($$renderer) => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}