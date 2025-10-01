# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fluent Emoji Maker - 一个基于 Microsoft Fluent Emoji 素材的网页表情生成器,允许用户自定义组合表情的各个部分(头部、眼睛、眉毛、嘴巴、细节),并导出为 PNG 或 SVG。

## Tech Stack

- **Framework**: SolidJS (reactive framework)
- **Build Tool**: Vite
- **Styling**: UnoCSS (Atomic CSS, Attributify mode)
- **Language**: TypeScript
- **Package Manager**: pnpm

## Development Commands

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## Architecture

### Core Data Flow

项目采用 **组合式表情生成** 架构:

1. **资源加载**: 使用 Vite 的 `import.meta.glob` 动态导入所有 SVG 素材
   - 素材分类: `head` (必选) / `eyes` / `eyebrows` / `mouth` / `detail` (可选)
   - 除 head 外,其他部分均在数组开头插入空字符串以支持"无该部分"选项

2. **状态管理**: SolidJS Signals
   - `images()`: 存储所有加载的素材 URL
   - `selectedIndex()`: 各部分当前选中的索引
   - `selectedTab()`: 当前激活的编辑标签

3. **渲染机制**: Canvas 双层渲染
   - 用户交互层: 通过 `<img>` 标签显示预览
   - 导出层: Canvas 将多个 SVG 图片叠加绘制(按 head → eyes → eyebrows → mouth → detail 顺序)
   - Canvas 尺寸固定为 640x640,显示尺寸为 160x160

4. **导出功能**:
   - **PNG**: 直接使用 `canvas.toBlob()`
   - **SVG**: 动态组合各部分的 SVG DOM 节点,生成完整 SVG 文件

### Key Implementation Details

- **SVG 动态加载**: `resolveImportGlobModule` 解析 Vite glob 导入的 Promise
- **随机生成**: `getRandom()` 为所有部分生成随机索引
- **动画效果**: 切换表情时通过添加/移除 `animation` class 触发 CSS 过渡
- **环境变量注入**: Vite 自定义插件 `htmlPlugin` 将 `.env` 中的 `VITE_GTAG_ID` 注入 HTML

### UnoCSS Usage

项目使用 **Attributify mode**,CSS 通过 HTML 属性书写:

```tsx
<div
  flex="~ col"           // flex flex-col
  items-center           // items-center
  bg-violet-200          // bg-violet-200
  dark:bg-violet-400     // dark mode variant
/>
```

### File Organization

```
src/
├── App.tsx              # 主应用组件,包含所有核心逻辑
├── main.tsx             # 应用入口,导入 UnoCSS 和样式
├── components/
│   ├── Header.tsx       # 页面头部
│   ├── Footer.tsx       # 页面底部
│   └── SelectButton.tsx # 素材选择按钮组件
└── assets/
    ├── head/            # 头部素材 (1-8.svg)
    ├── eyes/            # 眼睛素材 (1-26.svg)
    ├── eyebrows/        # 眉毛素材 (1-6.svg)
    ├── mouth/           # 嘴巴素材 (1-40.svg)
    └── details/         # 细节素材 (1-22.svg)
```

## Important Notes

1. **素材命名规范**: 所有 SVG 文件使用数字命名 (1.svg, 2.svg...),确保顺序一致性
2. **Canvas 尺寸**: 导出的 Canvas 尺寸为 640x640,修改需同步调整 `canvasSize` 变量
3. **SVG 导出视口**: SVG 导出固定使用 `32x32` viewBox (符合 Microsoft Fluent Emoji 规范)
4. **环境变量**: Google Analytics ID 通过 `.env` 中的 `VITE_GTAG_ID` 配置
5. **TypeScript 配置**: JSX 模式为 `preserve`,使用 SolidJS 的 JSX 转换

## Adding New Asset Categories

如需添加新的表情部分类型:

1. 在 `src/assets/` 下创建新文件夹
2. 在 `EmojiSlice` 类型中添加新类型
3. 在 `tabs` 数组中添加新标签
4. 在 `loadImage()` 中添加对应的 glob 导入逻辑
5. 在 `images` 和 `selectedIndex` 的初始状态中添加对应字段
6. Canvas 绘制顺序在 `createEffect` 中的 `Promise.all` 数组中调整
