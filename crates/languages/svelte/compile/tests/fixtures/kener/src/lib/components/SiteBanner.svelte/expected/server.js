import * as $ from 'svelte/internal/server';
import { browser } from "$app/environment";
import { Button } from "$lib/components/ui/button/index.js";
import { onMount } from "svelte";
import X from "@lucide/svelte/icons/x";

export default function SiteBanner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { announcement } = $$props;
		let visible = false;
		const storageKey = $.derived(() => `announcement:dismissed:${announcement.title}:${announcement.message}:${announcement.type}`);

		const typeClasses = $.derived(() => {
			switch (announcement.type) {
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

			if (!announcement.cancellable) {
				visible = true;

				return;
			}

			const raw = localStorage.getItem(storageKey());

			if (!raw) {
				visible = true;

				return;
			}

			const dismissedAt = Number(raw);

			if (!Number.isFinite(dismissedAt)) {
				visible = true;

				return;
			}

			if (announcement.reshowAfterInHours == null) {
				visible = false;

				return;
			}

			const elapsedMs = Date.now() - dismissedAt;
			const shouldReshow = elapsedMs >= announcement.reshowAfterInHours * 60 * 60 * 1000;

			visible = shouldReshow;

			if (shouldReshow) {
				localStorage.removeItem(storageKey());
			}
		}

		function dismiss() {
			if (!browser || !announcement.cancellable) return;

			localStorage.setItem(storageKey(), String(Date.now()));
			visible = false;
		}

		onMount(() => {
			applyVisibilityFromStorage();
		});

		if (visible) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`bg-background relative flex w-full flex-col gap-0 rounded-3xl border border-${$.stringify(typeClasses())} px-4 pt-2 pb-4`)}><div class="relative flex items-center justify-between gap-2 pr-2"><span${$.attr_class(`text-foreground text-base text-${$.stringify(typeClasses())} font-medium`)}>${$.escape(announcement.title)}</span> `);

			if (announcement.ctaURL && announcement.ctaText) {
				$$renderer.push(`<!--[0--><div>`);

				Button($$renderer, {
					variant: 'link',
					class: 'h-8 px-0 text-xs underline',
					size: 'sm',
					href: announcement.ctaURL,
					target: announcement.ctaURL.startsWith("http") ? "_blank" : undefined,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(announcement.ctaText)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <p class="text-muted-foreground text-sm">${$.escape(announcement.message)}</p> `);

			if (announcement.cancellable) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					variant: 'outline',
					class: `rounded-btn text-muted-foreground bg-background! border-${$.stringify(typeClasses())} absolute -top-2.5 -right-2.5 `,
					size: 'icon-sm',
					onclick: dismiss,
					children: ($$renderer) => {
						X($$renderer, { class: 'size-3' });
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}