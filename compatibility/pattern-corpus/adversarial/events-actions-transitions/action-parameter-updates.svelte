<script>
  let n = $state(0);
  let params = $state({ level: 1 });

  function withUpdate(node, options) {
    node.dataset.level = String(options.level);
    return {
      update(next) {
        node.dataset.level = String(next.level);
      },
      destroy() {
        node.dataset.level = "";
      },
    };
  }

  function bare(node) {}

  function destroyOnly(node) {
    return {
      destroy() {},
    };
  }

  const stored = withUpdate;
</script>

<div use:withUpdate={params} use:bare use:destroyOnly>a</div>
<div use:withUpdate={{ level: n }}>b</div>
<div use:stored={params}>c</div>
<div use:withUpdate={params} use:withUpdate={{ level: 2 }}>d</div>
<button onclick={() => (n += 1)}>{n}</button>
