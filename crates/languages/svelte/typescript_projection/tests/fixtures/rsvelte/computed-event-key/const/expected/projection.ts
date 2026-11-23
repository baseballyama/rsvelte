;
import { createEventDispatcher } from "svelte";;
type $$ComponentProps = { a: number };

;

function $$render() {
  
	
	let { a }: $$ComponentProps = $props();
	const GO = 'go';
	const d = createEventDispatcher<{ [GO]: number }>();

;

  return __rsvelte_export_isomorphic<$$ComponentProps, {}, "">()(__rsvelte_any_event({
    ...(__sveltets_2_toEventTypings<{ [GO]: number }>()),
  }), {});
}
const Const__SvelteComponent_ = $$render();
type Const__SvelteComponent_ = InstanceType<typeof Const__SvelteComponent_>;
export default Const__SvelteComponent_;
