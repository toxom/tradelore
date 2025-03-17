<script lang="ts">
    import type { ButtonProps } from '../../types/types.ui';
  
    export let primary = false;
    export let backgroundColor: string | undefined = undefined;
    export let size: 'small' | 'medium' | 'large' = 'medium';
    export let label: string;
    export let onClick: (() => void) | undefined = undefined;
  </script>
  
  <button
    type="button"
    class={['button', `button--${size}`].join(' ')}
    class:button--primary={primary}
    class:button--secondary={!primary}
    style:background-color={backgroundColor}
    on:click={onClick}
  >
    {label}
  </button>
  <style lang="scss">
	* {
    }
  .button {
    display: inline-block;
    cursor: pointer;
    border: 0;
    border-radius: 3em;
    font-weight: 700;
    line-height: 1;
    font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  .button--primary {
    background-color: #555ab9;
    color: white;
  }
  .button--secondary {
    box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset;
    background-color: transparent;
    color: #333;
  }
  .button--small {
    padding: 10px 16px;
    font-size: 12px;
  }
  .button--medium {
    padding: 11px 20px;
    font-size: 14px;
  }
  .button--large {
    padding: 12px 24px;
    font-size: 16px;
  }
</style>
