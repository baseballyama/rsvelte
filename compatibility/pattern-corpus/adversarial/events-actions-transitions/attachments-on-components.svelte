<script>
  import Self from "./attachments-on-components.svelte";

  let { depth = 0, ...rest } = $props();

  let n = $state(0);

  function attach(node) {
    node.dataset.attached = "1";
    return () => {
      node.dataset.attached = "";
    };
  }

  const factory = (level) => (node) => {
    node.dataset.level = String(level);
  };

  const spread = { [Symbol.for("svelte.attachment")]: attach };
</script>

{#if depth === 0}
  <Self depth={1} {@attach attach} />
  <Self depth={1} {@attach factory(1)} />
  <Self depth={1} {...spread} />
  <div {@attach attach} {@attach factory(2)}>a</div>
  <div {...spread} {@attach attach}>b</div>
  <b>{n}</b>
{:else}
  <b>{Object.keys(rest).length}</b>
{/if}
