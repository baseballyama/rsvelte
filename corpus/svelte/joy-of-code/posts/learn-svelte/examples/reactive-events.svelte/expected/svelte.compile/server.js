import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { createSubscriber } from 'svelte/reactivity';

export default function Reactive_events($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		class Timeline {
			#timeline = window.gsap.timeline();
			#subscribe;

			constructor(tweens) {
				this.populateTimeline(tweens);

				this.#subscribe = createSubscriber((update) => {
					this.#timeline.eventCallback('onUpdate', update);

					return () => this.#timeline.eventCallback('onUpdate', null);
				});
			}

			populateTimeline(tweens) {
				onMount(() => {
					tweens.forEach(([element, vars]) => {
						this.#timeline.to(element, vars);
					});
				});
			}

			get time() {
				// makes it reactive when read inside an effect
				this.#subscribe();

				return this.#timeline.time();
			}

			set time(v) {
				this.#timeline.seek(v);
			}
		}

		const tl = new Timeline([
			['.box1', { x: 200, duration: 1 }],
			['.box2', { x: 200, duration: 1 }]
		]);

		$$renderer.push(`<div class="container"><div class="box box1 svelte-tpp10s"></div> <div class="box box2 svelte-tpp10s"></div> <label class="svelte-tpp10s"><span>Time:</span> <input${$.attr('value', tl.time)} type="range"${$.attr('min', 0)}${$.attr('max', 2)}${$.attr('step', 0.01)}/></label></div>`);
	});
}