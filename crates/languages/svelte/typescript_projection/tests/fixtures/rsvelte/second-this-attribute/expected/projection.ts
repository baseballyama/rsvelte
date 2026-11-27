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
      new (__rsvelte_component(C))(__rsvelte_internals(), {
        props: {},
      });
    }
  };
  return (/** @type {typeof __rsvelte_export_component<globalThis.Record<string, never>, {}, "">} */ (__rsvelte_export_component))();
}
export const SecondThisAttribute__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SecondThisAttribute__SvelteComponent_>} SecondThisAttribute__SvelteComponent_ */
export default SecondThisAttribute__SvelteComponent_;
