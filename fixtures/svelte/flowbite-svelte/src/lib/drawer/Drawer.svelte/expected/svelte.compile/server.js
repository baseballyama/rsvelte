import * as $ from 'svelte/internal/server';
import Dialog from "$lib/dialog/Dialog.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { sineIn } from "svelte/easing";
import { fly } from "svelte/transition";
import { drawer } from "./theme";
import { setDrawerContext } from "$lib/context";
import { tick } from "svelte";

export default function Drawer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			open = false,
			hidden = void 0,
			modal,
			offset,
			width,
			dismissable,
			placement = "left",
			class: className,
			transitionParams,
			transition = fly,
			outsideclose,
			activateClickOutside,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Set dismissable based on offset if not explicitly provided
		const finalDismissable = $.derived(() => dismissable ?? (offset ? false : undefined));

		// Create reactive context using getter
		const context = {
			get placement() {
				return placement;
			}
		};

		setDrawerContext(context);

		// back compatibility
		if (hidden !== undefined) console.warn("'hidden' property is deprecated. Please use the 'open' property to manage 'Drawer'.");

		// end
		const theme = $.derived(() => getTheme("drawer"));

		let shifted = true;

		const $$d = $.derived(() => drawer({
				placement,
				width,
				modal: offset && !open ? false : modal,
				shifted
			})),
			base = $.derived(() => $$d().base);

		let x = void 0;
		let y = void 0;

		let transition_params = $.derived(() => ({
			x,
			y,
			duration: 300,
			easing: sineIn,
			opacity: 1,
			...transitionParams
		}));

		function init(node) {
			// set initial offset, later it will be switched on/off by onintrostart
			if (offset) {
				node.style[placement] = offset;

				tick().then(() => {
					// few browsers give focus when dialog is open even in non-modal version
					// to prevent that we set dialog to inert during creation and remove it
					// as soon as ready
					node.inert = false;
				});
			}
		}

		async function onintrostart(ev) {
			restProps.onintrostart?.(ev);

			if (ev.defaultPrevented) return;

			// set the values for transition start position
			const dlg = ev.currentTarget;

			const { innerWidth = 0, innerHeight = 0 } = dlg.ownerDocument.defaultView ?? {};
			const rect = dlg.getBoundingClientRect();

			x = placement === "left"
				? rect.left
				: placement === "right" ? rect.right - innerWidth : undefined;

			y = placement === "top"
				? rect.top
				: placement === "bottom" ? rect.bottom - innerHeight : undefined;

			await tick(); // let transition start

			// remove shift for transition end position
			shifted = !open;

			// add offset if closed, remove it when open
			if (offset) dlg.style[placement] = open ? "" : offset;
		}

		function onoutrostart(ev) {
			restProps.onoutrostart?.(ev);

			if (ev.defaultPrevented) return;

			shifted = true;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Dialog($$renderer, $.spread_props([
				{
					modal,
					dismissable: finalDismissable(),
					transition,
					outsideclose,
					transitionParams: transition_params()
				},
				restProps,
				{
					onintrostart,
					onoutrostart,
					class: base()({ class: clsx(theme()?.base, className) }),
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push(`<!----> `);

			if (offset && !open) {
				$$renderer.push('<!--[0-->');

				Dialog($$renderer, $.spread_props([
					{
						open: true,
						modal: false,
						dismissable: finalDismissable(),
						outsideclose,
						inert: true
					},
					restProps,
					{
						class: base()({ class: clsx(theme()?.base, className) }),
						children: ($$renderer) => {
							children?.($$renderer);
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open, hidden });
	});
}