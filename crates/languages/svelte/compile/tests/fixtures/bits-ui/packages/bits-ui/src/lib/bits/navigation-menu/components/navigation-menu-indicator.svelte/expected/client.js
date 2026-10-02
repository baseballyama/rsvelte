import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuIndicatorState } from "../navigation-menu.svelte.js";
import NavigationMenuIndicatorImpl from "./navigation-menu-indicator-impl.svelte";
import { createId } from "$lib/internal/create-id.js";
import { getDataTransitionAttrs } from "$lib/internal/attrs.js";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";
import Portal from "$lib/bits/utilities/portal/portal.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'children',
	'child',
	'forceMount'
]);

export default function Navigation_menu_indicator($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const indicatorState = NavigationMenuIndicatorState.create();
	const mergedProps = $.derived(() => mergeProps(restProps));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Portal($$anchor, {
				get to() {
					return indicatorState.context.indicatorTrackRef.current;
				},

				children: ($$anchor, $$slotProps) => {
					{
						const presence = ($$anchor, $$arg0) => {
							let transitionStatus = () => ($$arg0?.()).transitionStatus;

							{
								let $0 = $.derived(() => mergeProps($.get(mergedProps), getDataTransitionAttrs(transitionStatus())));

								NavigationMenuIndicatorImpl($$anchor, $.spread_props(() => $.get($0), {
									get children() {
										return $$props.children;
									},

									get child() {
										return $$props.child;
									},

									get id() {
										return id();
									},

									get ref() {
										return ref();
									},

									set ref($$value) {
										ref($$value);
									}
								}));
							}
						};

						let $0 = $.derived(() => forceMount() || indicatorState.isVisible);
						let $1 = $.derived(() => boxWith(() => ref()));

						PresenceLayer($$anchor, {
							get open() {
								return $.get($0);
							},

							get ref() {
								return $.get($1);
							},
							presence,
							$$slots: { presence: true }
						});
					}
				},
				$$slots: { default: true }
			});
		};

		$.if(node, ($$render) => {
			if (indicatorState.context.indicatorTrackRef.current) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}