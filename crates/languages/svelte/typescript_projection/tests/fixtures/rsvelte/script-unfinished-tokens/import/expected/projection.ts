;
import Component from './component.svelte';;

;

function $$render() {
  
	
	let component: ReturnType<typeof Component> | undefined = $state();
	const named: string = component!.api();

;

  async () => {
    {
      component = __rsvelte_bind_this(__rsvelte_component(Component))(__rsvelte_internals(), {
        "n": "no",
      });
    }
  };
  return __rsvelte_export_component<globalThis.Record<string, never>, {}, "">();
}
const Import__SvelteComponent_ = $$render();
type Import__SvelteComponent_ = ReturnType<typeof Import__SvelteComponent_>;
export default Import__SvelteComponent_;
