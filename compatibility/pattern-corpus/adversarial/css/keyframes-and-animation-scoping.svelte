<div class="local">a</div>
<div class="shared">b</div>

<style>
  .local {
    animation: spin 1s linear infinite;
  }

  .shared {
    animation-name: pulse;
    animation-duration: 2s;
    animation-timing-function: steps(4, end);
    animation-iteration-count: infinite;
    animation-direction: alternate-reverse;
    animation-fill-mode: both;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    50% {
      transform: rotate(180deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @keyframes -global-pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0;
    }
  }
</style>
