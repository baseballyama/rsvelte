<script lang="ts">
  import Inspect from '$lib/index.js'

  let noanimate = $state(false)
  let opts = $derived({ noanimate })

  // reactive config
  const ConfiguredInspect = Inspect.Values.withOptions(() => opts)
  // inherit config from ConfiguredInspect (still reactive!)
  const DarkInspect = ConfiguredInspect.withOptions(() => ({ theme: 'dark' }))

  let anything = true
</script>

<!-- pass any prop. no specific named prop expected. how to configure? -->
<Inspect.Values {anything} something={[1, 2, 3]} {...['a', 'b', 'c']} />

<!-- chainable inline configuration as final override -->
<Inspect.Values.Config.StereoTheme.Borderless.NoAnimate.Ok msg="quick config!" />

<!-- chainable config will not be inherited -->
<ConfiguredInspect.Expand10 we are boolean props />
<DarkInspect msg="i will have dark theme and whatever options i inherit" />
