import { writable } from 'svelte/store';

type OverlayState = {
    [key: string]: {
        active: boolean;
        expanded: boolean;
    };
};

export const isModalOpen = writable<boolean>(false);

export const modalPosition = writable({ x: 0, y: 0 });

export function closeModal() {
    isModalOpen.set(false);
}

export const overlayStateAssets = writable<OverlayState>({
    wallet: { active: true, expanded: false },
    deposit: { active: true, expanded: false },
    // trends: { active: true, expanded: false },
    chart2: { active: true, expanded: false },
    info: { active: true, expanded: false },
    // feed: { active: true, expanded: false }
});

// Second range of overlays
export const overlayStateTrade = writable<OverlayState>({
    pairs: { active: false, expanded: true },
    book: { active: false, expanded: true },
    history: { active: false, expanded: true },
    order: { active: false, expanded: true },
    chart: { active: false, expanded: true }
});

export let activeLink = '/'; 
export const allToggled = writable<boolean>(true);
export const hoveredButton = writable<string | null>(null);

// Updated to allow forcing a specific toggle state
export function toggleAll(
    overlayState: typeof overlayStateTrade | typeof overlayStateAssets, 
    forceState?: boolean
) {
    allToggled.update((value) => {
        // Use the force state if provided, otherwise toggle the current value
        const newValue = forceState !== undefined ? forceState : !value;
        
        // First update the target overlay state
        overlayState.update((state) => {
            Object.keys(state).forEach((key) => {
                state[key].active = newValue;
                if (!newValue) {
                    state[key].expanded = false;
                }
            });
            return state;
        });
        
        // Then turn off the other overlay state if this one is being turned on
        if (newValue) {
            const otherOverlayState = overlayState === overlayStateTrade 
                ? overlayStateAssets 
                : overlayStateTrade;
                
            otherOverlayState.update((state) => {
                Object.keys(state).forEach((key) => {
                    state[key].active = false;
                    state[key].expanded = false;
                });
                return state;
            });
        }
        
        return newValue;
    });
}

export function toggleExpand(overlayState: typeof overlayStateTrade | typeof overlayStateAssets, overlayName: keyof OverlayState) {
    // When expanding an overlay, make sure it's from the active overlay group
    // and collapse any expanded overlays from the other group
    overlayState.update((state) => {
        // First make sure this overlay is active
        state[overlayName].active = true;
        
        // Then toggle its expanded state
        state[overlayName].expanded = !state[overlayName].expanded;
        
        // If we're expanding this overlay, disable all from the other group
        if (state[overlayName].expanded) {
            const otherOverlayState = overlayState === overlayStateTrade 
                ? overlayStateAssets 
                : overlayStateTrade;
                
            otherOverlayState.update((otherState) => {
                Object.keys(otherState).forEach((key) => {
                    otherState[key].expanded = false;
                });
                return otherState;
            });
        }
        
        return state;
    });
}

export function handleBackdropClick(overlayState: typeof overlayStateTrade | typeof overlayStateAssets, name: keyof OverlayState) {
    overlayState.update((state) => {
        if (state[name].expanded) {
            state[name].expanded = false;
        }
        return state;
    });
}

export function handleDragEnd(overlayState: typeof overlayStateTrade | typeof overlayStateAssets, name: keyof OverlayState) {
    overlayState.update((state) => {
        if (state[name].expanded) {
            state[name].expanded = false;
        }
        return state;
    });
}

export function handleMouseEnter(buttonName: string) {
    hoveredButton.set(buttonName);
}

export function handleMouseLeave() {
    hoveredButton.set(null);
}

// Helper function to check if any overlay in a state is active
export function isAnyOverlayActive(overlayState: typeof overlayStateTrade | typeof overlayStateAssets): boolean {
    let result = false;
    overlayState.subscribe(state => {
        result = Object.values(state).some(item => item.active);
    })();
    return result;
}