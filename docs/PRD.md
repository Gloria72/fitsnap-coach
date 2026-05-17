# FitSnap Coach PRD

版本：v1.0  
日期：2026-05-14  
负责人：Product / AI / Engineering  
产品定位：AI 健身、营养与恢复教练，基于照片、视频、目标体型和健康数据，为用户提供每日/每周可执行计划。

## 0. 公开竞品参考

- NutriSnap AI App Store 页面：拍照识别餐食、估算热量和宏量营养、健康评分、个性化目标、进度追踪、Apple Health 运动/步数同步。
- NutriSnap 官网类页面：强调拍照后快速返回 calories/macros、每日追踪和个性化 meal plan。
- NutriSnap / AI calorie tracker 类产品页：强调 5 秒记录、目标设置、拍餐、查看剩余热量和宏量营养。

## 1. 背景与机会

NutriSnap.blog 类产品的核心价值是把“记录饮食”从手动输入变成拍照识别：用户拍摄餐食，系统估算卡路里、蛋白质、碳水、脂肪，并将结果与体重目标、饮食趋势和 AI 教练建议结合。FitSnap Coach 在此基础上扩展到完整健身闭环：

- 饮食：拍照或文字记录餐食，估算卡路里和宏量营养。
- 训练：生成每日/每周训练计划，记录训练完成度。
- 动作：上传照片或视频，评估动作标准度、活动度、节奏和潜在代偿。
- 目标：根据当前体重、目标体重、训练经验和想要练成的效果，持续调整建议。
- 恢复：接入 Apple Health / HealthKit 后，用心率、静息心率、HRV、血氧、睡眠和步数判断恢复压力。

FitSnap Coach 不提供医疗诊断，也不声称能直接测量皮质醇。产品只能用睡眠、HRV、静息心率、训练负荷等指标估算“压力负荷/恢复风险”，并提示用户在异常或不适时咨询专业人士。

## 2. 产品愿景

让用户每天只需要做三件事：拍一下吃了什么、练完上传一段动作、允许系统读取恢复数据。AI 把这些信号合并成一个清晰的下一步建议：今天吃多少、练什么、练到什么强度、是否该休息。

## 3. 目标用户

### 3.1 新手减脂用户

- 目标：降低体脂、建立运动习惯。
- 痛点：不会估算热量，不知道每周练什么，担心动作错误受伤。
- 成功体验：每天知道“还能吃多少”和“今天练哪几个动作”，动作有清楚纠错。

### 3.2 增肌塑形用户

- 目标：增肌、线条、翘臀、V taper、马甲线等视觉效果。
- 痛点：训练计划不够系统，蛋白质不足，动作代偿导致目标肌群没感觉。
- 成功体验：训练计划有渐进超负荷，动作分析能指出目标肌群是否发力不足。

### 3.3 忙碌健康管理用户

- 目标：保持体能、睡眠和压力稳定。
- 痛点：日程碎片化，压力大，训练与恢复冲突。
- 成功体验：系统结合 Apple Health 数据，自动建议今天降低强度或调整训练时间。

## 4. 用户问题

1. 饮食、训练和健康数据分散在多个 App，用户无法得到统一建议。
2. 手动记录卡路里太麻烦，导致坚持率低。
3. 新手动作不标准但缺少即时反馈，容易代偿或受伤。
4. 训练计划通常不根据睡眠、心率和恢复状态调整。
5. 用户知道目标体重，却不知道每天该吃多少、怎么练、何时休息。

## 5. 产品目标

- 让用户在 60 秒内完成一天饮食或训练记录。
- 为每个用户生成个性化每日/每周训练和饮食目标。
- 通过照片/视频给出动作风险、代偿提示和纠正建议。
- 结合 Apple Health 指标生成恢复评分和训练强度建议。
- 在所有 AI 结果中展示置信度、可编辑入口和安全免责声明。

## 6. 非目标

- 不做医疗诊断、疾病预测或药物建议。
- 不直接宣称检测皮质醇、激素水平或疾病风险。
- V1 不替代认证教练、营养师或医生。
- Web MVP 不直接读取 Apple Health；真实 HealthKit 授权需要 iOS 原生 App 或受支持的原生容器。

## 7. 成功指标

### 7.1 激活

- 新用户完成目标设置率：>= 70%
- 首日完成至少一条饮食或训练记录：>= 55%
- 首日上传动作视频/照片：>= 25%

### 7.2 留存与习惯

- D7 留存：>= 35%
- 周训练计划完成率：>= 45%
- 每周 4 天以上记录饮食的用户比例：>= 30%

### 7.3 AI 质量

- 餐食识别后用户编辑率：<= 35%
- 动作分析反馈“有帮助”比例：>= 70%
- 恢复建议被用户采纳率：>= 40%

### 7.4 商业

- 免费到付费转化：>= 6%
- 付费用户月流失：<= 5%

## 8. 核心用户流程

### 8.1 首次使用

1. 用户输入基础资料：年龄、性别、身高、当前体重、目标体重、训练经验、可训练天数。
2. 用户选择想练成的效果：减脂、增肌、线条、力量、翘臀、马甲线、体态改善等。
3. 用户填写饮食偏好、过敏、伤病、器械条件。
4. 系统生成热量目标、宏量营养、每周训练结构和第一天建议。
5. 用户选择是否授权健康数据。

### 8.2 记录餐食

1. 用户拍照或上传餐食照片，也可输入文字。
2. AI 识别食物类别、份量、卡路里和宏量营养。
3. 用户可修正份量或食材。
4. 记录进入当天卡路里和周趋势。
5. AI 根据剩余热量和蛋白质缺口给出下一餐建议。

### 8.3 训练计划与完成

1. 系统展示今日训练：动作、组数、次数、RPE、休息时间。
2. 用户完成训练并记录重量、次数、主观疲劳。
3. 系统根据完成情况调整下一次训练。
4. 若恢复指标差，系统建议降强度、换轻量训练或休息。

### 8.4 动作分析

1. 用户选择动作类型，例如深蹲、硬拉、卧推、俯卧撑、弓步、平板支撑。
2. 用户上传照片或视频。
3. 系统抽帧并识别人体关键点。
4. 系统计算关节角度、对称性、活动度、节奏、稳定性。
5. 输出标准度评分、风险点、可能代偿肌群、纠正提示和下一次拍摄建议。

### 8.5 恢复与健康数据

1. 用户授权 HealthKit 指标：步数、活动能量、运动、心率、静息心率、HRV、睡眠、血氧。
2. 系统计算恢复评分。
3. 若出现睡眠不足、HRV 下降、静息心率升高、训练负荷过高，系统提示压力负荷偏高。
4. 系统调整训练强度和饮食建议。

## 9. 功能范围

### 9.1 P0 功能

- 用户目标设置
- 每日仪表盘
- 卡路里和宏量营养记录
- 每周训练计划生成
- 训练完成记录
- 照片/视频上传与动作分析结果页
- 健康数据授权状态与恢复评分
- AI 今日建议
- AI Coach Agent 工作台：读取本地上下文、生成行动队列、执行打开/完成任务
- 本地数据库持久化：用户资料、餐食、训练、动作分析、健康快照、上传媒体记录
- 周/月用户互动数据可视化

### 9.2 P1 功能

- 真实食物数据库和条形码扫描
- 真实姿态识别模型
- HealthKit 原生接入
- 历史趋势图、体型照片对比
- AI 聊天教练
- 推送通知和习惯提醒

### 9.3 P2 功能

- 教练端后台
- 社区挑战
- 智能购物清单和食谱
- 可穿戴设备扩展：Garmin、Oura、Whoop、Fitbit
- 付费订阅和教练服务市场

## 10. 详细需求

### 10.1 目标设置

字段：

- 年龄
- 生理性别
- 身高
- 当前体重
- 目标体重
- 训练经验
- 每周可训练天数
- 目标体型
- 饮食偏好
- 伤病/禁忌
- 器械条件

规则：

- 使用 Mifflin-St Jeor 估算 BMR。
- 根据活动水平估算 TDEE。
- 减脂目标：TDEE - 300 至 500 kcal。
- 增肌目标：TDEE + 150 至 300 kcal。
- 重组目标：接近 TDEE，蛋白质优先。
- 蛋白质目标：1.6 至 2.2 g/kg。

验收标准：

- 用户保存资料后，系统生成每日热量、蛋白质、碳水、脂肪目标。
- 用户修改当前体重或目标体重后，目标自动重算。

### 10.2 饮食记录

输入：

- 图片上传
- 文字描述
- 餐次
- 手动卡路里和宏量营养修正

输出：

- 食物名称
- 估算份量
- 卡路里
- 蛋白质
- 碳水
- 脂肪
- 置信度
- 建议修正项

验收标准：

- 用户可以添加、编辑、删除餐食。
- 当天总摄入自动汇总。
- AI 建议能引用剩余热量和蛋白质缺口。

### 10.3 训练计划

输入：

- 目标
- 经验
- 可训练天数
- 器械条件
- 伤病限制
- 恢复评分

输出：

- 周计划
- 每日训练类型
- 动作列表
- 组数、次数、RPE、休息时间
- 完成状态

规则：

- 新手以全身训练和动作学习为主。
- 增肌用户按推/拉/腿或上下肢拆分。
- 减脂用户加入低冲击有氧和力量训练。
- 恢复评分低时降低训练量或强度。

验收标准：

- 用户保存目标后，系统生成 7 天训练计划。
- 用户可标记单日完成。
- 完成率在仪表盘展示。

### 10.4 动作分析

支持动作：

- 深蹲
- 硬拉
- 俯卧撑
- 弓步
- 平板支撑
- 卧推
- 划船
- 肩推

分析维度：

- 标准度评分
- 关节角度范围
- 左右对称性
- 节奏和停顿
- 核心稳定性
- 可能代偿：腰椎代偿、膝内扣、耸肩、骨盆前倾、髋主导不足、踝活动度不足
- 风险等级
- 纠正提示

生产级实现建议：

- 视频上传后进入异步分析队列。
- 使用姿态识别模型提取 2D/3D keypoints。
- 针对动作模板计算关键帧和角度。
- 使用规则引擎输出结构化风险。
- 使用多模态 LLM 将结构化结果转成用户可理解建议。

验收标准：

- 用户上传媒体后可以看到预览。
- 点击分析后生成评分、风险和纠正建议。
- UI 明确提示结果为训练辅助，不是医疗诊断。

### 10.5 Apple Health / HealthKit

请求权限：

- 步数
- 活动能量
- 运动记录
- 心率
- 静息心率
- HRV
- 睡眠
- 血氧

恢复评分输入：

- 睡眠时长
- 深睡/REM 趋势
- HRV 与个人基线差异
- 静息心率与个人基线差异
- 训练负荷
- 血氧异常

压力负荷规则：

- 睡眠 < 6 小时：增加压力风险。
- HRV 低于个人 14 天基线 15%：增加压力风险。
- 静息心率高于基线 8 bpm：增加压力风险。
- 连续高强度训练且睡眠不足：建议降强度。
- 血氧持续 < 95%：提示关注恢复，并建议必要时咨询医生。

合规要求：

- 明确说明 HealthKit 数据用途。
- 未经用户许可不得读取或写入。
- 不出售 HealthKit 数据，不用于广告定向。
- 用户可以随时撤销授权和删除数据。
- 不把压力负荷表述为“皮质醇检测结果”。

验收标准：

- 用户能看到授权状态。
- 指标缺失时系统给出可理解的降级建议。
- 恢复评分影响训练建议。

### 10.6 AI 今日建议

输入：

- 目标资料
- 当天摄入
- 周训练完成度
- 动作分析结果
- 健康指标
- 用户反馈

输出：

- 今日最重要的一件事
- 饮食建议
- 训练建议
- 恢复建议
- 风险提示

要求：

- 建议必须具体可执行。
- 必须说明依据，例如“蛋白质还差 42g”。
- 对不确定结果标注置信度。
- 涉及健康异常时建议咨询专业人士。

### 10.7 AI Coach Agent

输入：

- 用户资料与目标
- 当天饮食总量和蛋白质/热量缺口
- 今日训练计划与周完成度
- 最近动作分析评分、风险和代偿
- 健康恢复评分和异常因素
- 用户输入的临时偏好，例如“今天只有 25 分钟”

输出：

- Agent 观察日志：说明读取了哪些数据。
- Agent 推理日志：说明为什么当前优先级这样排序。
- Agent 行动队列：饮食、训练、动作、恢复四类任务。
- 每个任务包含优先级、依据、截止时机、打开位置、完成状态。

规则：

- MVP 端侧本地规则实现，不调用外部 LLM。
- 任务必须可执行，例如“下一餐补 35g 蛋白质”而不是泛泛建议。
- 点击“打开”跳转到对应功能区；点击“完成”写入本地任务状态。
- 训练类任务完成可以同步标记当天训练完成。
- 生产版可将本地规则推理层替换为 LLM/Agent 服务，但必须保留结构化任务 schema、证据字段和安全边界。

验收标准：

- 用户点击运行 Agent 后，能看到观察、推理、行动三段输出。
- Agent 能基于当前数据生成至少 1 个任务，最多展示 4 个主要任务。
- Agent 任务和消息可持久化，刷新页面后仍保留。
- 中英文切换后 Agent 工作台 UI 可切换，任务 schema 不丢失。

## 11. 数据模型

### UserProfile

- id
- name
- age
- sex
- heightCm
- currentWeightKg
- targetWeightKg
- activityLevel
- trainingExperience
- trainingDaysPerWeek
- physiqueGoal
- dietPreference
- injuries
- equipment
- createdAt
- updatedAt

### NutritionTarget

- userId
- calories
- proteinG
- carbsG
- fatG
- mode
- computedAt

### MealLog

- id
- userId
- date
- mealType
- description
- imageUrl
- calories
- proteinG
- carbsG
- fatG
- confidence
- editedByUser
- createdAt

### WorkoutPlan

- id
- userId
- weekStart
- days[]
- generatedFromGoalVersion

### WorkoutDay

- id
- date
- focus
- exercises[]
- intensity
- completed

### ExercisePrescription

- exerciseId
- name
- sets
- reps
- rpe
- restSec
- notes

### FormAnalysis

- id
- userId
- mediaUrl
- exerciseType
- score
- riskLevel
- findings[]
- compensations[]
- corrections[]
- confidence
- createdAt

### HealthMetricSnapshot

- id
- userId
- date
- steps
- activeEnergyKcal
- restingHeartRate
- hrvMs
- sleepHours
- spo2
- workoutLoad
- readinessScore
- stressLoadLabel

### MediaAsset

- id
- userId
- recordType：meal / formAnalysis / healthImport
- recordId
- date
- name
- mimeType
- size
- previewDataUrl：仅保存小图片预览，大视频只保存元数据
- createdAt

### Recommendation

- id
- userId
- date
- priority
- nutritionAdvice
- trainingAdvice
- recoveryAdvice
- evidence[]
- createdAt

### AgentTask

- id
- userId
- date
- type：nutrition / training / recovery / form
- priority：high / medium / low
- status：open / active / done
- title
- body
- evidence
- due
- href
- action
- workoutDate
- createdAt
- updatedAt
- completedAt

### AgentMessage

- id
- userId
- role：user / trace / agent
- label
- content
- createdAt

## 12. 技术方案

### 12.1 MVP Web

- 前端：HTML/CSS/JavaScript 或 React。
- 存储：IndexedDB 为主，LocalStorage 作为兼容备份。
- 媒体：浏览器本地预览，不上传服务器。
- 动作 AI：前端动态加载 TensorFlow.js + MoveNet SinglePose Lightning，优先使用人体关键点检测；模型或关键点不可用时回退到本地规则模拟。
- AI：前端规则模拟教练反馈和 Agent 推理，展示生产级 LLM/Agent 接入点。
- 健康数据：模拟授权和 CSV/JSON 导入。
- 云端打开：MVP 可作为静态网站部署到 Vercel / Netlify / GitHub Pages；部署后通过 HTTPS 打开，浏览器摄像头实时模式可用。
- 云端同步：P0 仍为 local-first，不跨设备同步；生产版需要认证、数据库、对象存储和 API 层。

本地 IndexedDB schema：

- `meta`：当前用户、schema 版本、最近更新时间、健康授权状态。
- `profile`：用户目标资料。
- `nutritionTargets`：当前营养目标。
- `meals`：餐食记录，按 date 建索引。
- `workoutPlan`：训练计划，按 date 建索引。
- `workoutCompletions`：训练完成记录，按 date 建索引。
- `formAnalyses`：动作分析历史，按 date / exerciseType 建索引。
- `healthSnapshots`：健康数据快照，按 date / updatedAt 建索引。
- `mediaAssets`：上传照片/视频元数据和小图预览，按 date / recordType 建索引。
- `agentTasks`：Agent 任务队列，按 date / status / priority 建索引。
- `agentMessages`：Agent 对话与推理日志，按 createdAt / role 建索引。

### 12.1.1 用户互动数据可视化

MVP 提供 “周/月互动趋势” 视图：

- 周视图：最近 7 天。
- 月视图：最近 30 天。
- 可切换指标：热量摄入、蛋白质、训练完成、恢复评分、动作评分、上传次数。
- 鼠标悬停或点击图表点位展示每日明细。
- 右侧展示周期合计、日均、目标达成比例和最近上传记录。
- 图表数据来源于 IndexedDB 中的餐食、训练、动作分析、健康快照和媒体记录。

### 12.1.2 动作检测 MVP 接入

MVP 的动作分析采用混合管线：

- 动态加载 `@tensorflow/tfjs` 和 `@tensorflow-models/pose-detection`。
- 使用 MoveNet SinglePose Lightning 从上传照片或视频首帧提取人体关键点。
- 支持浏览器直接摄像实时预览：通过 `getUserMedia` 打开摄像头，在本地持续识别关键点并叠加骨架。
- 计算膝角、肘角、肩/髋倾斜、躯干前倾、膝踝轨迹、左右对称性。
- 基于动作模板和关键点信号生成标准度评分、风险等级、代偿提示和纠正建议。
- 若模型加载失败、离线、视频帧不可读或关键点置信度不足，自动降级到本地规则引擎。
- 实时摄像仅作为端侧预览，不自动保存每一帧；用户需要上传照片/视频并点击生成反馈后才写入历史记录。
- 当前版本只做端侧浏览器分析，不上传用户视频或照片。

### 12.1.3 Agent MVP 接入

MVP 的 Agent 采用端侧确定性 agent loop：

- Observe：读取 profile、nutritionTarget、meals、workoutPlan、completedWorkoutDates、formAnalyses、health.metrics。
- Reason：根据蛋白质缺口、热量偏差、恢复评分、动作风险、训练完成度和用户临时输入判定优先级。
- Act：生成结构化 AgentTask，并提供打开对应页面锚点或标记完成的执行按钮。
- Memory：AgentMessage 和 AgentTask 写入 IndexedDB；LocalStorage 作为备份。
- Safety：健康异常只做恢复建议和就医提示，不做诊断；媒体和健康数据不上传。

### 12.2 生产级架构

- iOS App：HealthKit 授权、后台刷新、相机拍摄。
- Web/PWA：用户后台和进度查看。
- API：Node.js / Python FastAPI。
- 数据库：PostgreSQL。
- 对象存储：S3 兼容媒体存储。
- 队列：BullMQ / Celery，用于视频分析。
- AI 服务：
  - 多模态模型：餐食识别、训练视频解释。
  - 姿态模型：MediaPipe Pose、MoveNet、OpenPose 或商业 CV 模型。
  - 营养数据库：USDA FoodData Central、本地食物库、品牌食品库。
  - 个性化规则引擎：目标、恢复、训练周期化。

### 12.3 API 草案

- `POST /users/onboarding`
- `GET /dashboard/today`
- `POST /meals/analyze`
- `POST /meals`
- `PATCH /meals/:id`
- `DELETE /meals/:id`
- `POST /workout-plans/generate`
- `PATCH /workout-days/:id/complete`
- `POST /form-analyses`
- `GET /form-analyses/:id`
- `POST /healthkit/import`
- `POST /recommendations/generate`

### 12.4 云端部署与同步路线

#### 12.4.1 静态云部署

目标：让用户像访问 nutrisnap.blog 一样通过 URL 打开产品。

- 部署平台：Vercel、Netlify 或 GitHub Pages。
- 构建方式：静态文件直出，无构建命令。
- 发布目录：项目根目录。
- HTTPS：必须启用，摄像头和未来 PWA 能力需要安全上下文。
- Headers：
  - `Permissions-Policy: camera=(self), microphone=(), geolocation=()`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Content-Type-Options: nosniff`

验收标准：

- 用户可以通过公网 HTTPS URL 打开网站。
- 中英文、IndexedDB、上传、实时摄像、MoveNet 动态加载均能在 HTTPS 下运行。
- 无需本地 `python3 -m http.server`。

#### 12.4.2 云端数据同步

目标：用户换设备后仍能看到目标、餐食、训练、动作分析、健康趋势和 Agent 任务。

推荐架构：

- Auth：Supabase Auth / Clerk / Firebase Auth。
- Database：Supabase Postgres / Neon Postgres / Firestore。
- Object Storage：Supabase Storage / S3 / Cloudflare R2。
- API：Next.js API Routes / FastAPI / serverless functions。
- Jobs：视频分析、餐食识别、Agent 长任务通过队列异步处理。

同步表：

- `users`
- `profiles`
- `nutrition_targets`
- `meal_logs`
- `workout_plans`
- `workout_completions`
- `form_analyses`
- `health_snapshots`
- `media_assets`
- `agent_tasks`
- `agent_messages`

安全要求：

- 每条用户数据必须绑定 `userId` 并做 Row Level Security 或等价授权校验。
- 媒体文件默认私有，使用短期 signed URL 访问。
- 健康数据和动作视频不能用于广告定向。
- AI 训练默认不使用私密数据，除非用户明确 opt-in。

## 13. 隐私、安全与合规

- 默认最小化收集数据。
- 媒体文件需加密存储，并支持自动删除。
- 用户可导出和删除所有个人数据。
- 健康数据与广告系统隔离。
- AI 训练默认不使用用户私密健康/媒体数据，除非用户明确选择加入。
- 对未成年人提供额外限制或不开放。
- 所有健康建议需带免责声明。
- 敏感建议使用保守语气，例如“建议降低强度”，不使用“你有疾病”。

## 14. 风险与缓解

- 餐食估算误差：展示置信度，允许用户编辑，引入数据库校准。
- 动作分析误判：要求多角度拍摄，展示辅助性质，保守输出风险。
- 健康数据误解：避免诊断措辞，强调趋势和专业咨询。
- 用户隐私顾虑：透明授权、数据删除、端侧处理优先。
- 运动伤害：伤病筛查、动作风险提示、必要时建议咨询教练/医生。

## 15. MVP 验收清单

- 用户可以设置目标资料并保存。
- 系统生成热量和宏量营养目标。
- 系统生成一周训练计划。
- 用户可以记录餐食，并看到当天摄入汇总。
- 用户可以上传照片/视频并得到动作分析结果。
- 用户可以模拟授权健康数据，输入或导入健康指标。
- 浏览器端 IndexedDB 保存历史上传记录和用户数据，刷新后可恢复。
- 系统生成恢复评分和压力负荷标签。
- AI 今日建议同时引用营养、训练和恢复数据。
- 用户可以在周/月视图中切换指标并查看交互 tooltip。
- 所有数据刷新后仍保留在本地。
- 页面在桌面和手机视口可用，无明显布局重叠。

## 16. 发布路线

### Phase 0：可点击原型

- Web 单页应用
- 本地存储
- 模拟 AI 分析
- 模拟 HealthKit 数据

### Phase 1：Beta

- 账户系统
- 真实后端
- 餐食图片识别
- 基础姿态识别
- 训练计划个性化

### Phase 2：iOS 与 HealthKit

- iOS 原生 App
- HealthKit 读取
- 本地相机拍摄
- 推送提醒
- 恢复评分基线

### Phase 3：商业化

- 订阅
- 高级动作分析
- 教练协作
- 食谱和购物清单
- 可穿戴设备扩展

## 17. 当前实现范围

本仓库的第一版实现为 Phase 0 Web MVP：

- 不接入真实 AI 或 HealthKit。
- 不把任何媒体上传到服务器。
- 使用浏览器 IndexedDB 保存结构化用户数据，LocalStorage 作为兼容备份。
- 用规则引擎模拟餐食估算、动作分析和恢复建议。
- UI 和数据结构按生产级能力预留扩展点。
