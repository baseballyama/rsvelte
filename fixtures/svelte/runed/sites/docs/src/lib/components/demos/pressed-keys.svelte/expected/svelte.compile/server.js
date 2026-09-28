import * as $ from 'svelte/internal/server';
import { PressedKeys, watch } from "runed";
import { fade, scale } from "svelte/transition";
import { cn, DemoContainer } from "@svecodocs/kit";
import RunedIcon from "$lib/components/logos/runed-icon.svelte";

export default function Pressed_keys($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const keys = new PressedKeys();
		const toPress = ("Runed").split("");
		const allPressed = $.derived(() => keys.has(...toPress));
		let guessedCorrectly = false;
		let triedInputting = false;

		watch(() => keys.all, () => {
			triedInputting = false;
		});

		// eslint-disable-next-line svelte/no-inspect
		;;

		DemoContainer($$renderer, {
			class: 'flex flex-col gap-4',
			children: ($$renderer) => {
				$$renderer.push(`<div${$.attr_class(`relative mx-auto flex w-min items-center justify-center gap-2 transition-all duration-300 ${allPressed() ? 'translate-x-[1.625rem]' : ''}`)}>`);

				if (allPressed()) {
					$$renderer.push(`<!--[0--><div class="bg-background dark:bg-muted absolute left-0 top-1/2 -translate-y-1/2 translate-x-[calc(-100%-0.5rem)]">`);
					RunedIcon($$renderer, { class: 'size-12' });
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <!--[-->`);

				const each_array = $.ensure_array_like(toPress);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let key = each_array[i];

					$$renderer.push(`<div${$.attr_class($.clsx(cn("border-input bg-background dark:bg-muted ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", "grid size-12 place-items-center rounded-lg border-2 transition-all duration-200", allPressed() && "border-brand")))}>`);

					if (keys.has(key)) {
						$$renderer.push(`<!--[0--><span class="text-foreground duration-250 text-xl font-bold transition-all">${$.escape(key)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--></div> <p class="text-center">${$.escape(guessedCorrectly ? "You did it! 🎉" : "Try and guess the password 👀")}</p> `);

				if (!guessedCorrectly && triedInputting) {
					$$renderer.push(`<!--[0--><p class="text-muted-foreground absolute bottom-2 right-2 mb-0 text-center text-sm">Press any key to start, no need to select anything</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}