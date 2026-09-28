import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Dialog from "$lib/dialog/Dialog.svelte";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { sineIn } from "svelte/easing";
import { fade } from "svelte/transition";
import { modal as modalStyle } from "./theme";
import { untrack } from "svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'header',
	'footer',
	'title',
	'open',
	'permanent',
	'dismissable',
	'closeBtnClass',
	'headerClass',
	'bodyClass',
	'footerClass',
	'size',
	'placement',
	'class',
	'classes',
	'transitionParams',
	'transition',
	'fullscreen'
]);

var root = $.from_html(`<h3> </h3> <!>`, 1);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <div><!></div> <!>`, 1);

export default function Modal($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		permanent = $.prop($$props, 'permanent', 3, false),
		dismissable = $.prop($$props, 'dismissable', 3, true),
		size = $.prop($$props, 'size', 3, "md"),
		transition = $.prop($$props, 'transition', 3, fade),
		fullscreen = $.prop($$props, 'fullscreen', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	warnThemeDeprecation(
		"Modal",
		untrack(() => ({
			headerClass: $$props.headerClass,
			bodyClass: $$props.bodyClass,
			footerClass: $$props.footerClass,
			closeBtnClass: $$props.closeBtnClass
		})),
		{
			bodyClass: "body",
			headerClass: "header",
			footerClass: "footer",
			closeBtnClass: "close"
		}
	);

	const styling = $.derived(() => $$props.classes ?? {
		header: $$props.headerClass,
		body: $$props.bodyClass,
		footer: $$props.footerClass,
		close: $$props.closeBtnClass
	});

	const theme = $.derived(() => getTheme("modal"));
	const paramsDefault = { duration: 100, easing: sineIn };
	const paramsOptions = $.derived(() => $$props.transitionParams ?? paramsDefault);

	const $$d = $.derived(() => modalStyle({ placement: $$props.placement, size: size() })),
		base = $.derived(() => $.get($$d).base),
		headerCls = $.derived(() => $.get($$d).header),
		footerCls = $.derived(() => $.get($$d).footer),
		body = $.derived(() => $.get($$d).body);

	{
		let $0 = $.derived(() => dismissable() && !$$props.title && !permanent());

		let $1 = $.derived(() => $.get(base)({
			fullscreen: fullscreen(),
			class: clsx($.get(theme)?.base, $$props.class)
		}));

		Dialog($$anchor, $.spread_props(
			{
				get transition() {
					return transition();
				},

				get dismissable() {
					return $.get($0);
				},

				get transitionParams() {
					return $.get(paramsOptions);
				},

				get classes() {
					return $$props.classes;
				},

				get permanent() {
					return permanent();
				}
			},
			() => restProps,
			{
				get class() {
					return $.get($1);
				},

				get open() {
					return open();
				},

				set open($$value) {
					open($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_2();
					var node = $.first_child(fragment_1);

					{
						var consequent_3 = ($$anchor) => {
							var div = root_1();
							var node_1 = $.child(div);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_2 = root();
									var h3 = $.first_child(fragment_2);
									var text = $.only_child(h3, true);
									var node_2 = $.sibling(h3, 2);

									{
										var consequent = ($$anchor) => {
											{
												let $0 = $.derived(() => clsx($.get(styling).close));

												CloseButton($$anchor, {
													type: 'submit',
													formnovalidate: true,
													get class() {
														return $.get($0);
													}
												});
											}
										};

										$.if(node_2, ($$render) => {
											if (dismissable() && !permanent()) $$render(consequent);
										});
									}

									$.template_effect(() => $.set_text(text, $$props.title));
									$.append($$anchor, fragment_2);
								};

								var consequent_2 = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.snippet(node_3, () => $$props.header);
									$.append($$anchor, fragment_4);
								};

								$.if(node_1, ($$render) => {
									if ($$props.title) $$render(consequent_1); else if ($$props.header) $$render(consequent_2, 1);
								});
							}

							$.reset(div);

							$.template_effect(($0) => $.set_class(div, 1, $0), [
								() => $.clsx($.get(headerCls)({ class: clsx($.get(theme)?.header, $.get(styling).header) }))
							]);

							$.append($$anchor, div);
						};

						$.if(node, ($$render) => {
							if ($$props.title || $$props.header) $$render(consequent_3);
						});
					}

					var div_1 = $.sibling(node, 2);
					var node_4 = $.child(div_1);

					$.snippet(node_4, () => $$props.children ?? $.noop);
					$.reset(div_1);

					var node_5 = $.sibling(div_1, 2);

					{
						var consequent_4 = ($$anchor) => {
							var div_2 = root_1();
							var node_6 = $.child(div_2);

							$.snippet(node_6, () => $$props.footer);
							$.reset(div_2);

							$.template_effect(($0) => $.set_class(div_2, 1, $0), [
								() => $.clsx($.get(footerCls)({ class: clsx($.get(theme)?.footer, $.get(styling).footer) }))
							]);

							$.append($$anchor, div_2);
						};

						$.if(node_5, ($$render) => {
							if ($$props.footer) $$render(consequent_4);
						});
					}

					$.template_effect(($0) => $.set_class(div_1, 1, $0), [
						() => $.clsx($.get(body)({ class: clsx($.get(theme)?.body, $.get(styling).body) }))
					]);

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}