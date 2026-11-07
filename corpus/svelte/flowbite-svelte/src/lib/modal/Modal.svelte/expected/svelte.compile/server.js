import * as $ from 'svelte/internal/server';
import Dialog from "$lib/dialog/Dialog.svelte";
import CloseButton from "$lib/utils/CloseButton.svelte";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { sineIn } from "svelte/easing";
import { fade } from "svelte/transition";
import { modal as modalStyle } from "./theme";
import { untrack } from "svelte";

export default function Modal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			header,
			footer,
			title,
			open = false,
			permanent = false,
			dismissable = true,
			closeBtnClass,
			headerClass,
			bodyClass,
			footerClass,
			size = "md",
			placement,
			class: className,
			classes,
			transitionParams,
			transition = fade,
			fullscreen = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("Modal", untrack(() => ({ headerClass, bodyClass, footerClass, closeBtnClass })), {
			bodyClass: "body",
			headerClass: "header",
			footerClass: "footer",
			closeBtnClass: "close"
		});

		const styling = $.derived(() => classes ?? {
			header: headerClass,
			body: bodyClass,
			footer: footerClass,
			close: closeBtnClass
		});

		const theme = $.derived(() => getTheme("modal"));
		const paramsDefault = { duration: 100, easing: sineIn };
		const paramsOptions = $.derived(() => transitionParams ?? paramsDefault);

		const $$d = $.derived(() => modalStyle({ placement, size })),
			base = $.derived(() => $$d().base),
			headerCls = $.derived(() => $$d().header),
			footerCls = $.derived(() => $$d().footer),
			body = $.derived(() => $$d().body);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Dialog($$renderer, $.spread_props([
				{
					transition,
					dismissable: dismissable && !title && !permanent,
					transitionParams: paramsOptions(),
					classes,
					permanent
				},
				restProps,
				{
					class: base()({ fullscreen, class: clsx(theme()?.base, className) }),
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (title || header) {
							$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(headerCls()({ class: clsx(theme()?.header, styling().header) })))}>`);

							if (title) {
								$$renderer.push(`<!--[0--><h3>${$.escape(title)}</h3> `);

								if (dismissable && !permanent) {
									$$renderer.push('<!--[0-->');

									CloseButton($$renderer, {
										type: 'submit',
										formnovalidate: true,
										class: clsx(styling().close)
									});
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							} else if (header) {
								$$renderer.push('<!--[1-->');
								header($$renderer);
								$$renderer.push(`<!---->`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <div${$.attr_class($.clsx(body()({ class: clsx(theme()?.body, styling().body) })))}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></div> `);

						if (footer) {
							$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(footerCls()({ class: clsx(theme()?.footer, styling().footer) })))}>`);
							footer($$renderer);
							$$renderer.push(`<!----></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { open });
	});
}