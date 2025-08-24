// Simple 2D puzzle adventure game

// Game state
const gameState = {
  inventory: [null, null, null, null],
  selectedSlot: null
};

// Scene definitions
const scenes = {
  main: {
    id: 'main',
    items: [
      { id: 'note', x: 40, y: 200, label: '纸条' }
    ],
    hotspots: [
      {
        id: 'door', x: 350, y: 180, w: 120, h: 160,
        type: 'scene', target: 'hall', requiredItem: 'key',
        successMessage: '你用钥匙打开了门。',
        failureMessage: '门被锁住了，似乎需要钥匙。'
      },
      {
        id: 'puzzleBox', x: 160, y: 60, w: 80, h: 80,
        type: 'miniGame', puzzle: 'colorSequence', reward: 'gem',
        successMessage: '你解开了盒子，获得了一颗宝石！'
      },
      {
        id: 'painting', x: 60, y: 40, w: 100, h: 120,
        type: 'zoom', target: 'paintingZoom'
      }
    ]
  },
  paintingZoom: {
    id: 'paintingZoom',
    items: [
      { id: 'key', x: 240, y: 220, label: '钥匙' }
    ],
    hotspots: [
      {
        id: 'backMain', x: 10, y: 10, w: 80, h: 40,
        type: 'scene', target: 'main', requiredItem: null,
        successMessage: '返回原房间'
      }
    ]
  },
  hall: {
    id: 'hall',
    items: [],
    hotspots: [
      {
        id: 'chest', x: 230, y: 200, w: 150, h: 120,
        type: 'action', action: 'unlockChest', requiredItem: 'gem',
        successMessage: '你用宝石打开了宝箱，里面闪闪发光！你获得最终胜利！',
        failureMessage: '宝箱需要一颗宝石才能打开。'
      },
      {
        id: 'backFromHall', x: 10, y: 10, w: 80, h: 40,
        type: 'scene', target: 'main', requiredItem: null,
        successMessage: '返回原房间'
      }
    ]
  }
};

// DOM elements
const gameContainer = document.getElementById('game-container');
const inventoryBar = document.getElementById('inventory-bar');
const toastEl = document.getElementById('toast');
const minigameOverlay = document.getElementById('minigame-overlay');
const colorButtonsContainer = document.getElementById('color-buttons');
const minigameBackBtn = document.getElementById('minigame-back');

// Current scene ID
let currentScene = null;

// Mini‑game state
let currentPuzzle = null;
let puzzleReward = null;
let colorSequence = [];
let userSequence = [];

// Initialize game once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  buildScene('main');
  setupInventory();
  setupMiniGame();
});

// Build and display a scene
function buildScene(id) {
  // Clear previous scene
  while (gameContainer.firstChild) gameContainer.removeChild(gameContainer.firstChild);
  currentScene = id;
  const sceneDef = scenes[id];
  const sceneDiv = document.createElement('div');
  sceneDiv.classList.add('scene', id);
  sceneDiv.classList.add('active');
  // Add items
  sceneDef.items.forEach(item => {
    if (!gameState.itemsCollected || !gameState.itemsCollected[item.id]) {
      const itemEl = document.createElement('div');
      itemEl.classList.add('item', item.id);
      itemEl.style.left = item.x + 'px';
      itemEl.style.top = item.y + 'px';
      itemEl.dataset.itemId = item.id;
      itemEl.dataset.label = item.label;
      itemEl.innerText = item.label;
      itemEl.addEventListener('click', (e) => {
        e.stopPropagation();
        pickUpItem(item);
      });
      sceneDiv.appendChild(itemEl);
    }
  });
  // Add hotspots
  sceneDef.hotspots.forEach(hs => {
    const hsEl = document.createElement('div');
    hsEl.classList.add('hotspot');
    hsEl.style.left = hs.x + 'px';
    hsEl.style.top = hs.y + 'px';
    hsEl.style.width = hs.w + 'px';
    hsEl.style.height = hs.h + 'px';
    hsEl.dataset.hotspotId = hs.id;
    hsEl.addEventListener('click', (e) => {
      e.stopPropagation();
      handleHotspot(hs);
    });
    sceneDiv.appendChild(hsEl);
  });
  gameContainer.appendChild(sceneDiv);
}

// Inventory setup
function setupInventory() {
  Array.from(inventoryBar.getElementsByClassName('slot')).forEach((slotEl, index) => {
    slotEl.addEventListener('click', () => {
      if (gameState.inventory[index]) {
        // Toggle selection
        if (gameState.selectedSlot === index) {
          slotEl.classList.remove('selected');
          gameState.selectedSlot = null;
        } else {
          // Deselect any other
          clearSelectedSlot();
          slotEl.classList.add('selected');
          gameState.selectedSlot = index;
        }
      } else {
        showToast('此栏位为空');
      }
    });
  });
}

// Clear selected state in inventory
function clearSelectedSlot() {
  Array.from(inventoryBar.getElementsByClassName('slot')).forEach((slotEl) => {
    slotEl.classList.remove('selected');
  });
  gameState.selectedSlot = null;
}

// Pick up item and add to inventory
function pickUpItem(item) {
  // Find first empty slot
  const index = gameState.inventory.findIndex(i => i === null);
  if (index === -1) {
    showToast('物品栏已满');
    return;
  }
  gameState.inventory[index] = item.id;
  if (!gameState.itemsCollected) gameState.itemsCollected = {};
  gameState.itemsCollected[item.id] = true;
  // Update slot UI
  const slotEl = inventoryBar.querySelector(`[data-slot="${index}"]`);
  const slotItem = document.createElement('div');
  slotItem.classList.add('slot-item', item.id);
  slotItem.innerText = item.label;
  slotEl.appendChild(slotItem);
  showToast('获得：' + item.label);
  // Remove item from scene
  buildScene(currentScene);
}

// Remove item from inventory slot (after use)
function removeItemFromSlot(index) {
  const slotEl = inventoryBar.querySelector(`[data-slot="${index}"]`);
  slotEl.innerHTML = '';
  gameState.inventory[index] = null;
  slotEl.classList.remove('selected');
  gameState.selectedSlot = null;
}

// Handle hotspot click actions
function handleHotspot(hs) {
  if (hs.type === 'scene') {
    if (hs.requiredItem) {
      // Need to use an item
      if (gameState.selectedSlot != null && gameState.inventory[gameState.selectedSlot] === hs.requiredItem) {
        showToast(hs.successMessage || '使用成功');
        // Remove item from inventory after use
        removeItemFromSlot(gameState.selectedSlot);
        changeScene(hs.target);
      } else {
        showToast(hs.failureMessage || '无法使用该物品');
      }
    } else {
      if (hs.successMessage) showToast(hs.successMessage);
      changeScene(hs.target);
    }
  } else if (hs.type === 'miniGame') {
    // Start mini‑game
    currentPuzzle = hs.puzzle;
    puzzleReward = hs.reward;
    if (hs.successMessage) {
      minigameOverlay.dataset.successMessage = hs.successMessage;
    } else {
      minigameOverlay.dataset.successMessage = '';
    }
    openMiniGame();
  } else if (hs.type === 'zoom') {
    changeScene(hs.target);
  } else if (hs.type === 'action') {
    if (hs.requiredItem) {
      if (gameState.selectedSlot != null && gameState.inventory[gameState.selectedSlot] === hs.requiredItem) {
        showToast(hs.successMessage || '完成了动作');
        removeItemFromSlot(gameState.selectedSlot);
        // Additional logic for chest
        if (hs.action === 'unlockChest') {
          // Nothing else to do; maybe show final message
        }
      } else {
        showToast(hs.failureMessage || '失败');
      }
    } else {
      showToast(hs.successMessage || '交互成功');
    }
  }
}

// Change scenes with delay to let toast show
function changeScene(targetId) {
  buildScene(targetId);
}

// Toast helper
function showToast(text) {
  toastEl.innerText = text;
  toastEl.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2000);
}

// Mini‑game setup
function setupMiniGame() {
  minigameBackBtn.addEventListener('click', () => {
    closeMiniGame();
  });
}

// Open mini‑game overlay
function openMiniGame() {
  minigameOverlay.classList.remove('hidden');
  // Build puzzle based on type
  if (currentPuzzle === 'colorSequence') {
    setupColorSequenceGame();
  }
}

function closeMiniGame() {
  minigameOverlay.classList.add('hidden');
  // Reset puzzle state
  currentPuzzle = null;
  puzzleReward = null;
  userSequence = [];
  colorButtonsContainer.innerHTML = '';
}

function setupColorSequenceGame() {
  // Define sequence
  colorSequence = ['red', 'blue', 'green', 'yellow'];
  userSequence = [];
  // Show sequence to player via text
  const sequenceText = document.createElement('p');
  sequenceText.id = 'sequenceText';
  sequenceText.innerText = '顺序: 红 → 蓝 → 绿 → 黄';
  const minigameDiv = document.getElementById('minigame');
  // Remove existing sequence text if any
  const existing = minigameDiv.querySelector('#sequenceText');
  if (existing) existing.remove();
  minigameDiv.insertBefore(sequenceText, colorButtonsContainer);
  // Create color buttons
  colorButtonsContainer.innerHTML = '';
  const colors = {
    red: '#e74c3c',
    blue: '#3498db',
    green: '#2ecc71',
    yellow: '#f1c40f'
  };
  Object.keys(colors).forEach(color => {
    const btn = document.createElement('div');
    btn.classList.add('color-btn');
    btn.style.background = colors[color];
    btn.dataset.color = color;
    btn.addEventListener('click', () => {
      handleColorButtonClick(color);
    });
    colorButtonsContainer.appendChild(btn);
  });
}

function handleColorButtonClick(color) {
  userSequence.push(color);
  const index = userSequence.length - 1;
  if (userSequence[index] !== colorSequence[index]) {
    // Incorrect sequence; reset
    showToast('顺序错误，请重试');
    userSequence = [];
    return;
  }
  if (userSequence.length === colorSequence.length) {
    // Success
    showToast(minigameOverlay.dataset.successMessage || '完成谜题');
    // Give reward item
    if (puzzleReward) {
      const rewardDef = { id: puzzleReward, label: puzzleReward === 'gem' ? '宝石' : puzzleReward };
      giveRewardItem(rewardDef);
    }
    closeMiniGame();
  }
}

function giveRewardItem(rewardDef) {
  // Add item to inventory if not already
  if (!gameState.itemsCollected) gameState.itemsCollected = {};
  if (gameState.itemsCollected[rewardDef.id]) {
    return;
  }
  // Find empty slot
  const index = gameState.inventory.findIndex(i => i === null);
  if (index === -1) {
    showToast('物品栏已满，奖励物品掉落了');
    return;
  }
  gameState.inventory[index] = rewardDef.id;
  gameState.itemsCollected[rewardDef.id] = true;
  const slotEl = inventoryBar.querySelector(`[data-slot="${index}"]`);
  const slotItem = document.createElement('div');
  slotItem.classList.add('slot-item', rewardDef.id);
  slotItem.innerText = rewardDef.label;
  slotEl.appendChild(slotItem);
}