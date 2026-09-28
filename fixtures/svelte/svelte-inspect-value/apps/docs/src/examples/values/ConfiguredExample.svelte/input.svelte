<script lang="ts">
  import Inspect from 'svelte-inspect-value'

  const data = {
    a: 1,
    b: 2,
    c: 3,
    d: {
      a: 1,
      b: 2,
      c: 3,
    },
  }

  const InspectVals = Inspect.Values.withOptions(() => ({
    expandLevel: 0,
    elementAttributes: { class: 'not-content' },
  }))

  // elementAttributes will be to applied to outermost Inspect div
  const DarkInspect = Inspect.Values.withOptions(() => ({
    theme: 'dark',
    elementAttributes: { style: 'max-width: 300px', class: 'not-content' },
  }))

  // create another variation that will inherit from the previous one
  const DarkBorderless = DarkInspect.withOptions(() => ({ borderless: true }))
</script>

<div class="not-content">
  <InspectVals msg="i have been configured" {data} />

  <DarkInspect.Expand0 msg="me too" {data} />

  <!-- Override initial expandLevel  -->
  <DarkBorderless.Expand1 msg="i inherit options from DarkInspect" {...data} />
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border-radius: 8px;
    background-color: #1e2c3e;
    padding: 0.5rem;
  }
</style>
