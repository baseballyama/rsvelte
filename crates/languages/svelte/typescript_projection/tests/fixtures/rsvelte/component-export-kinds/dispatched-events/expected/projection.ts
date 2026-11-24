;
import { createEventDispatcher } from "svelte";;
type $$ComponentProps = { a: number };

;

function $$render() {
  
	
	const d = createEventDispatcher();
	let { a }: $$ComponentProps = $props();
	d("go", 1);

;

  async () => {
    {
      svelteHTML.createElement("p", {});
      a;
    }
  };
  return __rsvelte_export_isomorphic<$$ComponentProps, {}, "">()(__rsvelte_any_event({
    "go": __sveltets_2_customEvent,
  }), {});
}
const DispatchedEvents__SvelteComponent_ = $$render();
type DispatchedEvents__SvelteComponent_ = InstanceType<typeof DispatchedEvents__SvelteComponent_>;
export default DispatchedEvents__SvelteComponent_;
