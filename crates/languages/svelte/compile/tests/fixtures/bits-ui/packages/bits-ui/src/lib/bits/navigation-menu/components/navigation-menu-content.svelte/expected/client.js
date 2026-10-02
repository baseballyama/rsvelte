import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuContentState } from "../navigation-menu.svelte.js";
import NavigationMenuContentImpl from "./navigation-menu-content-impl.svelte";
import { createId } from "$lib/internal/create-id.js";
import { getDataTransitionAttrs } from "$lib/internal/attrs.js";
import Portal from "$lib/bits/utilities/portal/portal.svelte";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";
import Mounted from "$lib/bits/utilities/mounted.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'id',
	'children',
	'child',
	'forceMount'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Navigation_menu_content($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const contentState = NavigationMenuContentState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));

	{
		let $0 = $.derived(() => contentState.context.viewportRef.current || undefined);
		let $1 = $.derived(() => !contentState.context.viewportRef.current);

		Portal($$anchor, {
			get to() {
				return $.get($0);
			},

			get disabled() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				{
					const presence = ($$anchor, $$arg0) => {
						let transitionStatus = () => ($$arg0?.()).transitionStatus;
						var fragment_2 = root();
						var node = $.first_child(fragment_2);

						{
							let $0 = $.derived(() => mergeProps($.get(mergedProps), getDataTransitionAttrs(transitionStatus())));

							NavigationMenuContentImpl(node, $.spread_props(() => $.get($0), {
								get children() {
									return $$props.children;
								},

								get child() {
									return $$props.child;
								}
							}));
						}

						var node_1 = $.sibling(node, 2);

						Mounted(node_1, {
							get mounted() {
								return contentState.mounted;
							},

							set mounted($$value) {
								contentState.mounted = $$value;
							}
						});

						$.append($$anchor, fragment_2);
					};

					let $0 = $.derived(() => forceMount() || contentState.open || contentState.isLastActiveValue);

					PresenceLayer($$anchor, {
						get open() {
							return $.get($0);
						},

						get ref() {
							return contentState.opts.ref;
						},
						presence,
						$$slots: { presence: true }
					});
				}
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}