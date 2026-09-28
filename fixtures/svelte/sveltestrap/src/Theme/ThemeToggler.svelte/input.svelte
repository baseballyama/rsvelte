<script>
  import { colorMode, toggleColorMode } from './helpers';

  let currentColorMode = $colorMode;

  colorMode.subscribe((value) => {
    currentColorMode = value;
  });
</script>

<slot {currentColorMode} {toggleColorMode} />
