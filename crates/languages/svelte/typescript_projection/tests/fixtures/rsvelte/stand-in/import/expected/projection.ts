;

	import Exports, { answer, double, type Answer } from './exports.svelte';

	const doubled: Answer = double(answer);
	const label: string = answer;

;

() => {
  {
    __rsvelte_component(Exports)(__rsvelte_internals(), {});
  }
  {
    svelteHTML.createElement("p", {});
    (doubled);
    (label);
  }
};
const Import__SvelteComponent_ = __rsvelte_export_component<__rsvelte_no_props, {}, "">();
type Import__SvelteComponent_ = ReturnType<typeof Import__SvelteComponent_>;
export default Import__SvelteComponent_;
