# Markdown格式测试文章

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

## 文本格式

这是一个包含**粗体文本**和*斜体文本*的段落。你也可以使用***粗斜体***文本。

还可以使用~~删除线~~文本。

## 代码示例

### 内联代码

使用 `console.log()` 来输出信息到控制台。

### 代码块

```javascript
function greetUser(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to our blog, ${name}`;
}

// 调用函数
const message = greetUser('张三');
console.log(message);
```

```python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# 计算斐波那契数列
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
```

```css
.markdown-content {
  font-family: 'Noto Serif SC', serif;
  line-height: 1.8;
  color: #333;
}

.markdown-content h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
```

## 列表示例

### 无序列表

- 第一个列表项
- 第二个列表项
  - 嵌套列表项 1
  - 嵌套列表项 2
    - 更深层的嵌套
- 第三个列表项

### 有序列表

1. 第一步：准备开发环境
2. 第二步：创建项目结构
3. 第三步：编写代码
   1. 前端开发
   2. 后端开发
   3. 数据库设计
4. 第四步：测试和部署

## 引用示例

> 这是一个简单的引用块。
> 
> 引用可以包含多个段落，也可以包含其他Markdown元素。

> ### 引用中的标题
> 
> 引用块中也可以包含**粗体**和*斜体*文本。
> 
> ```javascript
> // 甚至可以包含代码块
> console.log('Hello from quote!');
> ```

## 链接和图片

### 链接示例

这是一个[内联链接](https://example.com)的示例。

这是一个[带标题的链接](https://example.com "这是链接标题")。

### 图片示例

![示例图片](https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20landscape%20with%20mountains%20and%20lake%20at%20sunset&image_size=landscape_16_9)

## 表格示例

| 功能 | 描述 | 状态 | 优先级 |
|------|------|------|--------|
| 用户注册 | 允许新用户创建账户 | ✅ 完成 | 高 |
| 文章发布 | 用户可以发布新文章 | ✅ 完成 | 高 |
| 评论系统 | 用户可以对文章评论 | 🚧 开发中 | 中 |
| 搜索功能 | 全文搜索文章内容 | ⏳ 计划中 | 低 |

## 分割线

上面是一些内容。

---

下面是更多内容。

## 任务列表

- [x] 完成项目初始化
- [x] 设计数据库结构
- [x] 实现用户认证
- [ ] 添加评论功能
- [ ] 优化SEO
- [ ] 添加RSS订阅

## 特殊字符和转义

有时候你需要显示特殊字符，比如：

- 星号: \*
- 下划线: \_
- 反引号: \`
- 方括号: \[\]

## 数学公式（如果支持）

内联数学公式：$E = mc^2$

块级数学公式：
$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

## 总结

这篇文章展示了各种Markdown格式的渲染效果，包括：

1. **标题层级** - 从H1到H6
2. **文本格式** - 粗体、斜体、删除线
3. **代码展示** - 内联代码和代码块
4. **列表结构** - 有序和无序列表
5. **引用块** - 简单和复杂引用
6. **链接图片** - 各种链接和图片格式
7. **表格数据** - 结构化数据展示
8. **任务列表** - 待办事项管理

通过这些测试，我们可以验证Markdown渲染器是否正常工作。