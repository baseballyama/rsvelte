;
import { createEventDispatcher } from "svelte";;
type $$ComponentProps = { a: number };

;

function $$render() {
  
	
	let { a }: $$ComponentProps = $props();
	const GO = 'go';
	const d = createEventDispatcher<{ /* [ */ [ /* [ */ GO /* ] */ ]: number }>();

;

  return __rsvelte_export_isomorphic<$$ComponentProps, {}, "">()(__rsvelte_any_event({
    ...(__sveltets_2_toEventTypings<{ /* [ */ [ /* [ */ GO /* ] */ ]: number }>()),
  }), {});
}
const Comment__SvelteComponent_ = $$render();
type Comment__SvelteComponent_ = InstanceType<typeof Comment__SvelteComponent_>;
export default Comment__SvelteComponent_;
