;
import Component from './component.svelte';;

;

function $$render() {
  
	

	let bound = $state<Component<'x'>>();
	bound?.open('y');

;

  async () => {
    {
      bound = new (__rsvelte_bind_this(__rsvelte_component(Component)))(__rsvelte_internals(), {
        props: {
          "value": "x",
        },
      });
    }
  };
  return __rsvelte_export_component<globalThis.Record<string, never>, {}, "">();
}
const Instance__SvelteComponent_ = $$render();
type Instance__SvelteComponent_ = ReturnType<typeof Instance__SvelteComponent_>;
export default Instance__SvelteComponent_;
