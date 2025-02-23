<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fade } from 'svelte/transition';
  
    export let options: Array<{code: string, label: string, name: string}>;
    export let selectedValue: string;
    export let icon: any = null;

    let isOpen = false;
    const dispatch = createEventDispatcher();
  
    function handleSelect(value: string) {
      selectedValue = value;
      isOpen = false;
      dispatch('select', value);
    }
  
    $: selectedLabel = options.find(opt => opt.code === selectedValue)?.label || selectedValue;
    $: selectedName = options.find(opt => opt.code === selectedValue)?.name || selectedValue;

  </script>
  
  <div class="dropdown">
    <button class="dropdown-btn" on:click={() => isOpen = !isOpen} class:active={isOpen}>
        {#if icon}
          <svelte:component this={icon} size={16}/>
        {/if}
        {selectedLabel}
        ▼
      </button>
     
      {#if isOpen}
        <div class="dropdown-content" transition:fade>
          {#each options as {code, label, name}}
            <button 
              class="dropdown-item" 
              class:active={code === selectedValue}
              on:click={() => handleSelect(code)}
            >
              {label}
              {name}
            </button>
          {/each}
        </div>
      {/if}
     </div>
  
<style lang="scss">
    .dropdown {
      position: relative;
    }
    .dropdown-btn {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 0.5rem;
      border: 1px solid;
      border-color: var(--secondary-color);
      border-radius: 1rem;
      background: var(--primary-color);
      cursor: pointer;
      width: auto;
        color: var(--text-color);
      &.active {
        background: var(--secondary-color);
      }
    }
    .dropdown-content {
      position: absolute;
      top: 110%;
      right: 0;
      display: flex;
      flex-direction: column;
      width: auto;
      justify-content: center;
      align-items: center;
      /* min-width: 120px; */
      background: var(--secondary-color);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      z-index: 100;
      width: auto;
      border-radius: 1rem;
      padding: 0.5rem;
      gap: 0.5rem;
      
    }
    .dropdown-item {
        width: 100px;
      border: none;
      background: #e1e1e1;
      margin-left: 0;
      cursor: pointer;
      text-align: left;
      display: flex;
      align-items: left;
      flex-direction: row;
      gap: 2rem;
      border-radius: 1rem;
      transition: all 0.3s ease;

    }
    .dropdown-item:hover {
      background: var(--text-color);
      color: var(--primary-color);
    }
    .dropdown-item.active {
      border-radius: 2rem;
      background: var(--primary-color);
      color: var(--text-color);
      font-weight: 700;

    }
  </style>