;
const greeting = "hi";
;

import Icon from "./Icon.svelte";;

const plain = () => {
  async () => {
    {
      new (__rsvelte_component(Icon))(__rsvelte_internals(), {
        props: {},
      });
    }
    greeting;
  };
  return __rsvelte_snippet_return;
};
const calls_plain = () => {
  async () => {
    __rsvelte_ensure_snippet(plain());
  };
  return __rsvelte_snippet_return;
};

;

function $$render() {
  
  const uses_prop = () => {
    async () => {
      {
        svelteHTML.createElement("b", {});
        name;
      }
    };
    return __rsvelte_snippet_return;
  };
 let /** @typedef {{ name: any }} $$ComponentProps *//** @type {$$ComponentProps} */ { name } = $props();
;

  async () => {
    __rsvelte_ensure_snippet(plain());
    {
      svelteHTML.createElement("p", {});
      __rsvelte_ensure_snippet(uses_prop());
    }
    __rsvelte_ensure_snippet(calls_plain());
  };
  return (/** @type {typeof __rsvelte_export_component<$$ComponentProps, {}, "">} */ (__rsvelte_export_component))();
}
export const SnippetHoisted__SvelteComponent_ = /** @type {__rsvelte_javascript_export<Awaited<ReturnType<typeof $$render>>>} */ ($$render());
/** @typedef {ReturnType<typeof SnippetHoisted__SvelteComponent_>} SnippetHoisted__SvelteComponent_ */
export default SnippetHoisted__SvelteComponent_;
