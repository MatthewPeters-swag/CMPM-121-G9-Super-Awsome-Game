import { isRTL, updateRTLPosition } from './i18n/rtl-utils.js';

/**
 * Simple Inventory UI with 5 slots + item tracking
 */
export class InventoryUI {
  constructor() {
    this.slots = [];
    this.maxSlots = 5;
    this.items = []; // store item types

    // Create container
    this.container = document.createElement('div');
    this.ltrPosition = {
      position: 'absolute',
      top: '10px',
      left: '10px',
      display: 'flex',
      gap: '5px',
      zIndex: '1000',
    };
    this.rtlPosition = {
      position: 'absolute',
      top: '10px',
      right: '10px',
      left: 'auto',
      display: 'flex',
      gap: '5px',
      zIndex: '1000',
    };

    // Update position based on current language (will be called after i18n init)
    this.updatePosition();

    // Listen for language changes to update position
    window.addEventListener('languageChanged', () => {
      this.updatePosition();
    });

    // Create slots
    for (let i = 0; i < this.maxSlots; i++) {
      const slot = document.createElement('div');
      Object.assign(slot.style, {
        width: '50px',
        height: '50px',
        border: '2px solid white',
        backgroundColor: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      });
      this.container.appendChild(slot);
      this.slots.push(slot);
    }

    document.body.appendChild(this.container);
  }

  /**
   * Updates the inventory position based on current language/RTL state
   */
  updatePosition() {
    updateRTLPosition(this.container, this.ltrPosition, this.rtlPosition);
  }

  addItem(type) {
    const emptySlot = this.slots.find(slot => !slot.hasChildNodes());
    if (!emptySlot) return; // No space left

    // Store item
    this.items.push(type);
    console.log('[Inventory] addItem:', type);

    const icon = document.createElement('div');
    Object.assign(icon.style, {
      width: '30px',
      height: '30px',
      backgroundColor: type === 'key' ? 'gold' : 'white',
      borderRadius: '4px',
    });

    // Important: mark dataset so code can detect it
    icon.dataset.item = type;

    emptySlot.appendChild(icon);
  }

  hasItem(type) {
    return this.items.includes(type);
  }

  removeLastItem(type) {
    // Find the last occurrence of the item type
    const lastIndex = this.items.lastIndexOf(type);
    if (lastIndex === -1) return false;

    // Remove from items array
    this.items.splice(lastIndex, 1);

    // Find and remove the visual icon from the slot
    let foundSlotIndex = -1;
    for (let i = this.slots.length - 1; i >= 0; i--) {
      const slot = this.slots[i];
      const icon = slot.querySelector('[data-item="' + type + '"]');
      if (icon) {
        slot.removeChild(icon);
        foundSlotIndex = i;
        break;
      }
    }

    console.log('[Inventory] removeLastItem:', type, 'from slot', foundSlotIndex);
    return true;
  }

  clear() {
    // Clear items array
    this.items = [];

    // Remove all visual icons from slots
    this.slots.forEach(slot => {
      while (slot.firstChild) {
        slot.removeChild(slot.firstChild);
      }
    });

    console.log('[Inventory] cleared all items');
  }
}

// Create a singleton instance
export const inventory = new InventoryUI();
