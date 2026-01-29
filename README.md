# 太阳系轨道科普 H5（纯静态）

- 太阳居中
- 行星 + 主要卫星简化轨道动画
- 支持拖拽旋转视角/缩放
- 点击天体显示信息
- 右上角面板可调时间倍率、切换俯视/侧视、跟随天体

> 注：比例与轨道为科普演示（非真实尺度），但逻辑结构可扩展。

## 运行

```bash
cd solar-system-h5
npm i
npm run dev
```

打开终端提示的本地地址（通常 http://localhost:5173）。

## 构建（部署到任意静态托管）

```bash
npm run build
npm run preview
```

产物在 `dist/`，可直接上传到 GitHub Pages / Netlify / Vercel static。

## 扩展建议

- 增加“显示更多卫星”的开关（按需加载）
- 加入开普勒椭圆轨道/倾角/近日点（更真实）
- 加贴图、光环（Saturn）、更精致星空
