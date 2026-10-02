import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { MenuOpenEvent, MenuContentState } from "../menu.svelte.js";
import { SUB_CLOSE_KEYS } from "../utils.js";
import { createId } from "$lib/internal/create-id.js";
import PopperLayer from "$lib/bits/utilities/popper-layer/popper-layer.svelte";
import { noop } from "$lib/internal/noop.js";
import { isHTMLElement } from "$lib/internal/is.js";
import { getFloatingContentCSSVars } from "$lib/internal/floating-svelte/floating-utils.svelte.js";
import PopperLayerForceMount from "$lib/bits/utilities/popper-layer/popper-layer-force-mount.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'ref',
	'children',
	'child',
	'loop',
	'onInteractOutside',
	'forceMount',
	'onEscapeKeydown',
	'interactOutsideBehavior',
	'escapeKeydownBehavior',
	'onOpenAutoFocus',
	'onCloseAutoFocus',
	'onFocusOutside',
	'side',
	'trapFocus',
	'style'
]);

var root = $.from_html(`<div><div><!></div></div>`);

export default function Menu_sub_content($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		loop = $.prop($$props, 'loop', 3, true),
		onInteractOutside = $.prop($$props, 'onInteractOutside', 3, noop),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		onEscapeKeydown = $.prop($$props, 'onEscapeKeydown', 3, noop),
		interactOutsideBehavior = $.prop($$props, 'interactOutsideBehavior', 3, "defer-otherwise-close"),
		escapeKeydownBehavior = $.prop($$props, 'escapeKeydownBehavior', 3, "defer-otherwise-close"),
		onOpenAutoFocusProp = $.prop($$props, 'onOpenAutoFocus', 3, noop),
		onCloseAutoFocusProp = $.prop($$props, 'onCloseAutoFocus', 3, noop),
		onFocusOutside = $.prop($$props, 'onFocusOutside', 3, noop),
		side = $.prop($$props, 'side', 3, "right"),
		trapFocus = $.prop($$props, 'trapFocus', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const subContentState = MenuContentState.create({
		id: boxWith(() => id()),
		loop: boxWith(() => loop()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		isSub: true,
		onCloseAutoFocus: boxWith(() => handleCloseAutoFocus)
	});

	function onkeydown(e) {
		const isKeyDownInside = e.currentTarget.contains(e.target);
		const isCloseKey = SUB_CLOSE_KEYS[subContentState.parentMenu.root.opts.dir.current].includes(e.key);

		if (isKeyDownInside && isCloseKey) {
			subContentState.parentMenu.onClose();

			const triggerNode = subContentState.parentMenu.triggerNode;

			triggerNode?.focus();
			e.preventDefault();
		}
	}

	const dataAttr = $.derived(() => subContentState.parentMenu.root.getBitsAttr("sub-content"));
	const mergedProps = $.derived(() => mergeProps(restProps, subContentState.props, { side: side(), onkeydown, [$.get(dataAttr)]: "" }));

	function handleOpenAutoFocus(e) {
		onOpenAutoFocusProp()(e);

		if (e.defaultPrevented) return;

		e.preventDefault();

		if (subContentState.parentMenu.root.isUsingKeyboard && subContentState.parentMenu.contentNode) {
			MenuOpenEvent.dispatch(subContentState.parentMenu.contentNode);
		}
	}

	function handleCloseAutoFocus(e) {
		onCloseAutoFocusProp()(e);

		if (e.defaultPrevented) return;

		e.preventDefault();
	}

	function handleInteractOutside(e) {
		onInteractOutside()(e);

		if (e.defaultPrevented) return;

		subContentState.parentMenu.onClose();
	}

	function handleEscapeKeydown(e) {
		onEscapeKeydown()(e);

		if (e.defaultPrevented) return;

		subContentState.parentMenu.onClose();
	}

	function handleOnFocusOutside(e) {
		onFocusOutside()(e);

		if (e.defaultPrevented) return;
		if (!isHTMLElement(e.target)) return;
		if (e.target.id === subContentState.parentMenu.triggerNode?.id) return;

		const parentContent = subContentState.parentMenu.parentMenu?.contentNode;

		if (parentContent?.contains(e.target)) {
			subContentState.parentMenu.onClose();
			e.preventDefault();

			return;
		}

		// focus moved to a descendant sub-content rendered in a portal
		const subContentSelector = `[${subContentState.parentMenu.root.getBitsAttr("sub-content")}]`;

		if (e.target.closest(subContentSelector)) {
			e.preventDefault();

			return;
		}

		subContentState.parentMenu.onClose();
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			{
				const popper = ($$anchor, $$arg0) => {
					let props = () => ($$arg0?.()).props;
					let wrapperProps = () => ($$arg0?.()).wrapperProps;
					const finalProps = $.derived(() => mergeProps(props(), $.get(mergedProps), { style: getFloatingContentCSSVars("menu") }, { style: $$props.style }));
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_2 = $.first_child(fragment_3);

							{
								let $0 = $.derived(() => ({
									props: $.get(finalProps),
									wrapperProps: wrapperProps(),
									...subContentState.snippetProps
								}));

								$.snippet(node_2, () => $$props.child, () => $.get($0));
							}

							$.append($$anchor, fragment_3);
						};

						var alternate = ($$anchor) => {
							var div = root();

							$.attribute_effect(div, () => ({ ...wrapperProps() }));

							var div_1 = $.child(div);

							$.attribute_effect(div_1, () => ({ ...$.get(finalProps) }));

							var node_3 = $.child(div_1);

							$.snippet(node_3, () => $$props.children ?? $.noop);
							$.reset(div_1);
							$.reset(div);
							$.append($$anchor, div);
						};

						$.if(node_1, ($$render) => {
							if ($$props.child) $$render(consequent); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				PopperLayerForceMount($$anchor, $.spread_props(() => $.get(mergedProps), {
					get ref() {
						return subContentState.opts.ref;
					},

					get interactOutsideBehavior() {
						return interactOutsideBehavior();
					},

					get escapeKeydownBehavior() {
						return escapeKeydownBehavior();
					},
					onOpenAutoFocus: handleOpenAutoFocus,
					get enabled() {
						return subContentState.parentMenu.opts.open.current;
					},
					onInteractOutside: handleInteractOutside,
					onEscapeKeydown: handleEscapeKeydown,
					onFocusOutside: handleOnFocusOutside,
					preventScroll: false,
					get loop() {
						return loop();
					},

					get trapFocus() {
						return trapFocus();
					},

					get shouldRender() {
						return subContentState.shouldRender;
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
					let wrapperProps = () => ($$arg0?.()).wrapperProps;
					const finalProps = $.derived(() => mergeProps(props(), $.get(mergedProps), { style: getFloatingContentCSSVars("menu") }, { style: $$props.style }));
					var fragment_5 = $.comment();
					var node_4 = $.first_child(fragment_5);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_6 = $.comment();
							var node_5 = $.first_child(fragment_6);

							{
								let $0 = $.derived(() => ({
									props: $.get(finalProps),
									wrapperProps: wrapperProps(),
									...subContentState.snippetProps
								}));

								$.snippet(node_5, () => $$props.child, () => $.get($0));
							}

							$.append($$anchor, fragment_6);
						};

						var alternate_1 = ($$anchor) => {
							var div_2 = root();

							$.attribute_effect(div_2, () => ({ ...wrapperProps() }));

							var div_3 = $.child(div_2);

							$.attribute_effect(div_3, () => ({ ...$.get(finalProps) }));

							var node_6 = $.child(div_3);

							$.snippet(node_6, () => $$props.children ?? $.noop);
							$.reset(div_3);
							$.reset(div_2);
							$.append($$anchor, div_2);
						};

						$.if(node_4, ($$render) => {
							if ($$props.child) $$render(consequent_2); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_5);
				};

				PopperLayer($$anchor, $.spread_props(() => $.get(mergedProps), {
					get ref() {
						return subContentState.opts.ref;
					},

					get interactOutsideBehavior() {
						return interactOutsideBehavior();
					},

					get escapeKeydownBehavior() {
						return escapeKeydownBehavior();
					},
					onCloseAutoFocus: handleCloseAutoFocus,
					onOpenAutoFocus: handleOpenAutoFocus,
					get open() {
						return subContentState.parentMenu.opts.open.current;
					},
					onInteractOutside: handleInteractOutside,
					onEscapeKeydown: handleEscapeKeydown,
					onFocusOutside: handleOnFocusOutside,
					preventScroll: false,
					get loop() {
						return loop();
					},

					get trapFocus() {
						return trapFocus();
					},

					get shouldRender() {
						return subContentState.shouldRender;
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