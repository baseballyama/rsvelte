import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAllContexts, mount, unmount } from "svelte";
import { DEV } from "esm-env";
import { watch } from "runed";
import PortalConsumer from "./portal-consumer.svelte";
import { isBrowser } from "$lib/internal/is.js";
import { resolvePortalToProp } from "$lib/bits/utilities/config/prop-resolvers.js";

export default function Portal($$anchor, $$props) {
	$.push($$props, true);

	const to = resolvePortalToProp(() => $$props.to);
	const context = getAllContexts();
	let target = $.derived(getTarget);

	function getTarget() {
		if (!isBrowser || $$props.disabled) return null;

		let localTarget = null;

		if (typeof to.current === "string") {
			const target = document.querySelector(to.current);

			if (DEV && target === null) {
				throw new Error(`Target element "${to.current}" not found.`);
			}

			localTarget = target;
		} else {
			localTarget = to.current;
		}

		if (DEV && !(localTarget instanceof Element)) {
			const type = localTarget === null ? "null" : typeof localTarget;

			throw new TypeError(`Unknown portal target type: ${type}. Allowed types: string (query selector) or Element.`);
		}

		return localTarget;
	}

	let instance;

	function unmountInstance() {
		if (instance) {
			unmount(instance);
			instance = null;
		}
	}

	watch([() => $.get(target), () => $$props.disabled], ([target, disabled]) => {
		if (!target || disabled) {
			unmountInstance();

			return;
		}

		instance = mount(PortalConsumer, { target, props: { children: $$props.children }, context });

		return () => {
			unmountInstance();
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children ?? $.noop);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.disabled) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}