<script>
  let value = $state(1);

  function action(node, param) {
    return {
      update(next) {
        node.dataset.p = String(next);
      },
      destroy() {},
    };
  }

  const attachment = (node) => {
    node.dataset.a = "1";
    return () => {};
  };
</script>

<div use:action={value} {@attach attachment}>a</div>
<div use:action={{ nested: value }} use:action>b</div>
<b>{value}</b>
