;
import { createEventDispatcher } from "svelte";;
type $$ComponentProps = { a: number };

;

function $$render() {
  
	
	let { a }: $$ComponentProps = $props();
	let GO = 'go';
	const d = createEventDispatcher<{ [GO]: number }>();

;

  return __rsvelte_export_isomorphic<$$ComponentProps, {}, "">()(__rsvelte_any_event({
    ...(__sveltets_2_toEventTypings<{ [GO]: number }>()),
  }), {});
}
const Let__SvelteComponent_ = $$render();
type Let__SvelteComponent_ = InstanceType<typeof Let__SvelteComponent_>;
export default Let__SvelteComponent_;
