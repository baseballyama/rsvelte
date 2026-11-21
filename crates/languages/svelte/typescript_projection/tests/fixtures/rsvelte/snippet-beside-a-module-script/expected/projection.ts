;

	import { tick } from 'svelte';
const row = () => {
  async () => {
    {
      svelteHTML.createElement("b", {});
      tick;
    }
  };
  return __rsvelte_snippet_return;
};

	export const row = 1;

;

function $$render() {
  async () => {
    __rsvelte_ensure_snippet(row());
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, { [evt: string]: CustomEvent<any> }, {}, string>} */ (__rsvelte_export_isomorphic))()({});
}
export const SnippetBesideAModuleScript__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof SnippetBesideAModuleScript__SvelteComponent_>} SnippetBesideAModuleScript__SvelteComponent_ */
export default SnippetBesideAModuleScript__SvelteComponent_;
