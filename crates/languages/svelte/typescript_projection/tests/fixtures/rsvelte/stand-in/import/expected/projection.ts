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
export default __rsvelte_export_component<__rsvelte_no_props, {}, "">();
