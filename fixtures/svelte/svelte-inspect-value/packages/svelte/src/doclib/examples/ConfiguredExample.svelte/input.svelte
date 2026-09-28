<script>
  import Inspect from '$lib/index.js'

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
  }))

  // elementAttributes will be to applied to outermost Inspect div
  const DarkInspect = Inspect.Values.withOptions(() => ({
    theme: 'dark',
    elementAttributes: { style: 'max-width: 500px' },
  }))

  // create another variation that will inherit from the previous one
  const DarkBorderless = DarkInspect.withOptions(() => ({ borderless: true }))
</script>

<div style="max-width: 600px" class="flex col">
  <InspectVals msg="i have been configured" {data} />

  <DarkInspect.Expand0 msg="me too" {data} />

  <!-- Override initial expandLevel  -->
  <DarkBorderless.Expand1 msg="i inherit options from DarkInspect" {...data} />
</div>
