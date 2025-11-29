/**
 * Simple Inventory UI with 5 slots
 */
export class InventoryUI {
  constructor() {
    this.slots = [];
    this.maxSlots = 5;

    // Create container
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'absolute',
      top: '10px',
      left: '10px',
      display: 'flex',
      gap: '5px',
      zIndex: '1000',
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

  addItem(type) {
    const emptySlot = this.slots.find(slot => !slot.hasChildNodes());
    if (!emptySlot) return; // No space left

    const icon = document.createElement('div');
    Object.assign(icon.style, {
      width: '30px',
      height: '30px',
      backgroundColor: type === 'key' ? 'gold' : 'white',
      borderRadius: '4px',
    });

    emptySlot.appendChild(icon);
  }
}

// Create a singleton instance
export const inventory = new InventoryUI();
