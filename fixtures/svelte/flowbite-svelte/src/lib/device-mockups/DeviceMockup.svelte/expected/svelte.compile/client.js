import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Android from "./Android.svelte";
import DefaultMockup from "./DefaultMockup.svelte";
import Desktop from "./Desktop.svelte";
import Ios from "./Ios.svelte";
import Laptop from "./Laptop.svelte";
import Smartwatch from "./Smartwatch.svelte";
import Tablet from "./Tablet.svelte";

export default function DeviceMockup($$anchor, $$props) {
	let device = $.prop($$props, 'device', 3, "default");

	const componets = {
		android: Android,
		ios: Ios,
		tablet: Tablet,
		default: DefaultMockup,
		smartwatch: Smartwatch,
		laptop: Laptop,
		desktop: Desktop
	};

	let DeviceComponent = $.derived(() => componets[device()]);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $.get(DeviceComponent), ($$anchor, DeviceComponent_1) => {
		DeviceComponent_1($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.snippet(node_1, () => $$props.children);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}