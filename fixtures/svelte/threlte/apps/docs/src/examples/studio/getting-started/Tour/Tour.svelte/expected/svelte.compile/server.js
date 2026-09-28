import * as $ from 'svelte/internal/server';
import { onMount, tick } from 'svelte';
import Portal from 'svelte-portal';
import { TourManager } from './Tour/TourManager.svelte';

export default function Tour($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const tourManager = new TourManager();

		onMount(async () => {
			await tick();
			tourManager.startTour();
		});

		const instructionsPlacement = $.derived(() => tourManager.instructionsManager.currentInstructions?.style?.subtitle?.placement);

		Portal($$renderer, {
			target: '#tour-target',
			children: ($$renderer) => {
				$$renderer.push(`<div class="contents"><div class="absolute top-0 left-0 z-10000 h-full w-full"><svg class="pointer-events-none" width="100%" height="100%" style="opacity: 0;"><mask id="myMask"><rect x="0" y="0" width="100%" height="100%" fill="white"></rect><rect x="0" y="0" rx="999" ry="999" width="100" height="100" fill="black"></rect></mask><rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#myMask)"></rect><rect x="0" y="0" rx="999" ry="999" width="100" height="100" stroke="rgba(255, 255, 255, 0.8)" stroke-width="2px" fill="transparent"></rect></svg></div> `);

				if (tourManager.instructionsManager.isToolTip) {
					$$renderer.push(`<!--[0--><div class="pointer-events-none absolute top-0 left-0 z-10000 w-max max-w-96 select-none">`);

					if (tourManager.instructionsManager.currentInstructions) {
						$$renderer.push(`<!--[0--><div class="pointer-events-auto rounded-md bg-white px-3 py-2 text-black shadow-2xl">`);

						if (tourManager.instructionsManager.currentInstructions.content.component) {
							$$renderer.push('<!--[-->');

							tourManager.instructionsManager.currentInstructions.content.component($$renderer, $.spread_props([
								tourManager.instructionsManager.currentInstructions.content.props
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div> <div class="absolute h-2 w-2 rotate-45 bg-white"></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx([
						'pointer-events-none absolute z-10000 flex w-full items-center justify-center select-none',
						instructionsPlacement() === 'bottom' || !instructionsPlacement() ? 'bottom-2' : 'top-1/2 -translate-y-1/2'
					]))}>`);

					if (tourManager.instructionsManager.currentInstructions) {
						$$renderer.push(`<!--[0--><div class="pointer-events-auto max-w-[60%] rounded-md bg-white px-3 py-2 text-black">`);

						if (tourManager.instructionsManager.currentInstructions.content.component) {
							$$renderer.push('<!--[-->');

							tourManager.instructionsManager.currentInstructions.content.component($$renderer, $.spread_props([
								tourManager.instructionsManager.currentInstructions.content.props
							]));

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--> <div class="pointer-events-auto absolute right-4 bottom-4 z-10001 rounded-md bg-white px-1 py-0.5 text-sm text-neutral-600">`);

				if (tourManager.tourStarted) {
					$$renderer.push(`<!--[0--><button>Skip Tour →</button>`);
				} else {
					$$renderer.push(`<!--[-1--><button>Start Tour</button>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			},
			$$slots: { default: true }
		});
	});
}