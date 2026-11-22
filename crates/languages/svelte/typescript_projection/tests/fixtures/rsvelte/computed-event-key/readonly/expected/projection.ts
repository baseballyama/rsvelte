;
import { createEventDispatcher } from "svelte";;
type $$ComponentProps = { a: number };

;

function $$render() {
  
	
	let { a }: $$ComponentProps = $props();
	const GO = 'go';
	const d = createEventDispatcher<{ readonly [GO]: number }>();

;

  return __rsvelte_export_isomorphic<$$ComponentProps, {}, "">()(__rsvelte_any_event({
    ...(__sveltets_2_toEventTypings<{ readonly [GO]: number }>()),
  }), {});
}
const Readonly__SvelteComponent_ = $$render();
type Readonly__SvelteComponent_ = InstanceType<typeof Readonly__SvelteComponent_>;
export default Readonly__SvelteComponent_;
