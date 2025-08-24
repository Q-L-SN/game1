// 游戏核心脚本

// 物品定义，后续会生成对应的图标
const items = {
  map: {
    id: 'map',
    name: '地图',
    color: '#f1c40f',
    letter: 'M',
    img: null,
    description: '标记了未知地点的旧地图。'
  },
  rope: {
    id: 'rope',
    name: '绳子',
    color: '#95a5a6',
    letter: 'R',
    img: null,
    description: '坚固的绳子，也许可以和别的东西组合。'
  },
  hook: {
    id: 'hook',
    name: '钩子',
    color: '#e67e22',
    letter: 'H',
    img: null,
    description: '可以和绳子组合成抓钩。'
  },
  grapplingHook: {
    id: 'grapplingHook',
    name: '抓钩',
    color: '#d35400',
    letter: 'G',
    img: null,
    description: '用来跨越断桥。'
  },
  coin: {
    id: 'coin',
    name: '硬币',
    color: '#f39c12',
    letter: 'C',
    img: null,
    description: '闪闪发光的金币，也许可以作为祭品。'
  },
  feather: {
    id: 'feather',
    name: '羽毛',
    color: '#ecf0f1',
    letter: 'F',
    img: null,
    description: '一根洁白的羽毛，轻如鸿毛。'
  },
  lantern: {
    id: 'lantern',
    name: '灯笼',
    color: '#e74c3c',
    letter: 'L',
    img: null,
    description: '照亮黑暗的灯笼。'
  },
  gem: {
    id: 'gem',
    name: '宝石',
    color: '#2980b9',
    letter: 'J',
    img: null,
    description: '闪耀的蓝色宝石，看起来很重要。'
  },
  potion: {
    id: 'potion',
    name: '药剂',
    color: '#27ae60',
    letter: 'P',
    img: null,
    description: '一瓶散发异香的药剂。'
  },
  scroll: {
    id: 'scroll',
    name: '卷轴',
    color: '#8e44ad',
    letter: 'S',
    img: null,
    description: '神秘符文的卷轴。'
  },
  key: {
    id: 'key',
    name: '钥匙',
    color: '#f39c12',
    letter: 'K',
    img: null,
    description: '精致的钥匙，也许可以开启什么。'
  }
};

// 组合规则：两个物品组合成新的物品
const combinationRules = {
  'rope+hook': {
    result: 'grapplingHook',
    message: '你将绳子和钩子组合成了抓钩。'
  }
};

// 世界状态标记
const worldFlags = {
  gemPlaced: false,
  hookObtained: false,
  potionObtained: false,
  scrollObtained: false
};

// 场景定义，包含背景图和热点
const scenes = {
  entrance: {
    id: 'entrance',
    img: 'assets/scenes/scene1.png',
    hotspots: [
      {
        type: 'item',
        item: 'map',
        x: 0.45,
        y: 0.55,
        w: 0.1,
        h: 0.15,
        message: '你发现了一张地图。'
      },
      {
        type: 'scene',
        target: 'river',
        x: 0.65,
        y: 0.75,
        w: 0.3,
        h: 0.25,
        message: '前往河流' // 可选提示
      },
      {
        type: 'scene',
        target: 'forestPath',
        x: 0.05,
        y: 0.75,
        w: 0.25,
        h: 0.25,
        message: '进入小道'
      },
      {
        type: 'toast',
        text: '一块普通的石头。',
        x: 0.25,
        y: 0.35,
        w: 0.2,
        h: 0.2
      }
    ]
  },
  river: {
    id: 'river',
    img: 'assets/scenes/scene2.png',
    hotspots: [
      {
        type: 'item',
        item: 'rope',
        x: 0.55,
        y: 0.55,
        w: 0.12,
        h: 0.15,
        message: '你拿起了一段绳子。'
      },
      {
        type: 'minigame',
        game: 'catchFish',
        x: 0.35,
        y: 0.45,
        w: 0.25,
        h: 0.25,
        message: '尝试抓住鱼。'
      },
      {
        type: 'scene',
        target: 'bridge',
        x: 0.65,
        y: 0.75,
        w: 0.3,
        h: 0.25,
        requireItem: 'grapplingHook',
        failMessage: '桥断了，似乎需要抓钩才能过去。'
      },
      {
        type: 'toast',
        text: '只是潺潺的水声。',
        x: 0.05,
        y: 0.3,
        w: 0.2,
        h: 0.2
      }
    ]
  },
  bridge: {
    id: 'bridge',
    img: 'assets/scenes/scene3.png',
    hotspots: [
      {
        type: 'item',
        item: 'coin',
        x: 0.45,
        y: 0.45,
        w: 0.1,
        h: 0.15,
        message: '你捡起了一枚硬币。'
      },
      {
        type: 'scene',
        target: 'forestPath',
        x: 0.65,
        y: 0.75,
        w: 0.3,
        h: 0.25,
        requireItem: 'grapplingHook',
        failMessage: '桥不稳，需要抓钩才能过去。'
      },
      {
        type: 'toast',
        text: '桥边的旧栏杆。',
        x: 0.15,
        y: 0.3,
        w: 0.2,
        h: 0.2
      }
    ]
  },
  forestPath: {
    id: 'forestPath',
    img: 'assets/scenes/scene4.png',
    hotspots: [
      {
        type: 'item',
        item: 'feather',
        x: 0.45,
        y: 0.45,
        w: 0.1,
        h: 0.15,
        message: '你拾起了一根羽毛。'
      },
      {
        type: 'scene',
        target: 'cave',
        x: 0.7,
        y: 0.75,
        w: 0.3,
        h: 0.25,
        message: '前往洞穴'
      },
      {
        type: 'toast',
        text: '林间的鸟鸣声此起彼伏。',
        x: 0.2,
        y: 0.3,
        w: 0.2,
        h: 0.2
      }
    ]
  },
  cave: {
    id: 'cave',
    img: 'assets/scenes/scene5.png',
    hotspots: [
      {
        type: 'item',
        item: 'lantern',
        x: 0.4,
        y: 0.6,
        w: 0.1,
        h: 0.15,
        message: '你找到了一盏灯笼。'
      },
      {
        type: 'scene',
        target: 'tree',
        x: 0.6,
        y: 0.4,
        w: 0.25,
        h: 0.25,
        requireItem: 'lantern',
        failMessage: '太黑了，什么也看不见。'
      },
      {
        type: 'toast',
        text: '潮湿而冰冷的岩壁。',
        x: 0.15,
        y: 0.3,
        w: 0.2,
        h: 0.2
      }
    ]
  },
  tree: {
    id: 'tree',
    img: 'assets/scenes/scene6.png',
    hotspots: [
      {
        type: 'item',
        item: 'gem',
        x: 0.6,
        y: 0.5,
        w: 0.1,
        h: 0.15,
        message: '你摘下了一颗宝石。'
      },
      {
        type: 'scene',
        target: 'altar',
        x: 0.7,
        y: 0.75,
        w: 0.3,
        h: 0.25,
        message: '前往祭坛'
      },
      {
        type: 'toast',
        text: '树叶散发着柔和的光。',
        x: 0.2,
        y: 0.35,
        w: 0.2,
        h: 0.2
      }
    ]
  },
  altar: {
    id: 'altar',
    img: 'assets/scenes/scene7.png',
    hotspots: [
      {
        type: 'minigame',
        game: 'brewPotion',
        x: 0.35,
        y: 0.45,
        w: 0.25,
        h: 0.25,
        message: '在祭坛上调配药剂。'
      },
      {
        type: 'scene',
        target: 'house',
        x: 0.65,
        y: 0.75,
        w: 0.3,
        h: 0.25,
        requireFlag: 'gemPlaced',
        use: {
          item: 'gem',
          successMessage: '你将宝石放在祭坛上，通路出现。',
          removeItem: true,
          setFlag: 'gemPlaced'
        },
        failMessage: '似乎需要在祭坛上放置什么东西。'
      },
      {
        type: 'toast',
        text: '祭坛上刻着古老的符号。',
        x: 0.15,
        y: 0.3,
        w: 0.2,
        h: 0.2
      }
    ]
  },
  house: {
    id: 'house',
    img: 'assets/scenes/scene8.png',
    hotspots: [
      {
        type: 'zoom',
        target: 'houseZoom',
        x: 0.4,
        y: 0.55,
        w: 0.2,
        h: 0.25,
        message: '查看桌面'
      },
      {
        type: 'scene',
        target: 'tower',
        x: 0.7,
        y: 0.75,
        w: 0.3,
        h: 0.25,
        message: '前往高塔'
      },
      {
        type: 'toast',
        text: '屋子的墙壁斑驳不堪。',
        x: 0.15,
        y: 0.3,
        w: 0.2,
        h: 0.2
      }
    ]
  },
  tower: {
    id: 'tower',
    img: 'assets/scenes/scene9.png',
    hotspots: [
      {
        type: 'item',
        item: 'key',
        x: 0.45,
        y: 0.45,
        w: 0.1,
        h: 0.15,
        message: '你拾起了一把钥匙。'
      },
      {
        type: 'scene',
        target: 'portal',
        x: 0.65,
        y: 0.75,
        w: 0.3,
        h: 0.25,
        requireItem: 'scroll',
        failMessage: '你似乎需要从卷轴里了解打开传送门的方法。'
      },
      {
        type: 'toast',
        text: '风在塔间呼啸。',
        x: 0.15,
        y: 0.3,
        w: 0.2,
        h: 0.2
      }
    ]
  },
  portal: {
    id: 'portal',
    img: 'assets/scenes/scene10.png',
    hotspots: [
      {
        type: 'portal',
        x: 0.25,
        y: 0.2,
        w: 0.5,
        h: 0.6,
        requireItems: ['key', 'gem', 'potion'],
        successMessage: '你打开了传送门，成功逃脱！',
        failMessage: '传送门毫无反应，似乎还缺少某些东西。'
      },
      {
        type: 'toast',
        text: '空气中弥漫着能量波动。',
        x: 0.1,
        y: 0.85,
        w: 0.2,
        h: 0.15
      }
    ]
  }
};

// 缩放视图定义
const zoomViews = {
  houseZoom: {
    img: 'assets/scenes/scene8_zoom.png',
    items: [
      {
        item: 'scroll',
        x: 0.45,
        y: 0.5,
        w: 0.1,
        h: 0.15,
        message: '你发现了一卷卷轴。'
      }
    ]
  }
};

// 当前场景
let currentScene = 'entrance';
// 当前选中的物品
let selectedItem = null;
// 第一次选择的物品，用于组合
let firstSelected = null;
// 玩家背包
let inventory = [];
// 最大槽位数
const maxSlots = 4;

// 初始化函数
function initGame() {
  // 生成所有物品的图标
  generateItemIcons();
  // 渲染初始场景
  renderScene();
  // 初始化背包界面
  renderInventory();
  // 注册空白区域点击事件，用于使用物品
  const sceneContainer = document.getElementById('scene-container');
  sceneContainer.addEventListener('click', (e) => {
    // 如果点击到了热点，则 hotspot 的事件会先触发，阻止冒泡标记 handled
    if (e.defaultPrevented) return;
    if (selectedItem) {
      showToast('这里不能使用这个物品。');
    }
  });
}

// 生成各个物品的动态图标
function generateItemIcons() {
  Object.keys(items).forEach(key => {
    const item = items[key];
    // 如果已有预生成的图片文件则使用，否则动态绘制
    // 我们仅为 map、rope、coin 三个物品准备了实际图片
    if (['map','rope','coin'].includes(item.id)) {
      item.img = `assets/items/${item.id}.png`;
    } else {
      // 创建画布
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      // 背景圆形
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();
      // 字母
      ctx.fillStyle = '#000';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.letter, 32, 36);
      item.img = canvas.toDataURL('image/png');
    }
  });
}

// 渲染当前场景
function renderScene() {
  const scene = scenes[currentScene];
  const container = document.getElementById('scene-container');
  container.style.backgroundImage = `url('${scene.img}')`;
  // 清除旧热点
  container.innerHTML = '';
  // 遍历热点
  scene.hotspots.forEach((hot) => {
    const div = document.createElement('div');
    div.className = 'hotspot';
    // 设置位置和尺寸百分比
    div.style.left = (hot.x * 100) + '%';
    div.style.top = (hot.y * 100) + '%';
    div.style.width = (hot.w * 100) + '%';
    div.style.height = (hot.h * 100) + '%';
    // 点击事件
    div.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleHotspotClick(hot);
    });
    container.appendChild(div);
  });
}

// 处理热点点击
function handleHotspotClick(hot) {
  switch (hot.type) {
    case 'item':
      handleItemPickup(hot);
      break;
    case 'scene':
      handleSceneTransition(hot);
      break;
    case 'toast':
      showToast(hot.text);
      break;
    case 'minigame':
      handleMinigame(hot);
      break;
    case 'zoom':
      handleZoom(hot);
      break;
    case 'portal':
      handlePortal(hot);
      break;
    default:
      break;
  }
}

// 处理拾取物品
function handleItemPickup(hot) {
  const id = hot.item;
  // 如果背包已满
  if (inventory.length >= maxSlots) {
    showToast('你的背包已满。');
    return;
  }
  // 如果已经拥有该物品则不重复拾取
  if (inventory.includes(id)) {
    showToast('你已经拾取过这个物品。');
    return;
  }
  inventory.push(id);
  showToast(hot.message || '获得物品。');
  // 隐藏该热点，防止重复获取
  hot.type = 'toast';
  hot.text = '这里已经空了。';
  renderInventory();
}

// 处理场景切换
function handleSceneTransition(hot) {
  // 如果热点有use逻辑并且用户选中相应物品，则处理使用逻辑
  if (hot.use && selectedItem === hot.use.item) {
    // 使用成功
    if (hot.use.removeItem) {
      // 移除物品
      const idx = inventory.indexOf(selectedItem);
      if (idx >= 0) inventory.splice(idx, 1);
      selectedItem = null;
      firstSelected = null;
      renderInventory();
    }
    if (hot.use.setFlag) {
      worldFlags[hot.use.setFlag] = true;
    }
    showToast(hot.use.successMessage);
    return;
  }
  // 如果有需要物品，检查背包
  if (hot.requireItem && !inventory.includes(hot.requireItem)) {
    showToast(hot.failMessage || '条件不满足。');
    return;
  }
  // 如果有需要旗标
  if (hot.requireFlag && !worldFlags[hot.requireFlag]) {
    // 如果用户选中了正确物品，可使用
    if (hot.use && selectedItem === hot.use.item) {
      // 这里已在前面处理
    } else {
      showToast(hot.failMessage || '条件不满足。');
      return;
    }
  }
  // 切换场景
  currentScene = hot.target;
  renderScene();
}

// 处理迷你游戏
function handleMinigame(hot) {
  if (hot.game === 'catchFish') {
    // 如果已经获取过钩子，则显示空信息
    if (inventory.includes('hook')) {
      showToast('这里已经没有鱼了。');
      return;
    }
    startCatchFishGame();
  } else if (hot.game === 'brewPotion') {
    if (inventory.includes('potion')) {
      showToast('你已经调配过药剂了。');
      return;
    }
    startBrewPotionGame();
  }
}

// 处理放大视图
function handleZoom(hot) {
  const zoom = zoomViews[hot.target];
  const overlay = document.getElementById('zoom-overlay');
  overlay.innerHTML = '';
  overlay.classList.remove('hidden');
  // 背景图
  const bgImg = document.createElement('img');
  bgImg.src = zoom.img;
  bgImg.style.width = '100%';
  bgImg.style.height = '100%';
  bgImg.style.objectFit = 'cover';
  overlay.appendChild(bgImg);
  // 返回按钮
  const backBtn = document.createElement('div');
  backBtn.className = 'back-button';
  backBtn.innerText = '返回';
  backBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  });
  overlay.appendChild(backBtn);
  // 放大视图内的物品
  zoom.items.forEach(zitem => {
    const div = document.createElement('div');
    div.className = 'zoom-item';
    div.style.left = (zitem.x * 100) + '%';
    div.style.top = (zitem.y * 100) + '%';
    div.style.width = (zitem.w * 100) + '%';
    div.style.height = (zitem.h * 100) + '%';
    div.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // 拾取物品
      if (inventory.includes(zitem.item)) {
        showToast('你已经拿过这个物品。');
      } else if (inventory.length >= maxSlots) {
        showToast('你的背包已满。');
      } else {
        inventory.push(zitem.item);
        // 标记为获得卷轴
        worldFlags.scrollObtained = true;
        showToast(zitem.message || '获得物品。');
        renderInventory();
        // 移除该物品区域
        div.remove();
      }
    });
    overlay.appendChild(div);
  });
}

// 处理终极传送门
function handlePortal(hot) {
  const required = hot.requireItems;
  const hasAll = required.every(id => inventory.includes(id));
  if (hasAll) {
    // 完成游戏
    showToast(hot.successMessage);
  } else {
    showToast(hot.failMessage);
  }
}

// 开始抓鱼游戏
function startCatchFishGame() {
  const overlay = document.getElementById('minigame-overlay');
  overlay.innerHTML = '';
  overlay.classList.remove('hidden');
  overlay.style.position = 'absolute';
  // 创建容器
  const container = document.createElement('div');
  container.className = 'minigame';
  const title = document.createElement('div');
  title.innerText = '点击移动的鱼以捕获它！';
  container.appendChild(title);
  // 创建鱼
  const fish = document.createElement('div');
  fish.style.width = '60px';
  fish.style.height = '40px';
  fish.style.background = '#3498db';
  fish.style.borderRadius = '20px 30px 20px 30px';
  fish.style.position = 'absolute';
  fish.style.cursor = 'pointer';
  container.appendChild(fish);
  overlay.appendChild(container);
  // 移动鱼
  let caught = false;
  function moveFish() {
    if (caught) return;
    const areaW = overlay.clientWidth - 60;
    const areaH = overlay.clientHeight - 40;
    const x = Math.random() * areaW;
    const y = Math.random() * areaH;
    fish.style.transform = `translate(${x}px, ${y}px)`;
  }
  fish.addEventListener('click', () => {
    if (caught) return;
    caught = true;
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
    // 获取钩子
    if (!inventory.includes('hook')) {
      inventory.push('hook');
      showToast('你捕到了鱼，鱼嘴里竟然有一个钩子！');
      renderInventory();
    }
  });
  moveFish();
  const interval = setInterval(moveFish, 1000);
  // 超时处理，30秒失败
  setTimeout(() => {
    if (!caught) {
      clearInterval(interval);
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
      showToast('你没能抓住鱼。');
    }
  }, 30000);
}

// 开始调配药剂游戏
function startBrewPotionGame() {
  const overlay = document.getElementById('minigame-overlay');
  overlay.innerHTML = '';
  overlay.classList.remove('hidden');
  const container = document.createElement('div');
  container.className = 'minigame';
  const title = document.createElement('div');
  title.innerText = '按顺序点击颜色来调配药剂：红、绿、蓝';
  container.appendChild(title);
  const colors = ['#e74c3c', '#27ae60', '#3498db'];
  let sequence = [0,1,2];
  let currentIndex = 0;
  colors.forEach((color, idx) => {
    const circle = document.createElement('div');
    circle.style.width = '60px';
    circle.style.height = '60px';
    circle.style.borderRadius = '50%';
    circle.style.background = color;
    circle.style.display = 'inline-block';
    circle.style.margin = '10px';
    circle.style.cursor = 'pointer';
    circle.addEventListener('click', () => {
      if (sequence[currentIndex] === idx) {
        currentIndex++;
        if (currentIndex === sequence.length) {
          // 成功
          overlay.classList.add('hidden');
          overlay.innerHTML = '';
          if (!inventory.includes('potion')) {
            inventory.push('potion');
            showToast('你成功调配了药剂！');
            renderInventory();
          } else {
            showToast('你已经调配过药剂了。');
          }
        }
      } else {
        // 失败
        overlay.classList.add('hidden');
        overlay.innerHTML = '';
        showToast('调配顺序错误，实验失败。');
      }
    });
    container.appendChild(circle);
  });
  overlay.appendChild(container);
}

// 渲染背包
function renderInventory() {
  const inv = document.getElementById('inventory');
  inv.innerHTML = '';
  for (let i = 0; i < maxSlots; i++) {
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    if (selectedItem && inventory[i] === selectedItem) {
      slot.classList.add('selected');
    }
    if (inventory[i]) {
      const img = document.createElement('img');
      img.src = items[inventory[i]].img;
      img.alt = items[inventory[i]].name;
      slot.appendChild(img);
    }
    // 点击槽位
    slot.addEventListener('click', () => {
      if (!inventory[i]) return;
      const itemId = inventory[i];
      // 如有首次选择
      if (!selectedItem) {
        selectedItem = itemId;
        firstSelected = itemId;
        showToast(items[itemId].name);
      } else if (selectedItem === itemId) {
        // 再次点击取消选择
        selectedItem = null;
        firstSelected = null;
      } else {
        // 已经选中一个物品，再选另一个尝试组合
        const secondItem = itemId;
        tryCombineItems(firstSelected, secondItem);
        // 组合完自动取消选择
        selectedItem = null;
        firstSelected = null;
      }
      renderInventory();
    });
    inv.appendChild(slot);
  }
}

// 组合物品
function tryCombineItems(itemA, itemB) {
  // 排序键，确保组合顺序无关
  const key = [itemA, itemB].sort().join('+');
  if (combinationRules[key]) {
    const rule = combinationRules[key];
    // 移除两个物品
    inventory = inventory.filter(id => id !== itemA && id !== itemB);
    // 添加结果物品
    inventory.push(rule.result);
    showToast(rule.message);
    renderInventory();
  } else {
    showToast('这些东西似乎不能组合。');
  }
}

// Toast 提示
function showToast(text) {
  const container = document.getElementById('toast-container');
  const div = document.createElement('div');
  div.className = 'toast';
  div.innerText = text;
  container.appendChild(div);
  // 3秒后移除
  setTimeout(() => {
    div.remove();
  }, 3000);
}

// 启动游戏
window.addEventListener('load', initGame);