<script lang="ts">
  let {
    rotation = $bindable(0),
    oncancel,
    onapply,
  }: {
    rotation?: number
    oncancel?: () => void
    onapply?: () => void
  } = $props()
</script>

<div class="flex row gap align-center justify-center">
  <label class="flex row">
    hue rotate
    <div class="flex row">
      <input type="range" min={-360} max={360} bind:value={rotation} defaultValue={0} />
      <input type="number" min={-360} max={360} bind:value={rotation} defaultValue={0} />
    </div>
  </label>
  <button
    type="button"
    title="clear rotation"
    class="unstyled"
    disabled={rotation === 0}
    onclick={oncancel}>cancel</button
  >
  <button
    type="button"
    title="apply rotation"
    disabled={rotation === 0}
    class="unstyled"
    onclick={onapply}>apply</button
  >
</div>
