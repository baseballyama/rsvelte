;
import { createEventDispatcher } from "svelte";;
type $$ComponentProps = { a: number };

;

function $$render() {
  
	
	let { a }: $$ComponentProps = $props();
	const GO = 'go';
	const d = createEventDispatcher<{ [GO]: number }>();

;

  return __rsvelte_export_isomorphic<$$ComponentProps, {
    GO: typeof GO;
  }, "">()(__rsvelte_any_event({
    ...(__sveltets_2_toEventTypings<__rsvelte_dispatcher_events<typeof d>>()),
  }), {});
}
const Export__SvelteComponent_ = $$render();
type Export__SvelteComponent_ = InstanceType<typeof Export__SvelteComponent_>;
export default Export__SvelteComponent_;
