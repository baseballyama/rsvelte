import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { browser } from "$app/environment";
import { Button } from "$lib/components/ui/button/index.js";
import { onMount } from "svelte";
import X from "@lucide/svelte/icons/x";

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<div><div class="relative flex items-center justify-between gap-2 pr-2"><span> </span> <!></div> <p class="text-muted-foreground text-sm"> </p> <!></div>`);

export default function SiteBanner($$anchor, $$props) {
	$.push($$props, true);

	let visible = $.state(false);
	const storageKey = $.derived(() => `announcement:dismissed:${$$props.announcement.title}:${$$props.announcement.message}:${$$props.announcement.type}`);

	const typeClasses = $.derived(() => {
		switch ($$props.announcement.type) {
			case "WARNING":
				return "degraded";

			case "ERROR":
				return "down";

			case "INFO":

			default:
				return "muted";
		}
	});

	function applyVisibilityFromStorage() {
		if (!browser) return;

		if (!$$props.announcement.cancellable) {
			$.set(visible, true);

			return;
		}

		const raw = localStorage.getItem($.get(storageKey));

		if (!raw) {
			$.set(visible, true);

			return;
		}

		const dismissedAt = Number(raw);

		if (!Number.isFinite(dismissedAt)) {
			$.set(visible, true);

			return;
		}

		if ($$props.announcement.reshowAfterInHours == null) {
			$.set(visible, false);

			return;
		}

		const elapsedMs = Date.now() - dismissedAt;
		const shouldReshow = elapsedMs >= $$props.announcement.reshowAfterInHours * 60 * 60 * 1000;

		$.set(visible, shouldReshow);

		if (shouldReshow) {
			localStorage.removeItem($.get(storageKey));
		}
	}

	function dismiss() {
		if (!browser || !$$props.announcement.cancellable) return;

		localStorage.setItem($.get(storageKey), String(Date.now()));
		$.set(visible, false);
	}

	onMount(() => {
		applyVisibilityFromStorage();
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_2 = ($$anchor) => {
			var div = root_1();
			var div_1 = $.child(div);
			var span = $.child(div_1);
			var text = $.only_child(span, true);
			var node_1 = $.sibling(span, 2);

			{
				var consequent = ($$anchor) => {
					var div_2 = root();
					var node_2 = $.child(div_2);

					{
						let $0 = $.derived(() => $$props.announcement.ctaURL.startsWith("http") ? "_blank" : undefined);

						Button(node_2, {
							variant: 'link',
							class: 'h-8 px-0 text-xs underline',
							size: 'sm',
							get href() {
								return $$props.announcement.ctaURL;
							},

							get target() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text();

								$.template_effect(() => $.set_text(text_1, $$props.announcement.ctaText));
								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if ($$props.announcement.ctaURL && $$props.announcement.ctaText) $$render(consequent);
				});
			}

			$.reset(div_1);

			var p = $.sibling(div_1, 2);
			var text_2 = $.only_child(p, true);
			var node_3 = $.sibling(p, 2);

			{
				var consequent_1 = ($$anchor) => {
					Button($$anchor, {
						variant: 'outline',
						get class() {
							return `rounded-btn text-muted-foreground bg-background! border-${$.get(typeClasses) ?? ''} absolute -top-2.5 -right-2.5 `;
						},
						size: 'icon-sm',
						onclick: dismiss,
						children: ($$anchor, $$slotProps) => {
							X($$anchor, { class: 'size-3' });
						},
						$$slots: { default: true }
					});
				};

				$.if(node_3, ($$render) => {
					if ($$props.announcement.cancellable) $$render(consequent_1);
				});
			}

			$.reset(div);

			$.template_effect(() => {
				$.set_class(div, 1, `bg-background relative flex w-full flex-col gap-0 rounded-3xl border border-${$.get(typeClasses) ?? ''} px-4 pt-2 pb-4`);
				$.set_class(span, 1, `text-foreground text-base text-${$.get(typeClasses) ?? ''} font-medium`);
				$.set_text(text, $$props.announcement.title);
				$.set_text(text_2, $$props.announcement.message);
			});

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent_2);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}