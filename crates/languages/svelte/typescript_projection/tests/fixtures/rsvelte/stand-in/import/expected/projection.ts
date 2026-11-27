;
import Exports, { answer, double, type Answer } from './exports.svelte';;

;

function $$render() {
  
	

	const doubled: Answer = double(answer);
	const label: string = answer;

;

  async () => {
    {
      new (__rsvelte_component(Exports))(__rsvelte_internals(), {
        props: {},
      });
    }
    {
      svelteHTML.createElement("p", {});
      doubled;
      label;
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, {}, string>()(__rsvelte_any_event({}), {});
}
const Import__SvelteComponent_ = $$render();
type Import__SvelteComponent_ = InstanceType<typeof Import__SvelteComponent_>;
export default Import__SvelteComponent_;
