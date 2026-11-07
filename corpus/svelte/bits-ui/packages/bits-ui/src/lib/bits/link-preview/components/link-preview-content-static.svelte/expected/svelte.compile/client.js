import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { LinkPreviewContentState } from "../link-preview.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";
import Mounted from "$lib/bits/utilities/mounted.svelte";
import { noop } from "$lib/internal/noop.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'id',
	'ref',
	'onInteractOutside',
	'onEscapeKeydown',
	'forceMount',
	'style'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Link_preview_content_static($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		onInteractOutside = $.prop($$props, 'onInteractOutside', 3, noop),
		onEscapeKeydown = $.prop($$props, 'onEscapeKeydown', 3, noop),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const contentState = LinkPreviewContentState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		onInteractOutside: boxWith(() => onInteractOutside()),
		onEscapeKeydown: boxWith(() => onEscapeKeydown())
	});

	const mergedProps = $.derived(() => mergeProps(restProps, contentState.props));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			{
				const popper = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;
					const finalProps = $.derived(() => mergeProps(props(), { style: getFloatingContentCSSVars("link-preview") }, { style: $$props.style }));
					var fragment_2 = root_1();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => ({ props: $.get(finalProps), ...contentState.snippetProps }));

								$.snippet(node_2, () => $$props.child, () => $.get($0));
							}

							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							var div = root();

							$.attribute_effect(div, () => ({ ...$.get(finalProps) }));

							var node_3 = $.child(div);

							$.snippet(node_3, () => $$props.children ?? $.noop);
							$.reset(div);
							$.append($$anchor, div);
						};

						$.if(node_1, ($$render) => {
							if ($$props.child) $$render(consequent); else $$render(alternate, -1);
						});
					}

					var node_4 = $.sibling(node_1, 2);

					Mounted(node_4, {
						get mounted() {
							return contentState.root.contentMounted;
						},

						set mounted($$value) {
							contentState.root.contentMounted = $$value;
						}
					});

					$.append($$anchor, fragment_2);
				};

				PopperLayerForceMount($$anchor, $.spread_props(() => $.get(mergedProps), () => contentState.popperProps, {
					get ref() {
						return contentState.opts.ref;
					},

					get enabled() {
						return contentState.root.opts.open.current;
					},
					isStatic: true,
					get id() {
						return id();
					},
					trapFocus: false,
					loop: false,
					preventScroll: false,
					forceMount: true,
					get shouldRender() {
						return contentState.shouldRender;
					},
					popper,
					$$slots: { popper: true }
				}));
			}
		};

		var consequent_3 = ($$anchor) => {
			{
				const popper = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;
					const finalProps = $.derived(() => mergeProps(props(), { style: getFloatingContentCSSVars("link-preview") }, { style: $$props.style }));
					var fragment_5 = $.comment();
					var node_5 = $.first_child(fragment_5);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_6 = $.comment();
							var node_6 = $.first_child(fragment_6);

							{
								let $0 = $.derived(() => ({ props: $.get(finalProps), ...contentState.snippetProps }));

								$.snippet(node_6, () => $$props.child, () => $.get($0));
							}

							$.append($$anchor, fragment_6);
						};

						var alternate_1 = ($$anchor) => {
							var div_1 = root();

							$.attribute_effect(div_1, () => ({ ...$.get(finalProps) }));

							var node_7 = $.child(div_1);

							$.snippet(node_7, () => $$props.children ?? $.noop);
							$.reset(div_1);
							$.append($$anchor, div_1);
						};

						$.if(node_5, ($$render) => {
							if ($$props.child) $$render(consequent_2); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_5);
				};

				PopperLayer($$anchor, $.spread_props(() => $.get(mergedProps), () => contentState.popperProps, {
					get ref() {
						return contentState.opts.ref;
					},

					get open() {
						return contentState.root.opts.open.current;
					},
					isStatic: true,
					get id() {
						return id();
					},
					trapFocus: false,
					loop: false,
					preventScroll: false,
					forceMount: false,
					get shouldRender() {
						return contentState.shouldRender;
					},
					popper,
					$$slots: { popper: true }
				}));
			}
		};

		$.if(node, ($$render) => {
			if (forceMount()) $$render(consequent_1); else if (!forceMount()) $$render(consequent_3, 1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}