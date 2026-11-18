<script>
  import { vmodel, vModelText } from "./runtime.js";

  let { own = "a", ...rest } = $props();
  let text = $state("");
  let attrs = $derived.by(() => ({ ...rest, title: text }));

  function onClick() {
    text = "";
  }
</script>

<input
  type="text"
  onclick={onClick}
  {...attrs}
  class={"class" in attrs ? [own, attrs.class] : own}
/>
<input
  type="text"
  {@attach vmodel(
    vModelText,
    () => text,
    {},
    { "onUpdate:modelValue": (v) => (text = v) },
  )}
/>
<div onclick={() => (text = "x")} {...attrs}>{text}</div>
