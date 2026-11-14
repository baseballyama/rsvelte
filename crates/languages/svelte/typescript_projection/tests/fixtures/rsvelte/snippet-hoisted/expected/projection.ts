;
const greeting = "hi";
;

import Icon from "./Icon.svelte";
const plain = () => {
  async () => {
    {
      __rsvelte_component(Icon)(__rsvelte_internals(), {});
    }
    (greeting);
  };
  return __rsvelte_snippet_return;
};
const uses_prop = () => {
  async () => {
    {
      svelteHTML.createElement("b", {});
      (name);
    }
  };
  return __rsvelte_snippet_return;
};
const calls_plain = () => {
  async () => {
    __rsvelte_ensure_snippet(plain());
  };
  return __rsvelte_snippet_return;
};
 let { name } = $props();
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
const SnippetHoisted__SvelteComponent_ = __rsvelte_export_component();
export default SnippetHoisted__SvelteComponent_;
