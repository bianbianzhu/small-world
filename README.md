# 悦悦的小小世界

Vite + Three.js 的可交互三维小家：游戏房通过圆拱门和缓坡连接悦悦的卧室。无后端、无外部模型依赖，几何、织物与木纹材质均在本地生成。

## 本地运行

需要 Node.js 20.19+ 或 22.12+。

```sh
npm install
npm run dev
```

访问终端显示的本地地址。源文件修改后 Vite 自动热刷新。

```sh
npm run build
npm run preview
npm test
```

## 交互

- 顶部「游戏房 / 悦悦卧室 / 整个小家」切换视角；「陪悦悦去卧室」邀请她走过去读绘本。
- 拖动旋转视角，滚轮或双指缩放；右下角提供缩放、环绕、复位。
- 悦悦自动选择不同玩具，步行到玩具旁后开始对应动作。
- 点击场景玩具或「玩具小天地」邀请悦悦；暂停键控制角色活动。
- 右上角音符开启轻柔合成音，木琴活动会发出琴音。默认静音。
- 活动中点击新玩具会排队：先完成当前互动并放回手里的物件，再走向新玩具。

## 扩展

- `src/world/primitives.js`：圆角建模工具、共享材质与程序纹理。
- `src/world/bedroom.js`：卧室家具与细节、睡前绘本和小熊互动、连接圆拱门与门口缓坡。
- `src/world/surfaces.js`：共享房间尺寸、门口位置及垫面、缓坡、木地板和地毯高度。
- `src/roomViews.js`：三个房间视角的平滑切换与对应界面文案。
- `src/world/room.js`：9 × 6.6 米（约 60 平方米）爬爬垫、房间与家具。
- `src/world/toys.js`：`toyDefinitions` 定义玩具的 ID、名称、动作类型、场景位置、抵达位置、时长和状态文案；`createToys` 返回模型和可动画部件 `parts`。新增玩具先加入定义，再补充对应工厂分支。已有动作类型可直接复用。
- `src/character/Yueyue.js`：独立角色关节层级、姿态混合、眨眼和 `pose(type, time, dt)` 动作库。
- `src/character/legs.js`：髋、膝、踝关节，按移动距离推进的步态、支撑脚锁定及地面接触约束。
- `src/world/castle.js`：梯子中心线、踏棍和平台高度，模型与攀爬路径共享。
- `src/character/arms.js`：肩、肘、腕关节及双骨骼 IK，按世界空间接触点定位手部。
- `src/world/materials.js`：缓存的木材与织物微表面材质。
- `src/world/garden.js`：窗外蓝天着色器和多层庭院模型。
- `src/world/toyDetails.js`：玩具模型细节、翻页部件和材质细化。
- `src/behaviors/navigation.js`：带身体间隙的二维 A* 路径，避开城堡、滑梯与卧室家具，并仅从圆拱门穿过房间隔断。
- `src/behaviors/Director.js`：随机决策、避障行走、拿取与放回、玩具互动和动画调度。增加全新动作时在角色 `pose` 和导演的部件动画中分别实现。
- `src/main.js`：VSM 柔和阴影、GTAO 接触阴影、冷暖灯光、轨道相机、射线拾取、界面与声音。

目前角色为程序化风格模型与关节动画。路径使用预设障碍范围的二维 A*；滚球使用简化阻尼和边界反弹，拿取使用动画曲线及双骨骼 IK，尚非全场景刚体物理。新增大型设施需要同步维护导航障碍范围。字体提供系统回退，外部字体无法加载时仍可完整运行。

## GitHub Pages

已提供 `.github/workflows/deploy-pages.yml`：推送到 `main` 后，自动安装依赖、测试、构建并部署 `dist`，也可在 Actions 中手动运行。

首次启用：

1. 将项目推送到你的 GitHub 仓库。
2. 在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 在 **Actions → Deploy to GitHub Pages → Run workflow** 运行工作流；之后推送 `main` 会自动更新。
4. 部署地址见工作流中的 `github-pages` 环境链接，通常是 `https://用户名.github.io/仓库名/`。

`vite.config.js` 使用相对资源路径，因此无需硬编码仓库名，同时保留本地开发和热刷新。GitHub Pages 提供静态文件托管；角色动画、Three.js 渲染和合成音都在浏览器运行，无需后端服务。
