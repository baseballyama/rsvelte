;
const greeting = "hi";
;

import Icon from "./Icon.svelte";
const plain = (): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      __rsvelte_component(Icon)(__rsvelte_internals(), {});
    }
    (greeting);
  };
  return __rsvelte_snippet_return;
};
const uses_prop = (): ReturnType<import('svelte').Snippet> => {
  async () => {
    {
      svelteHTML.createElement("b", {});
      (name);
    }
  };
  return __rsvelte_snippet_return;
};
const calls_plain = (): ReturnType<import('svelte').Snippet> => {
  async () => {
    __rsvelte_ensure_snippet(plain());
  };
  return __rsvelte_snippet_return;
};
 let { name }: typeof __rsvelte_public_props0 = $props();
;

const __rsvelte_public_props0 = __rsvelte_props({
  name: __rsvelte_untyped_prop(),
}, {}, false);
async () => {
  __rsvelte_ensure_snippet(plain());
  {
    svelteHTML.createElement("p", {});
    __rsvelte_ensure_snippet(uses_prop());
  }
  __rsvelte_ensure_snippet(calls_plain());
};
const SnippetHoisted__SvelteComponent_ = __rsvelte_export_component<typeof __rsvelte_public_props0, {}, "">();
type SnippetHoisted__SvelteComponent_ = ReturnType<typeof SnippetHoisted__SvelteComponent_>;
export default SnippetHoisted__SvelteComponent_;
