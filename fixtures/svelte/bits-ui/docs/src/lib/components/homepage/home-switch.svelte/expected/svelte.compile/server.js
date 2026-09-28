import * as $ from 'svelte/internal/server';
import { Switch } from "bits-ui";
import Play from "phosphor-svelte/lib/Play";
import Pause from "phosphor-svelte/lib/Pause";

export default function Home_switch($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { checked = true, ref = null, $$slots, $$events, ...restProps } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex items-center space-x-3">`);

			if (Switch.Root) {
				$$renderer.push('<!--[-->');

				Switch.Root($$renderer, $.spread_props([
					{
						id: 'play_btn',
						name: 'play',
						'aria-label': 'Play',
						class: 'focus-visible:ring-foreground focus-visible:ring-offset-background data-[state=checked]:bg-foreground data-[state=unchecked]:bg-dark-10 data-[state=unchecked]:shadow-mini-inset dark:data-[state=checked]:bg-foreground focus-visible:outline-hidden peer inline-flex h-7 min-h-7 w-11 shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 lg:h-9 lg:min-h-9 lg:w-[62px]  dark:shadow-inner dark:data-[state=unchecked]:bg-[rgba(0,0,0,0.17)]'
					},
					restProps,
					{
						get ref() {
							return ref;
						},

						set ref($$value) {
							ref = $$value;
							$$settled = false;
						},

						get checked() {
							return checked;
						},

						set checked($$value) {
							checked = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Switch.Thumb) {
								$$renderer.push('<!--[-->');

								Switch.Thumb($$renderer, {
									class: 'bg-background data-[state=unchecked]:shadow-mini dark:border-background/30 group pointer-events-none flex size-[22px] shrink-0 items-center justify-center rounded-full transition-transform data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-0 lg:size-[30px] lg:data-[state=checked]:translate-x-[26px] dark:border dark:border-none dark:bg-white dark:shadow-[0px_1.3px_0px_1.3px_rgba(0,0,0,0.04)] dark:data-[state=unchecked]:border',
									children: ($$renderer) => {
										Play($$renderer, {
											class: 'size-2.5 group-data-[state=checked]:hidden lg:size-4 dark:text-[#171717]',
											weight: 'fill',
											'aria-label': 'Play'
										});

										$$renderer.push(`<!----> `);

										Pause($$renderer, {
											class: 'size-2.5 group-data-[state=unchecked]:hidden lg:size-4 dark:text-[#171717]',
											weight: 'fill',
											'aria-label': 'Pause'
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { checked, ref });
	});
}