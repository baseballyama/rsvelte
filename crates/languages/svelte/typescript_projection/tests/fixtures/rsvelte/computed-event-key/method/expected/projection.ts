;
import { createEventDispatcher } from "svelte";;
type $$ComponentProps = { a: number };

;

function $$render() {
  
	
	let { a }: $$ComponentProps = $props();
	const d = createEventDispatcher<{ [Z](): void; go: number }>();

;

  return __rsvelte_export_isomorphic<$$ComponentProps, {}, "">()(__rsvelte_any_event({
    ...(__sveltets_2_toEventTypings<{ [Z](): void; go: number }>()),
  }), {});
}
const Method__SvelteComponent_ = $$render();
type Method__SvelteComponent_ = InstanceType<typeof Method__SvelteComponent_>;
export default Method__SvelteComponent_;
