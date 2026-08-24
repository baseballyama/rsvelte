<div class="animated">a</div>

<style>
  @layer base, overrides;

  @layer base {
    .animated {
      animation:
        local 1s linear,
        -global-shared 2s;
    }
  }

  @keyframes local {
    from {
      opacity: 0;
    }
    50%,
    75% {
      opacity: 0.5;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes -global-shared {
    0% {
      transform: none;
    }
  }

  @font-face {
    font-family: "X";
    src: url("x.woff2") format("woff2");
  }

  @property --p {
    syntax: "<length>";
    inherits: false;
    initial-value: 0px;
  }

  @container (min-width: 1px) {
    .animated {
      color: red;
    }
  }
</style>
