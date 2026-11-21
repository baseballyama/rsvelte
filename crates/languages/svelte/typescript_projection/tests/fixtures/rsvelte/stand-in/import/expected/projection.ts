;
import Exports, { answer, double, type Answer } from './exports.svelte';;

;

function $$render() {
  
	

	const doubled: Answer = double(answer);
	const label: string = answer;

;

  async () => {
    {
      __rsvelte_component(Exports)(__rsvelte_internals(), {});
    }
    {
      svelteHTML.createElement("p", {});
      doubled;
      label;
    }
  };
  return __rsvelte_export_isomorphic<globalThis.Record<string, never>, { [evt: string]: CustomEvent<any> }, {}, string>()({});
}
const Import__SvelteComponent_ = $$render();
type Import__SvelteComponent_ = InstanceType<typeof Import__SvelteComponent_>;
export default Import__SvelteComponent_;
