import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog from "$lib/dialog/Dialog.svelte";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { sineIn } from "svelte/easing";
import { fly } from "svelte/transition";
import { drawer } from "./theme";
import { setDrawerContext } from "$lib/context";
import { tick } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'open',
	'hidden',
	'modal',
	'offset',
	'width',
	'dismissable',
	'placement',
	'class',
	'transitionParams',
	'transition',
	'outsideclose',
	'activateClickOutside'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Drawer($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		hidden = $.prop($$props, 'hidden', 15),
		placement = $.prop($$props, 'placement', 3, "left"),
		transition = $.prop($$props, 'transition', 3, fly),
		outsideclose = $.prop($$props, 'outsideclose', 7),
		restProps = $.rest_props($$props, rest_excludes);

	// Set dismissable based on offset if not explicitly provided
	const finalDismissable = $.derived(() => $$props.dismissable ?? ($$props.offset ? false : undefined));

	// Create reactive context using getter
	const context = {
		get placement() {
			return placement();
		}
	};

	setDrawerContext(context);

	// back compatibility
	if (hidden() !== undefined) console.warn("'hidden' property is deprecated. Please use the 'open' property to manage 'Drawer'.");

	$.user_effect(() => {
		if ($$props.activateClickOutside !== undefined) console.warn("'activateClickOutside' property is deprecated. Please use the 'outsideclose' property to manage 'Drawer' behaviour.");
	});

	$.user_effect(() => {
		if ($$props.activateClickOutside !== undefined && outsideclose() === undefined) {
			outsideclose($$props.activateClickOutside);
		}
	});

	$.user_effect(() => {
		if (hidden() !== undefined) {
			const nextOpen = !hidden();

			if (open() !== nextOpen) open(nextOpen);
		}
	});

	$.user_effect(() => {
		if (hidden() !== undefined) {
			const nextHidden = !open();

			if (hidden() !== nextHidden) hidden(nextHidden);
		}
	});

	// end
	const theme = $.derived(() => getTheme("drawer"));

	let shifted = $.state(true);

	const $$d = $.derived(() => drawer({
			placement: placement(),
			width: $$props.width,
			modal: $$props.offset && !open() ? false : $$props.modal,
			shifted: $.get(shifted)
		})),
		base = $.derived(() => $.get($$d).base);

	let x = $.state(void 0);
	let y = $.state(void 0);

	let transition_params = $.derived(() => ({
		x: $.get(x),
		y: $.get(y),
		duration: 300,
		easing: sineIn,
		opacity: 1,
		...$$props.transitionParams
	}));

	function init(node) {
		// set initial offset, later it will be switched on/off by onintrostart
		if ($$props.offset) {
			node.style[placement()] = $$props.offset;

			tick().then(() => {
				// few browsers give focus when dialog is open even in non-modal version
				// to prevent that we set dialog to inert during creation and remove it
				// as soon as ready
				node.inert = false;
			});
		}
	}

	async function onintrostart(ev) {
		$$props.onintrostart?.(ev);

		if (ev.defaultPrevented) return;

		// set the values for transition start position
		const dlg = ev.currentTarget;

		const { innerWidth = 0, innerHeight = 0 } = dlg.ownerDocument.defaultView ?? {};
		const rect = dlg.getBoundingClientRect();

		$.set(
			x,
			placement() === "left"
				? rect.left
				: placement() === "right" ? rect.right - innerWidth : undefined,
			true
		);

		$.set(
			y,
			placement() === "top"
				? rect.top
				: placement() === "bottom" ? rect.bottom - innerHeight : undefined,
			true
		);

		await tick(); // let transition start

		// remove shift for transition end position
		$.set(shifted, !open());

		// add offset if closed, remove it when open
		if ($$props.offset) dlg.style[placement()] = open() ? "" : $$props.offset;
	}

	function onoutrostart(ev) {
		$$props.onoutrostart?.(ev);

		if (ev.defaultPrevented) return;

		$.set(shifted, true);
	}

	var fragment = root();
	var node_1 = $.first_child(fragment);

	{
		let $0 = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));

		Dialog(node_1, $.spread_props(
			{
				[$.attachment()]: init,
				get modal() {
					return $$props.modal;
				},

				get dismissable() {
					return $.get(finalDismissable);
				},

				get transition() {
					return transition();
				},

				get outsideclose() {
					return outsideclose();
				},

				get transitionParams() {
					return $.get(transition_params);
				}
			},
			() => restProps,
			{
				onintrostart,
				onoutrostart,
				get class() {
					return $.get($0);
				},

				get open() {
					return open();
				},

				set open($$value) {
					open($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.snippet(node_2, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	var node_3 = $.sibling(node_1, 2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) }));

				Dialog($$anchor, $.spread_props(
					{
						[$.attachment()]: init,
						open: true,
						modal: false,
						get dismissable() {
							return $.get(finalDismissable);
						},

						get outsideclose() {
							return outsideclose();
						},
						inert: true
					},
					() => restProps,
					{
						get class() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.snippet(node_4, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					}
				));
			}
		};

		$.if(node_3, ($$render) => {
			if ($$props.offset && !open()) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}