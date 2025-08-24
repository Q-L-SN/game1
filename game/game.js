(() => {
  /**
   * 资源目录
   * 所有图片均存放在 assets 目录下
   */
  const assetsPath = 'assets/';

  // 场景数据对象
  const scenes = {};

  // 当前场景 ID
  let currentSceneId = 'main';

  // 物品栏：四个槽位
  const inventory = [null, null, null, null];

  // 当前选中的槽位索引
  let selectedSlot = null;

  // 游戏状态标记
  const flags = {
    magnifierObtained: false,
    safeOpened: false,
    keyObtained: false,
    noteObtained: false
  };

  // 保险箱密码
  const code = '7285';

  // DOM 元素
  const sceneDiv = document.getElementById('scene');
  const inventoryDiv = document.getElementById('inventory');
  const toastDiv = document.getElementById('toast');
  const overlayDiv = document.getElementById('overlay');

  /**
   * 显示提示信息
   * @param {string} msg 提示内容
   * @param {number} duration 显示时长（毫秒）
   */
  function showToast(msg, duration = 2000) {
    toastDiv.textContent = msg;
    toastDiv.classList.add('show');
    clearTimeout(toastDiv._toastTimeout);
    toastDiv._toastTimeout = setTimeout(() => {
      toastDiv.classList.remove('show');
    }, duration);
  }

  /**
   * 将物品加入物品栏
   * @param {Object} item 物品对象
   * @returns {boolean} 是否成功加入
   */
  function addItemToInventory(item) {
    const index = inventory.findIndex((i) => i === null);
    if (index === -1) {
      showToast('物品栏已满');
      return false;
    }
    inventory[index] = item;
    refreshInventory();
    return true;
  }

  /**
   * 刷新物品栏显示
   */
  function refreshInventory() {
    inventoryDiv.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      if (selectedSlot === i) slot.classList.add('selected');
      slot.dataset.index = i;
      const item = inventory[i];
      if (item) {
        const img = document.createElement('img');
        img.src = assetsPath + item.img;
        img.alt = item.name;
        slot.appendChild(img);
      }
      slot.addEventListener('click', () => onSlotClick(i));
      inventoryDiv.appendChild(slot);
    }
  }

  /**
   * 槽位点击处理
   * @param {number} index 槽位索引
   */
  function onSlotClick(index) {
    const item = inventory[index];
    if (!item) {
      // 点击空槽位，取消选择
      if (selectedSlot !== null) {
        selectedSlot = null;
        refreshInventory();
      }
      return;
    }
    if (selectedSlot === index) {
      // 再次点击同一槽位取消选中
      selectedSlot = null;
      refreshInventory();
      return;
    }
    // 选择新的槽位
    selectedSlot = index;
    refreshInventory();
    // 展示物品说明
    if (item.onSelect) {
      item.onSelect();
    } else {
      showToast(item.name);
    }
  }

  /**
   * 从物品栏移除物品
   * @param {number} index 槽位索引
   */
  function removeItemFromInventory(index) {
    inventory[index] = null;
    if (selectedSlot === index) selectedSlot = null;
    refreshInventory();
  }

  /**
   * 定义所有场景及其元素
   */
  function defineScenes() {
    // 主场景
    scenes['main'] = {
      id: 'main',
      background: 'bg_main.png',
      items: [
        {
          id: 'note',
          name: '纸条',
          img: 'item_note.png',
          x: 20,
          y: 60,
          w: 10,
          h: 15,
          picked: false,
          onPick: function () {
            flags.noteObtained = true;
            showToast('获得纸条');
          },
          onSelect: function () {
            showToast('纸条上写着 7285');
          }
        }
      ],
      hotspots: [
        {
          name: 'door',
          x: 40,
          y: 5,
          w: 20,
          h: 25,
          onClick: function () {
            showToast('门锁着，需要钥匙。');
          },
          useItem: function (item) {
            if (item.id === 'key') {
              showToast('门打开了，你走出了房间！');
              loadScene('exit');
              return true;
            }
            showToast('无法用' + item.name + '打开门');
            return true;
          }
        },
        {
          name: 'painting',
          x: 5,
          y: 20,
          w: 30,
          h: 35,
          onClick: function () {
            loadScene('painting');
          }
        },
        {
          name: 'drawer',
          x: 65,
          y: 55,
          w: 25,
          h: 30,
          onClick: function () {
            loadScene('drawer');
          }
        },
        {
          name: 'floor',
          x: 40,
          y: 80,
          w: 20,
          h: 15,
          onClick: function () {
            showToast('只是普通的地面。');
          },
          useItem: function (item) {
            showToast('无法在这里使用' + item.name);
            return true;
          }
        }
      ]
    };

    // 画框场景
    scenes['painting'] = {
      id: 'painting',
      background: 'bg_painting.png',
      items: [],
      hotspots: [
        {
          name: 'puzzle',
          x: 25,
          y: 25,
          w: 50,
          h: 50,
          onClick: function () {
            if (flags.magnifierObtained) {
              showToast('这里已经没有其他东西了。');
            } else {
              startPuzzleGame();
            }
          }
        },
        {
          name: 'back',
          x: 5,
          y: 90,
          w: 20,
          h: 8,
          onClick: function () {
            loadScene('main');
          }
        }
      ]
    };

    // 抽屉/保险箱场景
    scenes['drawer'] = {
      id: 'drawer',
      background: 'bg_drawer.png',
      items: [],
      hotspots: [
        {
          name: 'safe',
          x: 30,
          y: 30,
          w: 40,
          h: 40,
          onClick: function () {
            if (!selectedSlot) {
              showToast('这里有个暗锁，看起来很小。');
            }
          },
          useItem: function (item) {
            if (flags.safeOpened) {
              showToast('保险箱已经打开。');
              return true;
            }
            if (item.id === 'magnifier') {
              startKeypad();
              return true;
            }
            showToast('似乎需要放大镜才能看清机关。');
            return true;
          }
        },
        {
          name: 'back',
          x: 5,
          y: 90,
          w: 20,
          h: 8,
          onClick: function () {
            loadScene('main');
          }
        }
      ]
    };

    // 出口场景
    scenes['exit'] = {
      id: 'exit',
      background: 'bg_exit.png',
      items: [],
      hotspots: [
        {
          name: 'end',
          x: 0,
          y: 0,
          w: 100,
          h: 100,
          onClick: function () {
            showToast('你已经走出去了，恭喜通关！');
          }
        }
      ]
    };
  }

  /**
   * 加载并渲染指定场景
   * @param {string} id 场景 ID
   */
  function loadScene(id) {
    currentSceneId = id;
    renderScene();
  }

  /**
   * 渲染当前场景
   */
  function renderScene() {
    const scene = scenes[currentSceneId];
    // 清空场景内容
    sceneDiv.innerHTML = '';
    // 设置背景
    const bg = document.createElement('img');
    bg.src = assetsPath + scene.background;
    bg.className = 'background';
    sceneDiv.appendChild(bg);
    // 渲染场景物品
    scene.items.forEach((item) => {
      if (item.picked) return;
      const el = document.createElement('img');
      el.src = assetsPath + item.img;
      el.alt = item.name;
      el.className = 'item';
      el.style.left = item.x + '%';
      el.style.top = item.y + '%';
      el.style.width = item.w + '%';
      el.style.height = item.h + '%';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        // 如果有物品选中，则尝试使用物品
        if (selectedSlot !== null) {
          const selItem = inventory[selectedSlot];
          showToast('无法在这里使用' + selItem.name);
          return;
        }
        // 尝试捡起物品
        const success = addItemToInventory({
          id: item.id,
          name: item.name,
          img: item.img,
          onSelect: item.onSelect
        });
        if (success) {
          item.picked = true;
          if (item.onPick) item.onPick();
          renderScene();
        }
      });
      sceneDiv.appendChild(el);
    });
    // 渲染热区
    scene.hotspots.forEach((hs) => {
      const area = document.createElement('div');
      area.className = 'hotspot';
      area.style.left = hs.x + '%';
      area.style.top = hs.y + '%';
      area.style.width = hs.w + '%';
      area.style.height = hs.h + '%';
      area.addEventListener('click', (e) => {
        e.stopPropagation();
        if (selectedSlot !== null && inventory[selectedSlot]) {
          // 尝试使用物品
          if (hs.useItem) {
            const used = hs.useItem(inventory[selectedSlot]);
            if (used) {
              return;
            }
          }
          // 如果没有 useItem 或者未返回使用成功
          showToast('无法在这里使用' + inventory[selectedSlot].name);
          return;
        }
        // 未选中物品，普通点击
        if (hs.onClick) hs.onClick();
      });
      sceneDiv.appendChild(area);
    });
  }

  /**
   * 开始数字顺序小游戏
   */
  function startPuzzleGame() {
    overlayDiv.innerHTML = '';
    overlayDiv.classList.remove('hidden');
    const container = document.createElement('div');
    container.className = 'puzzle-container';
    const title = document.createElement('div');
    title.textContent = '请按顺序点击数字1-4';
    container.appendChild(title);
    const btnWrapper = document.createElement('div');
    btnWrapper.className = 'puzzle-buttons';
    let expected = 1;
    const numbers = [1, 2, 3, 4];
    function resetButtons() {
      numbers.sort(() => Math.random() - 0.5);
      btnWrapper.innerHTML = '';
      expected = 1;
      numbers.forEach((n) => {
        const btn = document.createElement('div');
        btn.className = 'puzzle-button';
        btn.textContent = n;
        btn.addEventListener('click', () => {
          if (n === expected) {
            expected++;
            if (expected > 4) {
              // 成功
              overlayDiv.classList.add('hidden');
              if (!flags.magnifierObtained) {
                flags.magnifierObtained = true;
                showToast('你在画后找到了放大镜');
                addItemToInventory({
                  id: 'magnifier',
                  name: '放大镜',
                  img: 'item_magnifier.png',
                  onSelect: function () {
                    showToast('放大镜：可以看清细小的机关');
                  }
                });
              }
              return;
            }
          } else {
            showToast('顺序错误，重试');
            resetButtons();
          }
        });
        btnWrapper.appendChild(btn);
      });
    }
    resetButtons();
    container.appendChild(btnWrapper);
    overlayDiv.appendChild(container);
  }

  /**
   * 开始输入保险箱密码界面
   */
  function startKeypad() {
    overlayDiv.innerHTML = '';
    overlayDiv.classList.remove('hidden');
    const container = document.createElement('div');
    container.className = 'keypad-container';
    const display = document.createElement('div');
    display.className = 'keypad-display';
    display.textContent = '';
    container.appendChild(display);
    const buttonsWrapper = document.createElement('div');
    buttonsWrapper.className = 'keypad-buttons';
    // 创建数字按钮
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    nums.forEach((n) => {
      const btn = document.createElement('div');
      btn.className = 'keypad-button';
      btn.textContent = n;
      btn.addEventListener('click', () => {
        if (display.textContent.length < 4) {
          display.textContent += n;
        }
      });
      buttonsWrapper.appendChild(btn);
    });
    // 清除按钮
    const clearBtn = document.createElement('div');
    clearBtn.className = 'keypad-button';
    clearBtn.textContent = '清除';
    clearBtn.addEventListener('click', () => {
      display.textContent = '';
    });
    buttonsWrapper.appendChild(clearBtn);
    // 确定按钮
    const okBtn = document.createElement('div');
    okBtn.className = 'keypad-button';
    okBtn.textContent = '确定';
    okBtn.addEventListener('click', () => {
      if (display.textContent === code) {
        overlayDiv.classList.add('hidden');
        if (!flags.keyObtained) {
          flags.keyObtained = true;
          flags.safeOpened = true;
          showToast('保险箱打开了，你得到了钥匙');
          addItemToInventory({
            id: 'key',
            name: '钥匙',
            img: 'item_key.png',
            onSelect: function () {
              showToast('一把闪亮的钥匙');
            }
          });
        } else {
          showToast('保险箱已经打开');
        }
      } else {
        showToast('密码错误');
        display.textContent = '';
      }
    });
    buttonsWrapper.appendChild(okBtn);
    container.appendChild(buttonsWrapper);
    overlayDiv.appendChild(container);
  }

  /**
   * 初始化游戏
   */
  function init() {
    defineScenes();
    refreshInventory();
    loadScene('main');
    // 点击场景空白区域时，若选中物品则提示不能使用
    sceneDiv.addEventListener('click', (e) => {
      if (selectedSlot !== null) {
        const item = inventory[selectedSlot];
        if (item) {
          showToast('无法在这里使用' + item.name);
        }
      }
    });
  }

  // 页面加载完成后初始化
  window.addEventListener('load', init);
})();