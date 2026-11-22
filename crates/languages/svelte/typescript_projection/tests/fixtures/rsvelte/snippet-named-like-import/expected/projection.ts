;

	const b = 1;

;

import a from './a.js';;

const a = () => {
  async () => {
    {
      svelteHTML.createElement("p", {});
    }
  };
  return __rsvelte_snippet_return;
};
const b = () => {
  async () => {
    {
      svelteHTML.createElement("p", {});
    }
  };
  return __rsvelte_snippet_return;
};
const c = () => {
  async () => {
    __rsvelte_ensure_snippet(a());
  };
  return __rsvelte_snippet_return;
};

;

function $$render() {
  
	

;

  async () => {
    __rsvelte_ensure_snippet(a());
    __rsvelte_ensure_snippet(b());
    __rsvelte_ensure_snippet(c());
  };
  return (/** @type {typeof __rsvelte_export_isomorphic<{ [x: string]: never }, {}, string>} */ (__rsvelte_export_isomorphic))()(__rsvelte_any_event({}), {});
}
export const SnippetNamedLikeImport__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {InstanceType<typeof SnippetNamedLikeImport__SvelteComponent_>} SnippetNamedLikeImport__SvelteComponent_ */
export default SnippetNamedLikeImport__SvelteComponent_;
