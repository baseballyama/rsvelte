;
import C from './C.svelte';;

;

function $$render() {
  
	
	let tag = $state('div');
	let tag2 = $state('span');

;

  async () => {
    {
      svelteHTML.createElement(tag, {});
    }
    {
      __rsvelte_component(C)(__rsvelte_internals(), {});
    }
  };
  return (/** @type {typeof __rsvelte_export_component<__rsvelte_no_props, {}, "">} */ (__rsvelte_export_component))();
}
const SecondThisAttribute__SvelteComponent_ = $$render();
export default /** @type {__rsvelte_javascript_export<typeof SecondThisAttribute__SvelteComponent_>} */ (SecondThisAttribute__SvelteComponent_);
