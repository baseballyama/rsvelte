;
import { createEventDispatcher } from "svelte";;
interface $$Events { [GO]: CustomEvent<number> };
type $$ComponentProps = { a: number };

;

function $$render() {
  
	
	let { a }: $$ComponentProps = $props();
	const GO = 'go';
	

;

  return __rsvelte_export_isomorphic<$$ComponentProps, {}, "">()(__rsvelte_value<$$Events>(), {});
}
const Events__SvelteComponent_ = $$render();
type Events__SvelteComponent_ = InstanceType<typeof Events__SvelteComponent_>;
export default Events__SvelteComponent_;
