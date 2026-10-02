import * as $ from 'svelte/internal/server';
import { getAllContexts, mount, unmount } from "svelte";
import { DEV } from "esm-env";
import { watch } from "runed";
import PortalConsumer from "./portal-consumer.svelte";
import { isBrowser } from "$lib/internal/is.js";
import { resolvePortalToProp } from "$lib/bits/utilities/config/prop-resolvers.js";

export default function Portal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { to: toProp, children, disabled } = $$props;
		const to = resolvePortalToProp(() => toProp);
		const context = getAllContexts();
		let target = $.derived(getTarget);

		function getTarget() {
			if (!isBrowser || disabled) return null;

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

		watch([() => target(), () => disabled], ([target, disabled]) => {
			if (!target || disabled) {
				unmountInstance();

				return;
			}

			instance = mount(PortalConsumer, { target, props: { children }, context });

			return () => {
				unmountInstance();
			};
		});

		if (disabled) {
			$$renderer.push('<!--[0-->');
			children?.($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}