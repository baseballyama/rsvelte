<script>
  let box = $state({ inner: { list: [1], fn: () => 1 } });
  let maybe = $state(null);
  let key = $state("inner");

  function tour() {
    box.inner ??= { list: [], fn: () => 0 };
    box.inner.list ||= [1];
    box.inner.fn &&= box.inner.fn;
    maybe ??= { deep: { value: 1 } };
    return [
      box?.inner?.list?.[0],
      box?.[key]?.list?.at?.(0),
      box?.inner?.fn?.(),
      box?.missing?.list?.[0]?.toFixed?.(2),
      maybe?.deep?.value,
      maybe?.["deep"]?.value,
      (box?.inner?.fn ?? (() => 0))(),
      box?.inner?.list?.length ?? 0,
    ];
  }
</script>

<b>{tour().join(",")}</b>
<b>{box?.inner?.list?.[0]}</b>
<b>{maybe?.deep?.value ?? "none"}</b>
