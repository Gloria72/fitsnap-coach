const STORAGE_KEY = "fitsnap-coach-state-v2";
const DB_NAME = "fitsnap-coach-db";
const DB_VERSION = 2;
const CURRENT_USER_ID = "local-user";
const TFJS_URL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
const POSE_DETECTION_URL =
  "https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const today = new Date();
const todayKey = toDateKey(today);
const weekdayLabels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const weekdayLabelsEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaultState = {
  profile: {
    name: "Gloria",
    age: 31,
    sex: "female",
    heightCm: 165,
    currentWeightKg: 62,
    targetWeightKg: 56,
    activityLevel: "moderate",
    trainingExperience: "beginner",
    trainingDaysPerWeek: 4,
    physiqueGoal: "减脂线条",
    dietPreference: "高蛋白、少糖",
    injuries: "",
    equipment: "gym",
  },
  nutritionTarget: null,
  meals: [],
  workoutPlan: [],
  completedWorkoutDates: {},
  formAnalyses: [],
  mediaAssets: [],
  agent: {
    status: "idle",
    lastRunAt: null,
    tasks: [],
    messages: [],
  },
  settings: {
    language: "zh",
  },
  health: {
    authorized: false,
    metrics: {
      sleepHours: 6.7,
      hrvMs: 48,
      restingHeartRate: 62,
      spo2: 97,
      steps: 8200,
      activeEnergyKcal: 430,
      workoutLoad: 62,
    },
    history: [],
    updatedAt: null,
  },
  updatedAt: null,
};

let state = clone(defaultState);
let dbReady = false;
let pendingMealImage = "";
let pendingMealImageName = "";
let pendingMealImageSize = 0;
let pendingFormMedia = null;
let pendingFormMediaUrl = "";
let pendingFormMediaPreview = "";
let liveMotionStream = null;
let liveMotionVideo = null;
let liveMotionCanvas = null;
let liveMotionFrame = 0;
let liveMotionLastInferenceAt = 0;
let liveMotionAnalysis = null;
let poseDetector = null;
let poseModelStatus = "idle";
let poseModelMessage = "";
let visualizationState = {
  period: "week",
  metric: "calories",
  points: [],
  hitRegions: [],
};

const i18n = {
  zh: {
    "brand.subtitle": "AI 健身营养教练",
    "nav.today": "今日",
    "nav.agent": "Agent",
    "nav.insights": "趋势",
    "nav.profile": "目标",
    "nav.nutrition": "饮食",
    "nav.training": "训练",
    "nav.motion": "动作",
    "nav.health": "健康",
    "button.reset": "重置",
    "button.refresh": "刷新",
    "button.language": "EN",
    "button.savePlan": "保存并生成计划",
    "button.estimateMeal": "估算并记录",
    "button.analyzeForm": "生成动作反馈",
    "button.connectHealth": "模拟授权",
    "button.importHealth": "导入 JSON/CSV",
    "button.saveHealth": "保存恢复数据",
    "button.loadPoseModel": "加载 Pose 模型",
    "button.startCamera": "实时摄像",
    "button.stopCamera": "停止摄像",
    "button.runAgent": "运行 Agent",
    "button.sendAgent": "发送",
    "button.openTask": "打开",
    "button.doneTask": "完成",
    "button.rerunAgent": "重新规划",
    "button.markDone": "标记完成",
    "button.recoveryDone": "完成恢复",
    "button.completed": "已完成",
    "confirm.reset": "重置本地演示数据？",
    "status.localSaved": "本地保存",
    "status.loadingDb": "数据库加载中",
    "status.synced": "已同步",
    "status.goalSaved": "目标已保存",
    "status.mealSaved": "餐食已记录",
    "status.mealAdjusted": "餐食已调整",
    "status.mealDeleted": "餐食已删除",
    "status.workoutDone": "训练已完成",
    "status.workoutUndone": "已取消完成",
    "status.formAnalyzed": "动作已分析",
    "status.healthConnected": "已模拟授权",
    "status.healthSaved": "恢复数据已保存",
    "status.healthImported": "健康数据已导入",
    "status.adviceRefreshed": "建议已刷新",
    "status.resetDone": "已重置",
    "status.dbReady": "IndexedDB 已同步",
    "status.storageFallback": "LocalStorage 备份",
    "status.poseIdle": "Pose 模型未加载",
    "status.poseLoading": "Pose 模型加载中",
    "status.poseReady": "MoveNet 已就绪",
    "status.poseFallback": "Pose 模型不可用，已用规则兜底",
    "status.poseAnalyzing": "正在识别关键点",
    "status.cameraLive": "摄像头实时分析中",
    "status.cameraStopped": "摄像头已停止",
    "status.cameraDenied": "摄像头不可用",
    "status.agentReady": "Agent 待命",
    "status.agentRunning": "Agent 思考中",
    "status.agentDone": "Agent 已更新",
    "status.agentTaskDone": "任务已完成",
    "status.agentTaskOpened": "已打开任务位置",
    "title.dashboard": "今日状态",
    "title.readiness": "恢复评分",
    "title.nutrition": "热量与宏量",
    "title.coach": "今日建议",
    "title.motionSnapshot": "动作快照",
    "title.agent": "AI Agent 工作台",
    "title.agentConsole": "Agent 对话",
    "title.agentTasks": "行动队列",
    "title.insights": "周/月互动趋势",
    "title.summary": "数据摘要",
    "title.profile": "目标设置",
    "title.targetSummary": "目标摘要",
    "title.foodLog": "饮食记录",
    "title.mealDetails": "餐食明细",
    "title.training": "训练计划",
    "title.formCheck": "照片/视频动作分析",
    "title.formFeedback": "动作反馈",
    "title.health": "恢复数据",
    "title.recoveryJudgement": "恢复判断",
    "fine.readiness": "压力负荷为训练恢复代理指标，不等同于皮质醇检测或医疗诊断。",
    "fine.healthkit": "Web 版无法直接访问 HealthKit；真实授权需 iOS 原生能力。",
    "fine.form": "MVP 使用文件信息、动作模板和恢复状态生成规则反馈；生产版需接入姿态关键点模型。",
    "fine.formPose": "已接入 MoveNet 关键点检测；低置信度或模型不可用时自动回退到规则分析。",
    "fine.formLive": "实时摄像只做端侧预览，不自动保存每一帧；保存历史请上传照片/视频后生成动作反馈。",
    "label.consumed": "已摄入",
    "label.target": "目标",
    "label.metric": "指标",
    "label.name": "姓名",
    "label.age": "年龄",
    "label.sex": "生理性别",
    "label.height": "身高 cm",
    "label.currentWeight": "当前体重 kg",
    "label.targetWeight": "目标体重 kg",
    "label.activity": "活动水平",
    "label.experience": "训练经验",
    "label.trainingDays": "每周训练天数",
    "label.physique": "想练成的效果",
    "label.diet": "饮食偏好",
    "label.equipment": "器械条件",
    "label.injuries": "伤病或禁忌",
    "label.mealType": "餐次",
    "label.mealDescription": "餐食描述",
    "label.mealPhoto": "餐食照片",
    "label.exercise": "动作",
    "label.cameraAngle": "拍摄角度",
    "label.formMedia": "照片或视频",
    "label.sleep": "睡眠小时",
    "label.hrv": "HRV ms",
    "label.rhr": "静息心率",
    "label.spo2": "血氧 %",
    "label.steps": "步数",
    "label.activeEnergy": "活动能量 kcal",
    "label.workoutLoad": "训练负荷 0-100",
    "placeholder.diet": "高蛋白、少乳制品、素食...",
    "placeholder.injuries": "膝盖不适、腰椎间盘、肩撞击...",
    "placeholder.meal": "鸡胸肉饭、牛油果沙拉、拿铁...",
    "placeholder.noPhoto": "未选择照片",
    "placeholder.choosePhoto": "选择照片",
    "placeholder.noMedia": "尚未上传照片/视频",
    "placeholder.chooseMedia": "上传照片/视频",
    "placeholder.noMeals": "今天还没有餐食记录",
    "placeholder.noAnalysis": "上传照片或视频后生成动作反馈",
    "placeholder.noUploads": "上传照片/视频后，这里会记录最近媒体数据。",
    "placeholder.agentPrompt": "告诉 Agent：今天时间不多、想练臀腿、晚餐怎么吃...",
    "placeholder.noAgentTasks": "运行 Agent 后会生成今日行动队列。",
    "placeholder.noAgentMessages": "我是你的本地 AI Coach Agent。运行后会读取目标、饮食、训练、动作和恢复数据，再给出下一步。",
    "alert.mealRequired": "请添加餐食描述或照片。",
    "alert.formRequired": "请先上传动作照片或视频。",
    "alert.cameraUnsupported": "当前浏览器不支持直接调用摄像头。",
    "alert.cameraFailed": "无法开启摄像头：{message}",
    "alert.importFailed": "导入失败：{message}",
    "analysis.model": "分析引擎",
    "analysis.poseEngine": "MoveNet Pose",
    "analysis.ruleEngine": "规则兜底",
    "analysis.keypointConfidence": "关键点置信度 {value}%",
    "analysis.poseMissing": "未检测到稳定人体关键点，建议使用全身入镜、光线更好的侧面或正面素材。",
    "analysis.poseDetected": "检测到 {count} 个有效人体关键点，平均置信度 {confidence}%。",
    "analysis.livePreview": "实时预览",
    "analysis.liveWaiting": "等待稳定人体关键点，请保持全身入镜并提高光线。",
    "period.week": "周",
    "period.month": "月",
    "range.week": "最近 7 天",
    "range.month": "最近 30 天",
    "chart.target": "目标",
    "chart.total": "周期合计",
    "chart.average": "日均",
    "chart.vsTarget": "对目标",
    "chart.bestDay": "最高日",
    "chart.empty": "还没有足够历史数据，记录餐食、训练或恢复后会自动出现趋势。",
    "chart.help": "把鼠标移到图表上可查看每日明细。",
    "chart.tooltip": "{metric}：{value}<br />餐食 {meals} 条 · 上传 {uploads} 次",
    "section.recentUploads": "Recent Uploads",
    "unit.times": "次",
    "unit.points": "分",
    "unit.items": "条",
    "metric.calories": "热量摄入",
    "metric.protein": "蛋白质",
    "metric.workouts": "训练完成",
    "metric.readiness": "恢复评分",
    "metric.formScore": "动作评分",
    "metric.uploads": "上传次数",
    "macro.protein": "蛋白质",
    "macro.carbs": "碳水",
    "macro.fat": "脂肪",
    "summary.dailyCalories": "每日热量",
    "summary.protein": "蛋白质",
    "summary.tdee": "TDEE",
    "summary.weightDelta": "目标差值",
    "summary.cutPace": "建议每周下降 0.3-0.6kg",
    "summary.bulkPace": "建议每周上升 0.1-0.25kg",
    "summary.recompPace": "建议围度和力量同步观察",
    "summary.profile": "{name} 的当前策略为 {mode}。{pace}，每周训练 {days} 天。",
    "summary.macros": "碳水 {carbs}g，脂肪 {fat}g；饮食偏好：{diet}。",
    "health.interpret.good": "可以按计划训练，注意不要因为状态好而一次性增加过多训练量。",
    "health.interpret.medium": "训练可继续，但建议控制 RPE，优先保证动作质量和睡眠窗口。",
    "health.interpret.low": "今天更适合降强度或做主动恢复；若血氧、心率持续异常，请咨询专业人士。",
    "health.interpret.rest": "建议休息或轻活动，避免高强度训练；若伴随不适，优先寻求医疗建议。",
    "coach.priority": "优先级",
    "coach.training": "训练",
    "coach.form": "动作",
    "coach.recovery": "恢复",
    "coach.proteinGap": "下一餐补 {proteinGap}g 左右蛋白质，热量还{calorieText}。",
    "coach.calorieLeft": "剩 {value} kcal",
    "coach.calorieOver": "超 {value} kcal",
    "coach.overCalories": "晚间选择低脂高纤维食物，明天不需要极端节食，回到目标热量即可。",
    "coach.stableNutrition": "今天营养节奏稳定，保持蛋白质优先和蔬菜体积感。",
    "coach.lowReadiness": "恢复评分偏低，今日训练降到 RPE 6，保留动作练习和轻有氧。",
    "coach.todayPlan": "今日安排 {focus}，主动作保持 {intensity}，组间休息约 {rest}。",
    "coach.formIssue": "{exercise} 先处理 {compensation}，下一组用更轻重量拍 {angle}角度。",
    "coach.recoveryFactor": "{factor} 是当前主要压力信号，今晚把睡眠窗口提前 30 分钟。",
    "coach.recoveryStable": "恢复指标可训练，睡前保持固定放松流程以稳定 HRV。",
    "auth.authorized": "已授权",
    "auth.unauthorized": "未授权",
    "meal.count": "{count} 条",
    "training.progress": "{done}/{total} 完成",
    "analysis.confidence": "置信度 {value}%",
    "risk.low": "低风险",
    "risk.medium": "中等风险",
    "risk.high": "高风险",
    "readiness.good": "恢复良好",
    "readiness.medium": "压力适中",
    "readiness.high": "压力偏高",
    "readiness.rest": "建议主动恢复",
    "mode.cut": "稳态减脂",
    "mode.bulk": "轻盈增肌",
    "mode.recomp": "体态重组",
    "media.meal": "餐食照片",
    "media.formAnalysis": "动作媒体",
    "media.file": "上传文件",
    "agent.observe": "观察",
    "agent.reason": "推理",
    "agent.act": "行动",
    "agent.priority.high": "高优先级",
    "agent.priority.medium": "中优先级",
    "agent.priority.low": "低优先级",
    "agent.status.open": "待处理",
    "agent.status.active": "进行中",
    "agent.status.done": "已完成",
    "agent.evidence": "依据",
  },
  en: {
    "brand.subtitle": "AI fitness and nutrition coach",
    "nav.today": "Today",
    "nav.agent": "Agent",
    "nav.insights": "Trends",
    "nav.profile": "Goals",
    "nav.nutrition": "Nutrition",
    "nav.training": "Training",
    "nav.motion": "Form",
    "nav.health": "Health",
    "button.reset": "Reset",
    "button.refresh": "Refresh",
    "button.language": "中",
    "button.savePlan": "Save and build plan",
    "button.estimateMeal": "Estimate and log",
    "button.analyzeForm": "Generate form feedback",
    "button.connectHealth": "Simulate access",
    "button.importHealth": "Import JSON/CSV",
    "button.saveHealth": "Save recovery data",
    "button.loadPoseModel": "Load pose model",
    "button.startCamera": "Live camera",
    "button.stopCamera": "Stop camera",
    "button.runAgent": "Run agent",
    "button.sendAgent": "Send",
    "button.openTask": "Open",
    "button.doneTask": "Done",
    "button.rerunAgent": "Replan",
    "button.markDone": "Mark done",
    "button.recoveryDone": "Finish recovery",
    "button.completed": "Completed",
    "confirm.reset": "Reset local demo data?",
    "status.localSaved": "Saved locally",
    "status.loadingDb": "Loading database",
    "status.synced": "Synced",
    "status.goalSaved": "Goals saved",
    "status.mealSaved": "Meal logged",
    "status.mealAdjusted": "Meal adjusted",
    "status.mealDeleted": "Meal deleted",
    "status.workoutDone": "Workout completed",
    "status.workoutUndone": "Workout unchecked",
    "status.formAnalyzed": "Form analyzed",
    "status.healthConnected": "Access simulated",
    "status.healthSaved": "Recovery data saved",
    "status.healthImported": "Health data imported",
    "status.adviceRefreshed": "Advice refreshed",
    "status.resetDone": "Reset complete",
    "status.dbReady": "IndexedDB synced",
    "status.storageFallback": "LocalStorage fallback",
    "status.poseIdle": "Pose model not loaded",
    "status.poseLoading": "Loading pose model",
    "status.poseReady": "MoveNet ready",
    "status.poseFallback": "Pose model unavailable; using rule fallback",
    "status.poseAnalyzing": "Detecting keypoints",
    "status.cameraLive": "Live camera analyzing",
    "status.cameraStopped": "Camera stopped",
    "status.cameraDenied": "Camera unavailable",
    "status.agentReady": "Agent ready",
    "status.agentRunning": "Agent thinking",
    "status.agentDone": "Agent updated",
    "status.agentTaskDone": "Task completed",
    "status.agentTaskOpened": "Task location opened",
    "title.dashboard": "Today",
    "title.readiness": "Readiness Score",
    "title.nutrition": "Calories and Macros",
    "title.coach": "Today's Guidance",
    "title.motionSnapshot": "Form Snapshot",
    "title.agent": "AI Agent Workspace",
    "title.agentConsole": "Agent Console",
    "title.agentTasks": "Action Queue",
    "title.insights": "Weekly / Monthly Trends",
    "title.summary": "Data Summary",
    "title.profile": "Goal Setup",
    "title.targetSummary": "Target Summary",
    "title.foodLog": "Food Log",
    "title.mealDetails": "Meal Details",
    "title.training": "Training Plan",
    "title.formCheck": "Photo / Video Form Check",
    "title.formFeedback": "Form Feedback",
    "title.health": "Recovery Data",
    "title.recoveryJudgement": "Recovery Readout",
    "fine.readiness": "Stress load is a recovery proxy for training, not a cortisol test or medical diagnosis.",
    "fine.healthkit": "The web MVP cannot directly access HealthKit; real authorization requires native iOS support.",
    "fine.form": "This MVP uses file metadata, movement templates, and recovery state; production needs pose keypoint models.",
    "fine.formPose": "MoveNet keypoint detection is integrated; low-confidence or unavailable model runs fall back to rule analysis.",
    "fine.formLive": "Live camera mode is an on-device preview and does not save every frame. Upload a photo/video and generate feedback to save history.",
    "label.consumed": "Consumed",
    "label.target": "Target",
    "label.metric": "Metric",
    "label.name": "Name",
    "label.age": "Age",
    "label.sex": "Biological sex",
    "label.height": "Height cm",
    "label.currentWeight": "Current weight kg",
    "label.targetWeight": "Target weight kg",
    "label.activity": "Activity level",
    "label.experience": "Training experience",
    "label.trainingDays": "Training days per week",
    "label.physique": "Desired outcome",
    "label.diet": "Diet preferences",
    "label.equipment": "Equipment",
    "label.injuries": "Injuries or limits",
    "label.mealType": "Meal",
    "label.mealDescription": "Meal description",
    "label.mealPhoto": "Meal photo",
    "label.exercise": "Exercise",
    "label.cameraAngle": "Camera angle",
    "label.formMedia": "Photo or video",
    "label.sleep": "Sleep hours",
    "label.hrv": "HRV ms",
    "label.rhr": "Resting heart rate",
    "label.spo2": "Blood oxygen %",
    "label.steps": "Steps",
    "label.activeEnergy": "Active energy kcal",
    "label.workoutLoad": "Training load 0-100",
    "placeholder.diet": "High protein, low dairy, vegetarian...",
    "placeholder.injuries": "Knee discomfort, lumbar disc, shoulder impingement...",
    "placeholder.meal": "Chicken bowl, avocado salad, latte...",
    "placeholder.noPhoto": "No photo selected",
    "placeholder.choosePhoto": "Choose photo",
    "placeholder.noMedia": "No photo/video uploaded",
    "placeholder.chooseMedia": "Upload photo/video",
    "placeholder.noMeals": "No meals logged today",
    "placeholder.noAnalysis": "Upload a photo or video to generate feedback",
    "placeholder.noUploads": "Recent uploads will appear here after you add photos or videos.",
    "placeholder.agentPrompt": "Tell the agent: I only have 25 minutes today, want glutes, need dinner ideas...",
    "placeholder.noAgentTasks": "Run the agent to generate today's action queue.",
    "placeholder.noAgentMessages": "I am your local AI Coach Agent. Run me and I will read goals, meals, training, form, and recovery data before choosing the next step.",
    "alert.mealRequired": "Please add a meal description or photo.",
    "alert.formRequired": "Please upload a form photo or video first.",
    "alert.cameraUnsupported": "This browser does not support direct camera access.",
    "alert.cameraFailed": "Unable to start the camera: {message}",
    "alert.importFailed": "Import failed: {message}",
    "analysis.model": "Analysis engine",
    "analysis.poseEngine": "MoveNet Pose",
    "analysis.ruleEngine": "Rule fallback",
    "analysis.keypointConfidence": "{value}% keypoint confidence",
    "analysis.poseMissing": "No stable body keypoints were detected. Try full-body framing, better lighting, and a clearer side or front angle.",
    "analysis.poseDetected": "Detected {count} reliable body keypoints with {confidence}% average confidence.",
    "analysis.livePreview": "Live preview",
    "analysis.liveWaiting": "Waiting for stable body keypoints. Keep the full body in frame and improve lighting.",
    "period.week": "Week",
    "period.month": "Month",
    "range.week": "Last 7 days",
    "range.month": "Last 30 days",
    "chart.target": "Target",
    "chart.total": "Period total",
    "chart.average": "Daily avg",
    "chart.vsTarget": "Vs target",
    "chart.bestDay": "Best day",
    "chart.empty": "Not enough history yet. Log meals, workouts, or recovery to build trends.",
    "chart.help": "Hover the chart to inspect daily details.",
    "chart.tooltip": "{metric}: {value}<br />Meals {meals} · Uploads {uploads}",
    "section.recentUploads": "Recent Uploads",
    "unit.times": "x",
    "unit.points": "pts",
    "unit.items": "items",
    "metric.calories": "Calories",
    "metric.protein": "Protein",
    "metric.workouts": "Workouts",
    "metric.readiness": "Readiness",
    "metric.formScore": "Form score",
    "metric.uploads": "Uploads",
    "macro.protein": "Protein",
    "macro.carbs": "Carbs",
    "macro.fat": "Fat",
    "summary.dailyCalories": "Daily calories",
    "summary.protein": "Protein",
    "summary.tdee": "TDEE",
    "summary.weightDelta": "Weight delta",
    "summary.cutPace": "Aim to lose 0.3-0.6kg per week",
    "summary.bulkPace": "Aim to gain 0.1-0.25kg per week",
    "summary.recompPace": "Track measurements and strength together",
    "summary.profile": "{name}'s current strategy is {mode}. {pace}, with {days} training days per week.",
    "summary.macros": "Carbs {carbs}g, fat {fat}g; diet preference: {diet}.",
    "health.interpret.good": "You can train as planned. Avoid adding too much volume just because readiness is good.",
    "health.interpret.medium": "Training can continue, but keep RPE controlled and protect your sleep window.",
    "health.interpret.low": "Today is better for lower intensity or active recovery. If oxygen or heart-rate issues persist, consult a professional.",
    "health.interpret.rest": "Rest or light movement is recommended. If you feel unwell, seek medical guidance.",
    "coach.priority": "Priority",
    "coach.training": "Training",
    "coach.form": "Form",
    "coach.recovery": "Recovery",
    "coach.proteinGap": "Add about {proteinGap}g protein at your next meal; calories are still {calorieText}.",
    "coach.calorieLeft": "{value} kcal under target",
    "coach.calorieOver": "{value} kcal over target",
    "coach.overCalories": "Choose lower-fat, higher-fiber foods tonight. No crash dieting tomorrow, just return to target.",
    "coach.stableNutrition": "Nutrition rhythm looks steady. Keep protein first and use vegetables for volume.",
    "coach.lowReadiness": "Readiness is low. Keep today's session at RPE 6 with technique work and light cardio.",
    "coach.todayPlan": "Today's plan is {focus}. Keep main work at {intensity}, with about {rest} between sets.",
    "coach.formIssue": "For {exercise}, address {compensation} first. Use lighter load and film from the {angle} angle next set.",
    "coach.recoveryFactor": "{factor} is the main stress signal. Move your sleep window 30 minutes earlier tonight.",
    "coach.recoveryStable": "Recovery supports training. Keep a consistent bedtime wind-down to stabilize HRV.",
    "auth.authorized": "Authorized",
    "auth.unauthorized": "Not authorized",
    "meal.count": "{count} logs",
    "training.progress": "{done}/{total} done",
    "analysis.confidence": "{value}% confidence",
    "risk.low": "Low risk",
    "risk.medium": "Medium risk",
    "risk.high": "High risk",
    "readiness.good": "Ready",
    "readiness.medium": "Moderate load",
    "readiness.high": "High load",
    "readiness.rest": "Active recovery",
    "mode.cut": "Sustainable cut",
    "mode.bulk": "Lean gain",
    "mode.recomp": "Body recomposition",
    "media.meal": "Meal photo",
    "media.formAnalysis": "Form media",
    "media.file": "Uploaded file",
    "agent.observe": "Observe",
    "agent.reason": "Reason",
    "agent.act": "Act",
    "agent.priority.high": "High priority",
    "agent.priority.medium": "Medium priority",
    "agent.priority.low": "Low priority",
    "agent.status.open": "Open",
    "agent.status.active": "Active",
    "agent.status.done": "Done",
    "agent.evidence": "Evidence",
  },
};

const phraseTranslations = {
  en: {
    "女性": "Female",
    "男性": "Male",
    "久坐": "Sedentary",
    "轻度活动": "Lightly active",
    "中等活动": "Moderately active",
    "高活动": "Highly active",
    "新手": "Beginner",
    "有基础": "Intermediate",
    "进阶": "Advanced",
    "减脂线条": "Fat loss and definition",
    "增肌塑形": "Muscle gain and shape",
    "体态改善": "Posture improvement",
    "力量提升": "Strength gain",
    "马甲线核心": "Defined core",
    "翘臀下肢": "Glutes and lower body",
    "居家": "Home",
    "健身房": "Gym",
    "徒手/弹力带": "Bodyweight / bands",
    "早餐": "Breakfast",
    "午餐": "Lunch",
    "晚餐": "Dinner",
    "加餐": "Snack",
    "侧面": "side",
    "正面": "front",
    "45 度": "45-degree",
    "鸡胸肉糙米饭": "Chicken and brown rice bowl",
    "牛肉藜麦碗": "Beef quinoa bowl",
    "三文鱼沙拉": "Salmon salad",
    "燕麦酸奶水果": "Oats, yogurt, and fruit",
    "拿铁与点心": "Latte and pastry",
    "蛋白奶昔": "Protein shake",
    "混合餐盘": "Mixed plate",
    "手动餐食": "Manual meal",
    "高蛋白、少糖": "High protein, low sugar",
    "稳态减脂": "Sustainable cut",
    "轻盈增肌": "Lean gain",
    "体态重组": "Body recomposition",
    "深蹲": "Squat",
    "硬拉": "Deadlift",
    "俯卧撑": "Push-up",
    "弓步": "Lunge",
    "平板支撑": "Plank",
    "卧推": "Bench press",
    "划船": "Row",
    "肩推": "Shoulder press",
    "全身基础": "Full-body basics",
    "臀腿核心": "Glutes, legs, and core",
    "上肢体态": "Upper body posture",
    "全身代谢": "Full-body conditioning",
    "全身力量": "Full-body strength",
    "低冲击有氧": "Low-impact cardio",
    "上肢力量": "Upper-body strength",
    "代谢循环": "Conditioning circuit",
    "下肢臀腿": "Lower-body glutes",
    "上肢推拉": "Upper push / pull",
    "全身容量": "Full-body volume",
    "推": "Push",
    "拉": "Pull",
    "腿": "Legs",
    "上肢": "Upper body",
    "下肢": "Lower body",
    "核心体态": "Core and posture",
    "主动恢复": "Active recovery",
    "轻活动": "Light activity",
    "正常": "Normal",
    "降强度": "Reduced intensity",
    "恢复": "Recovery",
    "指标稳定": "Metrics stable",
    "恢复良好": "Ready",
    "压力适中": "Moderate load",
    "压力偏高": "High load",
    "建议主动恢复": "Active recovery recommended",
    "睡眠明显不足": "Sleep is clearly low",
    "睡眠略少": "Sleep is slightly low",
    "HRV 低于理想区间": "HRV is below target range",
    "HRV 偏低": "HRV is low",
    "静息心率偏高": "Resting heart rate is high",
    "静息心率略高": "Resting heart rate is slightly high",
    "血氧偏低": "Blood oxygen is low",
    "训练负荷偏高": "Training load is high",
    "训练负荷较高": "Training load is elevated",
    "日常活动偏少": "Daily movement is low",
    "膝内扣": "knee valgus",
    "腰椎代偿": "lumbar compensation",
    "踝活动度不足": "limited ankle mobility",
    "腘绳肌张力不足": "hamstring tension deficit",
    "背阔肌参与不足": "limited lat engagement",
    "肩前侧压力": "anterior shoulder stress",
    "核心抗伸展不足": "limited anti-extension control",
    "臀中肌不足": "weak glute medius",
    "足弓塌陷": "arch collapse",
    "髋稳定不足": "limited hip stability",
    "髋屈肌抢力": "hip flexor dominance",
    "肩颈紧张": "neck and shoulder tension",
    "前三角代偿": "front-delt compensation",
    "肩胛控制不足": "limited scapular control",
    "左右发力不均": "left-right force asymmetry",
    "上斜方肌代偿": "upper-trap compensation",
    "核心稳定不足": "limited core stability",
    "上斜方肌紧张": "upper-trap tension",
    "肩胛上旋不足": "limited scapular upward rotation",
    "今天": "Today",
    "视频": "Video",
    "照片": "Photo",
    "未填写": "Not set",
    "髋膝同步下降": "hip and knee descend together",
    "底部核心张力": "core tension at the bottom",
    "膝盖轨迹": "knee tracking",
    "脊柱中立": "neutral spine",
    "杠铃路径": "bar path",
    "髋主导": "hip dominance",
    "肩胛控制": "scapular control",
    "核心直线": "straight trunk line",
    "肘部角度": "elbow angle",
    "骨盆位置": "pelvis position",
    "肩肘堆叠": "shoulder-elbow stack",
    "呼吸控制": "breathing control",
    "下蹲末端膝盖略内扣": "knees drift inward near the bottom",
    "底部骨盆控制需要更稳定": "pelvic control needs more stability at the bottom",
    "脚跟压力分布偏前": "heel pressure shifts too far forward",
    "启动时髋部略先抬": "hips rise slightly early at the start",
    "锁定时肋骨外翻": "ribs flare at lockout",
    "杠铃离身体偏远": "bar path is too far from the body",
    "后半程髋部下沉": "hips drop in the second half",
    "肘部外展角度偏大": "elbows flare too wide",
    "肩胛前伸不充分": "scapular protraction is incomplete",
    "前腿膝盖内移": "front knee drifts inward",
    "后侧髋屈肌紧张": "rear hip flexor looks tight",
    "骨盆轻微旋转": "pelvis rotates slightly",
    "后 20 秒骨盆前倾": "pelvis tilts forward in the final 20 seconds",
    "颈部略过度伸展": "neck is slightly overextended",
    "腹压维持不足": "bracing is not maintained",
    "底部肩胛稳定不足": "scapular stability is limited at the bottom",
    "手腕略后折": "wrists extend slightly backward",
    "推起时右侧稍慢": "right side presses slightly slower",
    "末端耸肩": "shoulders shrug at the end range",
    "下放速度偏快": "eccentric phase is too fast",
    "躯干轻微晃动": "torso sways slightly",
    "推到顶端肋骨外翻": "ribs flare at the top",
    "左侧上推路径偏外": "left press path drifts outward",
    "核心稳定略不足": "core stability is slightly limited",
    "降低 10% 负重，做 3 组暂停深蹲": "Reduce load by 10% and do 3 sets of pause squats",
    "热身加入踝背屈和臀中肌激活": "Add ankle dorsiflexion and glute med activation to warm-up",
    "每次下降保持膝盖指向第二脚趾": "Keep knees tracking toward the second toe on every descent",
    "先练壶铃硬拉找髋铰链": "Use kettlebell deadlifts to groove the hip hinge first",
    "拉起前把腋下夹紧": "Tighten the armpits before pulling",
    "每组前 2 次使用 3 秒离心": "Use a 3-second eccentric for the first 2 reps of each set",
    "改为上斜俯卧撑保持躯干直线": "Switch to incline push-ups and keep the trunk straight",
    "肘部维持 30-45 度": "Keep elbows at 30-45 degrees",
    "每组结束加 8 次肩胛俯卧撑": "Add 8 scapular push-ups after each set",
    "先做分腿蹲静止 2 秒": "Start with split squats and hold 2 seconds",
    "脚掌三点支撑": "Keep tripod foot pressure",
    "加入侧向弹力带走 2 组": "Add 2 sets of lateral band walks",
    "缩短到 25 秒高质量组": "Shorten to high-quality 25-second sets",
    "呼气时收肋骨": "Exhale and bring the ribs down",
    "每次保持头颈与躯干一条线": "Keep head, neck, and torso aligned",
    "空杠热身加入停顿卧推": "Add pause bench reps with the empty bar",
    "手腕保持中立": "Keep wrists neutral",
    "重量下降 5% 做左右速度一致": "Drop load by 5% and match left-right speed",
    "先下沉肩胛再拉": "Depress the shoulder blades before pulling",
    "离心 3 秒": "Use a 3-second eccentric",
    "胸托划船替代一周": "Use chest-supported rows for one week",
    "改为半跪姿单臂推举": "Switch to half-kneeling single-arm press",
    "收肋骨后再发力": "Set the ribs down before pressing",
    "每组保留 2 次余力": "Keep 2 reps in reserve",
    "杯式深蹲": "Goblet squat",
    "坐姿划船": "Seated row",
    "弹力带划船": "Band row",
    "上斜俯卧撑": "Incline push-up",
    "罗马尼亚硬拉": "Romanian deadlift",
    "臀桥": "Glute bridge",
    "分腿蹲": "Split squat",
    "死虫": "Dead bug",
    "高位下拉": "Lat pulldown",
    "弹力带下拉": "Band pulldown",
    "哑铃肩推": "Dumbbell shoulder press",
    "面拉": "Face pull",
    "深蹲到推举": "Squat to press",
    "登山跑": "Mountain climber",
    "杠铃深蹲": "Barbell squat",
    "壶铃硬拉": "Kettlebell deadlift",
    "坡度快走": "Incline walk",
    "髋屈肌拉伸": "Hip flexor stretch",
    "呼吸训练": "Breathing drill",
    "壶铃摆动": "Kettlebell swing",
    "反向弓步": "Reverse lunge",
    "农夫走": "Farmer carry",
    "臀推": "Hip thrust",
    "单腿臀桥": "Single-leg glute bridge",
    "腿举": "Leg press",
    "保加利亚分腿蹲": "Bulgarian split squat",
    "小腿提踵": "Calf raise",
    "哑铃卧推": "Dumbbell bench press",
    "胸托划船": "Chest-supported row",
    "前蹲": "Front squat",
    "硬拉变式": "Deadlift variation",
    "核心抗旋转": "Anti-rotation core",
    "引体或下拉": "Pull-up or pulldown",
    "杠铃划船": "Barbell row",
    "二头弯举": "Biceps curl",
    "上斜卧推": "Incline bench press",
    "侧平举": "Lateral raise",
    "腿弯举": "Leg curl",
    "鸟狗": "Bird dog",
    "绳索下压": "Cable pressdown",
    "Zone 2 快走": "Zone 2 brisk walk",
    "髋/胸椎活动": "Hip / thoracic mobility",
    "睡前放松": "Bedtime downshift",
    "核心紧": "core tight",
    "鼻吸可说话": "nasal breathing, able to talk",
    "不追求疼痛": "do not chase pain",
    "慢呼吸": "slow breathing",
    "控制呼吸": "control breathing",
    "肩胛稳定": "scapular stability",
    "低冲击可替换": "low-impact option available",
    "保持骨盆": "keep pelvis steady",
    "停顿": "pause",
    "肩胛": "scapula",
    "稳定": "stability",
    "控制": "controlled",
    "慢速": "slow tempo",
    "肩线": "shoulder line",
    "骨盆稳定": "pelvic stability",
    "腘绳肌": "hamstrings",
    "放松": "relax",
    "鼻吸慢呼": "nasal inhale, slow exhale",
    "肋骨下沉": "ribs down",
    "关键点置信度偏低": "Keypoint confidence is low",
    "重新拍摄时保持全身入镜并提高光线": "Retake with full-body framing and better lighting",
    "左右膝角差异偏大": "Left-right knee angle difference is high",
    "降低速度，先做左右对称的控制组": "Slow down and start with controlled symmetrical reps",
    "肩线左右高度不一致": "Shoulder height is uneven",
    "下一组先做肩胛定位，再开始主动作": "Set the shoulder blades before starting the next set",
    "髋部左右高度不一致": "Hip height is uneven",
    "加入单侧稳定练习，保持骨盆水平": "Add unilateral stability work and keep the pelvis level",
    "膝盖与脚踝轨迹偏差较大": "Knee and ankle tracking differ too much",
    "保持脚掌三点支撑，膝盖跟随脚尖方向": "Keep tripod foot pressure and track knees with toes",
    "躯干前倾角度偏大": "Torso lean is high",
    "髋主导不足": "limited hip dominance",
    "减少负重，练习暂停下蹲和髋踝活动度": "Reduce load and practice pause squats plus hip/ankle mobility",
    "核心直线需要更稳定": "Core line needs more stability",
    "缩短每组时间，保持肋骨下沉和骨盆中立": "Shorten each set and keep ribs down with a neutral pelvis",
    "左右肘角差异偏大": "Left-right elbow angle difference is high",
    "降低重量，保持左右速度一致": "Reduce load and keep left-right speed consistent",
    "关键点轨迹整体稳定": "Keypoint path is generally stable",
    "保持当前重量，下一组继续用同角度复拍": "Keep the current load and film the next set from the same angle",
  },
};

const foodProfiles = [
  {
    name: "鸡胸肉糙米饭",
    keywords: ["鸡胸", "鸡肉", "chicken", "糙米", "健身餐"],
    calories: 520,
    proteinG: 46,
    carbsG: 55,
    fatG: 12,
  },
  {
    name: "牛肉藜麦碗",
    keywords: ["牛肉", "beef", "藜麦", "牛排"],
    calories: 650,
    proteinG: 48,
    carbsG: 58,
    fatG: 22,
  },
  {
    name: "三文鱼沙拉",
    keywords: ["三文鱼", "salmon", "沙拉", "salad"],
    calories: 470,
    proteinG: 34,
    carbsG: 22,
    fatG: 27,
  },
  {
    name: "燕麦酸奶水果",
    keywords: ["燕麦", "酸奶", "oat", "yogurt", "水果"],
    calories: 390,
    proteinG: 24,
    carbsG: 54,
    fatG: 9,
  },
  {
    name: "拿铁与点心",
    keywords: ["拿铁", "latte", "咖啡", "蛋糕", "饼干", "甜点"],
    calories: 360,
    proteinG: 9,
    carbsG: 42,
    fatG: 16,
  },
  {
    name: "蛋白奶昔",
    keywords: ["奶昔", "蛋白粉", "protein", "shake"],
    calories: 260,
    proteinG: 32,
    carbsG: 18,
    fatG: 6,
  },
];

const exerciseProfiles = {
  squat: {
    label: "深蹲",
    bestAngle: "side",
    focus: "下肢力量",
    findings: ["髋膝同步下降", "底部核心张力", "膝盖轨迹"],
    issues: ["下蹲末端膝盖略内扣", "底部骨盆控制需要更稳定", "脚跟压力分布偏前"],
    compensations: ["膝内扣", "腰椎代偿", "踝活动度不足"],
    corrections: ["降低 10% 负重，做 3 组暂停深蹲", "热身加入踝背屈和臀中肌激活", "每次下降保持膝盖指向第二脚趾"],
  },
  deadlift: {
    label: "硬拉",
    bestAngle: "side",
    focus: "髋铰链",
    findings: ["脊柱中立", "杠铃路径", "髋主导"],
    issues: ["启动时髋部略先抬", "锁定时肋骨外翻", "杠铃离身体偏远"],
    compensations: ["腰椎代偿", "腘绳肌张力不足", "背阔肌参与不足"],
    corrections: ["先练壶铃硬拉找髋铰链", "拉起前把腋下夹紧", "每组前 2 次使用 3 秒离心"],
  },
  pushup: {
    label: "俯卧撑",
    bestAngle: "side",
    focus: "上肢推",
    findings: ["肩胛控制", "核心直线", "肘部角度"],
    issues: ["后半程髋部下沉", "肘部外展角度偏大", "肩胛前伸不充分"],
    compensations: ["腰椎代偿", "肩前侧压力", "核心抗伸展不足"],
    corrections: ["改为上斜俯卧撑保持躯干直线", "肘部维持 30-45 度", "每组结束加 8 次肩胛俯卧撑"],
  },
  lunge: {
    label: "弓步",
    bestAngle: "front",
    focus: "单腿稳定",
    findings: ["左右对称", "膝盖轨迹", "骨盆水平"],
    issues: ["前腿膝盖内移", "后侧髋屈肌紧张", "骨盆轻微旋转"],
    compensations: ["臀中肌不足", "足弓塌陷", "髋稳定不足"],
    corrections: ["先做分腿蹲静止 2 秒", "脚掌三点支撑", "加入侧向弹力带走 2 组"],
  },
  plank: {
    label: "平板支撑",
    bestAngle: "side",
    focus: "核心稳定",
    findings: ["骨盆位置", "肩肘堆叠", "呼吸控制"],
    issues: ["后 20 秒骨盆前倾", "颈部略过度伸展", "腹压维持不足"],
    compensations: ["腰椎代偿", "髋屈肌抢力", "肩颈紧张"],
    corrections: ["缩短到 25 秒高质量组", "呼气时收肋骨", "每次保持头颈与躯干一条线"],
  },
  bench: {
    label: "卧推",
    bestAngle: "diagonal",
    focus: "胸肩三头",
    findings: ["肩胛稳定", "杠铃路径", "手腕堆叠"],
    issues: ["底部肩胛稳定不足", "手腕略后折", "推起时右侧稍慢"],
    compensations: ["前三角代偿", "肩胛控制不足", "左右发力不均"],
    corrections: ["空杠热身加入停顿卧推", "手腕保持中立", "重量下降 5% 做左右速度一致"],
  },
  row: {
    label: "划船",
    bestAngle: "diagonal",
    focus: "背部拉",
    findings: ["肩胛后缩", "躯干稳定", "肘部路径"],
    issues: ["末端耸肩", "下放速度偏快", "躯干轻微晃动"],
    compensations: ["上斜方肌代偿", "核心稳定不足", "背阔肌参与不足"],
    corrections: ["先下沉肩胛再拉", "离心 3 秒", "胸托划船替代一周"],
  },
  press: {
    label: "肩推",
    bestAngle: "front",
    focus: "垂直推",
    findings: ["肋骨位置", "肩胛上旋", "左右对称"],
    issues: ["推到顶端肋骨外翻", "左侧上推路径偏外", "核心稳定略不足"],
    compensations: ["腰椎代偿", "上斜方肌紧张", "肩胛上旋不足"],
    corrections: ["改为半跪姿单臂推举", "收肋骨后再发力", "每组保留 2 次余力"],
  },
};

const insightMetrics = {
  calories: { labelKey: "metric.calories", unit: "kcal", color: "#F4C95D", targetKey: "calories", kind: "bar" },
  protein: { labelKey: "metric.protein", unit: "g", color: "#3F72D8", targetKey: "proteinG", kind: "bar" },
  workouts: { labelKey: "metric.workouts", unit: "unit.times", color: "#2F8A67", kind: "bar" },
  readiness: { labelKey: "metric.readiness", unit: "unit.points", color: "#6EE7B7", kind: "line" },
  formScore: { labelKey: "metric.formScore", unit: "unit.points", color: "#E56B4F", kind: "line" },
  uploads: { labelKey: "metric.uploads", unit: "unit.times", color: "#A78BFA", kind: "bar" },
};

document.addEventListener("DOMContentLoaded", async () => {
  pulseStatus("status.loadingDb");
  state = await loadState();
  ensureComputedState();
  bindEvents();
  populateForms();
  render();
});

function bindEvents() {
  $("#profileForm").addEventListener("submit", handleProfileSubmit);
  $("#mealForm").addEventListener("submit", handleMealSubmit);
  $("#mealPhotoInput").addEventListener("change", handleMealPhotoChange);
  $("#mealList").addEventListener("change", handleMealEdit);
  $("#mealList").addEventListener("click", handleMealDelete);
  $("#formMediaInput").addEventListener("change", handleFormMediaChange);
  [$("#formFileSurface"), $("#formPreview")].filter(Boolean).forEach((target) => {
    target.addEventListener("dragover", handleFormMediaDragOver);
    target.addEventListener("dragleave", handleFormMediaDragLeave);
    target.addEventListener("drop", handleFormMediaDrop);
  });
  $("#formAnalysisForm").addEventListener("submit", handleFormAnalysisSubmit);
  $("#loadPoseModel").addEventListener("click", () => loadPoseDetector());
  $("#startMotionCamera").addEventListener("click", startLiveMotionCamera);
  $("#stopMotionCamera").addEventListener("click", stopLiveMotionCamera);
  $("#runAgent").addEventListener("click", () => runAgentCycle());
  $("#rerunAgent").addEventListener("click", () => runAgentCycle());
  $("#agentForm").addEventListener("submit", handleAgentSubmit);
  $("#agentTaskList").addEventListener("click", handleAgentTaskAction);
  $("#trainingGrid").addEventListener("click", handleTrainingToggle);
  $("#healthForm").addEventListener("submit", handleHealthSubmit);
  $("#connectHealth").addEventListener("click", handleHealthConnect);
  $("#healthImportInput").addEventListener("change", handleHealthImport);
  $("#languageToggle").addEventListener("click", handleLanguageToggle);
  $("#insightPeriodControls").addEventListener("click", handleInsightPeriodChange);
  $("#insightMetricInput").addEventListener("change", handleInsightMetricChange);
  $("#trendCanvas").addEventListener("mousemove", handleChartPointerMove);
  $("#trendCanvas").addEventListener("mouseleave", hideChartTooltip);
  $("#trendCanvas").addEventListener("click", handleChartPointerMove);
  window.addEventListener("resize", () => renderInsights());
  $("#refreshCoach").addEventListener("click", () => {
    pulseStatus("status.adviceRefreshed");
    renderDashboard();
  });
  $("#resetDemo").addEventListener("click", async () => {
    const confirmed = window.confirm(t("confirm.reset"));
    if (!confirmed) return;
    localStorage.removeItem(STORAGE_KEY);
    await clearDatabase();
    state = clone(defaultState);
    ensureComputedState(true);
    pendingMealImage = "";
    pendingMealImageName = "";
    pendingMealImageSize = 0;
    pendingFormMedia = null;
    pendingFormMediaUrl = "";
    pendingFormMediaPreview = "";
    populateForms();
    render();
    pulseStatus("status.resetDone");
  });
}

async function loadState() {
  try {
    const dbState = await readStateFromDatabase();
    if (dbState) {
      dbReady = true;
      return mergeState(clone(defaultState), dbState);
    }
  } catch (error) {
    console.warn("Failed to load IndexedDB state", error);
    dbReady = false;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      dbReady = "indexedDB" in window;
      return clone(defaultState);
    }
    const parsed = JSON.parse(raw);
    const migratedState = mergeState(clone(defaultState), parsed);
    syncStateToDatabase(migratedState);
    return migratedState;
  } catch (error) {
    console.warn("Failed to load state", error);
    return clone(defaultState);
  }
}

function mergeState(base, patch) {
  const output = { ...base, ...patch };
  output.profile = { ...base.profile, ...(patch.profile || {}) };
  output.settings = { ...base.settings, ...(patch.settings || {}) };
  output.health = { ...base.health, ...(patch.health || {}) };
  output.health.metrics = { ...base.health.metrics, ...((patch.health && patch.health.metrics) || {}) };
  output.meals = Array.isArray(patch.meals) ? patch.meals : base.meals;
  output.workoutPlan = Array.isArray(patch.workoutPlan) ? patch.workoutPlan : base.workoutPlan;
  output.formAnalyses = Array.isArray(patch.formAnalyses) ? patch.formAnalyses : base.formAnalyses;
  output.mediaAssets = Array.isArray(patch.mediaAssets) ? patch.mediaAssets : base.mediaAssets;
  output.completedWorkoutDates = patch.completedWorkoutDates || base.completedWorkoutDates;
  output.agent = { ...base.agent, ...(patch.agent || {}) };
  output.agent.tasks = Array.isArray(output.agent.tasks) ? output.agent.tasks : [];
  output.agent.messages = Array.isArray(output.agent.messages) ? output.agent.messages : [];
  output.health.history = Array.isArray(output.health.history) ? output.health.history : [];
  return output;
}

function saveState(message = "status.localSaved") {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  syncStateToDatabase(state);
  pulseStatus(message);
}

function openDatabase() {
  if (!("indexedDB" in window)) {
    return Promise.reject(new Error("IndexedDB is not available in this browser."));
  }
  if (openDatabase.promise) return openDatabase.promise;

  openDatabase.promise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.addEventListener("error", () => reject(request.error));
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      createStore(db, "meta", { keyPath: "key" });
      createStore(db, "profile", { keyPath: "id" });
      createStore(db, "nutritionTargets", { keyPath: "id" });
      createStore(db, "meals", { keyPath: "id" }, [["date", "date"]]);
      createStore(db, "workoutPlan", { keyPath: "id" }, [["date", "date"]]);
      createStore(db, "workoutCompletions", { keyPath: "id" }, [["date", "date"]]);
      createStore(db, "formAnalyses", { keyPath: "id" }, [["date", "date"], ["exerciseType", "exerciseType"]]);
      createStore(db, "healthSnapshots", { keyPath: "id" }, [["date", "date"], ["updatedAt", "updatedAt"]]);
      createStore(db, "mediaAssets", { keyPath: "id" }, [["date", "date"], ["recordType", "recordType"]]);
      createStore(db, "agentTasks", { keyPath: "id" }, [["date", "date"], ["status", "status"], ["priority", "priority"]]);
      createStore(db, "agentMessages", { keyPath: "id" }, [["createdAt", "createdAt"], ["role", "role"]]);
    });
    request.addEventListener("success", () => resolve(request.result));
  });

  return openDatabase.promise;
}

function createStore(db, name, options, indices = []) {
  if (db.objectStoreNames.contains(name)) return;
  const store = db.createObjectStore(name, options);
  indices.forEach(([indexName, keyPath]) => store.createIndex(indexName, keyPath, { unique: false }));
}

async function readStateFromDatabase() {
  const db = await openDatabase();
  const [
    meta,
    profileRecord,
    nutritionRecord,
    meals,
    workoutPlan,
    completions,
    formAnalyses,
    healthSnapshots,
    mediaAssets,
    agentTasks,
    agentMessages,
  ] =
    await Promise.all([
      dbGet(db, "meta", "state"),
      dbGet(db, "profile", "current"),
      dbGet(db, "nutritionTargets", "current"),
      dbGetAll(db, "meals"),
      dbGetAll(db, "workoutPlan"),
      dbGetAll(db, "workoutCompletions"),
      dbGetAll(db, "formAnalyses"),
      dbGetAll(db, "healthSnapshots"),
      dbGetAll(db, "mediaAssets"),
      dbGetAll(db, "agentTasks"),
      dbGetAll(db, "agentMessages"),
    ]);

  const hasStoredData =
    profileRecord ||
    meals.length ||
    workoutPlan.length ||
    completions.length ||
    formAnalyses.length ||
    healthSnapshots.length ||
    mediaAssets.length ||
    agentTasks.length ||
    agentMessages.length;
  if (!hasStoredData) return null;

  const sortedHealth = healthSnapshots.sort(sortByUpdatedAtDesc);
  const latestHealth = sortedHealth[0];
  return {
    profile: profileRecord ? stripDbFields(profileRecord) : defaultState.profile,
    nutritionTarget: nutritionRecord ? stripDbFields(nutritionRecord) : null,
    meals: meals.sort(sortByCreatedAtDesc),
    workoutPlan: workoutPlan.sort((a, b) => a.date.localeCompare(b.date)),
    completedWorkoutDates: completions.reduce((accumulator, item) => {
      accumulator[item.date] = Boolean(item.completed);
      return accumulator;
    }, {}),
    formAnalyses: formAnalyses.sort(sortByCreatedAtDesc),
    mediaAssets: mediaAssets.sort(sortByCreatedAtDesc),
    agent: {
      status: meta && meta.agentStatus ? meta.agentStatus : "idle",
      lastRunAt: meta && meta.agentLastRunAt ? meta.agentLastRunAt : null,
      tasks: agentTasks.sort(sortByCreatedAtDesc),
      messages: agentMessages.sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || ""))).slice(-24),
    },
    settings: meta && meta.settings ? meta.settings : defaultState.settings,
    health: {
      authorized: Boolean(meta && meta.healthAuthorized),
      metrics: latestHealth ? latestHealth.metrics : defaultState.health.metrics,
      history: sortedHealth,
      updatedAt: latestHealth ? latestHealth.updatedAt : null,
    },
    updatedAt: meta ? meta.updatedAt : null,
  };
}

async function syncStateToDatabase(nextState) {
  if (!("indexedDB" in window)) return;
  try {
    const db = await openDatabase();
    dbReady = true;
    await dbWriteState(db, nextState);
  } catch (error) {
    dbReady = false;
    console.warn("Failed to sync IndexedDB state", error);
  }
}

async function dbWriteState(db, nextState) {
  const storeNames = [
    "meta",
    "profile",
    "nutritionTargets",
    "meals",
    "workoutPlan",
    "workoutCompletions",
    "formAnalyses",
    "healthSnapshots",
    "mediaAssets",
    "agentTasks",
    "agentMessages",
  ];
  const tx = db.transaction(storeNames, "readwrite");
  const clearableStores = storeNames.filter((name) => !["meta", "profile", "nutritionTargets"].includes(name));
  clearableStores.forEach((storeName) => tx.objectStore(storeName).clear());

  tx.objectStore("meta").put({
    key: "state",
    userId: CURRENT_USER_ID,
    updatedAt: nextState.updatedAt,
    healthAuthorized: Boolean(nextState.health.authorized),
    settings: nextState.settings,
    agentStatus: nextState.agent.status,
    agentLastRunAt: nextState.agent.lastRunAt,
    schemaVersion: DB_VERSION,
  });
  tx.objectStore("profile").put({ id: "current", userId: CURRENT_USER_ID, ...nextState.profile });
  tx.objectStore("nutritionTargets").put({
    id: "current",
    userId: CURRENT_USER_ID,
    ...(nextState.nutritionTarget || {}),
  });

  nextState.meals.forEach((meal) => tx.objectStore("meals").put({ userId: CURRENT_USER_ID, ...meal }));
  nextState.workoutPlan.forEach((day) => tx.objectStore("workoutPlan").put({ userId: CURRENT_USER_ID, ...day }));
  Object.entries(nextState.completedWorkoutDates).forEach(([date, completed]) => {
    tx.objectStore("workoutCompletions").put({
      id: date,
      userId: CURRENT_USER_ID,
      date,
      completed: Boolean(completed),
      updatedAt: nextState.updatedAt,
    });
  });
  nextState.formAnalyses.forEach((analysis) => tx.objectStore("formAnalyses").put({ userId: CURRENT_USER_ID, ...analysis }));
  nextState.health.history.forEach((snapshot) =>
    tx.objectStore("healthSnapshots").put({ userId: CURRENT_USER_ID, ...snapshot }),
  );
  nextState.mediaAssets.forEach((asset) => tx.objectStore("mediaAssets").put({ userId: CURRENT_USER_ID, ...asset }));
  nextState.agent.tasks.forEach((task) => tx.objectStore("agentTasks").put({ userId: CURRENT_USER_ID, ...task }));
  nextState.agent.messages.forEach((message) =>
    tx.objectStore("agentMessages").put({ userId: CURRENT_USER_ID, ...message }),
  );

  await txDone(tx);
}

async function clearDatabase() {
  if (!("indexedDB" in window)) return;
  try {
    const db = await openDatabase();
    const storeNames = Array.from(db.objectStoreNames);
    const tx = db.transaction(storeNames, "readwrite");
    storeNames.forEach((storeName) => tx.objectStore(storeName).clear());
    await txDone(tx);
  } catch (error) {
    console.warn("Failed to clear IndexedDB", error);
  }
}

function dbGet(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, "readonly").objectStore(storeName).get(key);
    request.addEventListener("success", () => resolve(request.result || null));
    request.addEventListener("error", () => reject(request.error));
  });
}

function dbGetAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
    request.addEventListener("success", () => resolve(request.result || []));
    request.addEventListener("error", () => reject(request.error));
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.addEventListener("complete", resolve);
    tx.addEventListener("abort", () => reject(tx.error || new Error("IndexedDB transaction aborted.")));
    tx.addEventListener("error", () => reject(tx.error || new Error("IndexedDB transaction failed.")));
  });
}

function stripDbFields(record) {
  const { id, userId, ...rest } = record;
  return rest;
}

function pulseStatus(message) {
  const status = $("#saveStatus");
  if (!status) return;
  status.textContent = ui(message);
  window.clearTimeout(pulseStatus.timer);
  pulseStatus.timer = window.setTimeout(() => {
    status.textContent = t("status.localSaved");
  }, 1400);
}

function handleLanguageToggle() {
  state.settings.language = currentLanguage() === "zh" ? "en" : "zh";
  saveState("status.synced");
  populateSelectLabels();
  render();
}

function currentLanguage() {
  return state && state.settings && state.settings.language === "en" ? "en" : "zh";
}

function t(key, params = {}) {
  const lang = currentLanguage();
  const template = (i18n[lang] && i18n[lang][key]) || (i18n.zh && i18n.zh[key]) || key;
  return Object.entries(params).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
}

function ui(value) {
  if (typeof value !== "string") return value;
  if ((i18n[currentLanguage()] && i18n[currentLanguage()][value]) || (i18n.zh && i18n.zh[value])) return t(value);
  return localizePhrase(value);
}

function localizePhrase(value) {
  if (currentLanguage() === "zh") return value;
  if (typeof value === "string" && value.startsWith("已检查：")) {
    return `Checked: ${localizePhrase(value.replace("已检查：", ""))}`;
  }
  if (typeof value === "string" && value.startsWith("检测到 ")) {
    const match = value.match(/检测到 (\d+) 个有效人体关键点，平均置信度 (\d+)%。/);
    if (match) {
      return `Detected ${match[1]} reliable body keypoints with ${match[2]}% average confidence.`;
    }
  }
  if (typeof value === "string" && value.startsWith("当前角度可用；")) {
    const match = value.match(/当前角度可用；(.+)角度会更适合识别 (.+)/);
    if (match) {
      return `Current angle is usable; the ${localizePhrase(match[1])} angle is better for ${localizePhrase(match[2])}.`;
    }
  }
  return phraseTranslations.en[value] || value;
}

function localizeList(items) {
  return items.map((item) => localizePhrase(item));
}

function applyLanguageStatic() {
  const lang = currentLanguage();
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  setText(".brand small", t("brand.subtitle"));
  setAttr(".brand", "aria-label", lang === "zh" ? "FitSnap Coach 仪表盘" : "FitSnap Coach dashboard");
  setText('.top-nav a[href="#dashboard"]', t("nav.today"));
  setText('.top-nav a[href="#agent"]', t("nav.agent"));
  setText('.top-nav a[href="#insights"]', t("nav.insights"));
  setText('.top-nav a[href="#profile"]', t("nav.profile"));
  setText('.top-nav a[href="#nutrition"]', t("nav.nutrition"));
  setText('.top-nav a[href="#training"]', t("nav.training"));
  setText('.top-nav a[href="#motion"]', t("nav.motion"));
  setText('.top-nav a[href="#health"]', t("nav.health"));
  setText("#languageToggle span:last-child", t("button.language"));
  setAttr("#languageToggle", "title", lang === "zh" ? "Switch to English" : "切换到中文");
  setText("#resetDemo span:last-child", t("button.reset"));
  setAttr("#resetDemo", "title", t("confirm.reset"));
  setText("#dashboardTitle", t("title.dashboard"));
  setText(".readiness-card h2", t("title.readiness"));
  setText(".nutrition-card h2", t("title.nutrition"));
  setText(".calorie-row div:first-child .label", t("label.consumed"));
  setText(".calorie-row div:nth-child(2) .label", t("label.target"));
  setText(".coach-card h2", t("title.coach"));
  setText(".visual-card h2", t("title.motionSnapshot"));
  setText(".readiness-card .fine-print", t("fine.readiness"));
  setText("#refreshCoach span:last-child", t("button.refresh"));
  setAttr("#refreshCoach", "title", t("button.refresh"));
  setText("#agentTitle", t("title.agent"));
  setText(".agent-console h2", t("title.agentConsole"));
  setText(".agent-actions h2", t("title.agentTasks"));
  setText("#runAgent span:last-child", t("button.runAgent"));
  setAttr("#runAgent", "title", t("button.runAgent"));
  setText("#rerunAgent span:last-child", t("button.rerunAgent"));
  setText("#agentForm .primary-button span:last-child", t("button.sendAgent"));
  setAttr("#agentPromptInput", "placeholder", t("placeholder.agentPrompt"));
  setText("#insightsTitle", t("title.insights"));
  setText(".insights-side h2", t("title.summary"));
  setText("#profileTitle", t("title.profile"));
  setText(".target-card h2", t("title.targetSummary"));
  setText("#nutritionTitle", t("title.foodLog"));
  setText("#nutrition article.card:not(.form-card) h2", t("title.mealDetails"));
  setText("#trainingTitle", t("title.training"));
  setText("#motionTitle", t("title.formCheck"));
  updatePoseModelStatus();
  setText("#motion article.card:not(.form-card) h2", t("title.formFeedback"));
  setText("#healthTitle", t("title.health"));
  setText("#health article.card:not(.form-card) h2", t("title.recoveryJudgement"));
  setText("#health .fine-print", t("fine.healthkit"));
  setText("#insightPeriodControls [data-period='week']", t("period.week"));
  setText("#insightPeriodControls [data-period='month']", t("period.month"));
  setControlLabel("insightMetricInput", t("label.metric"));
  setControlLabel("nameInput", t("label.name"));
  setControlLabel("ageInput", t("label.age"));
  setControlLabel("sexInput", t("label.sex"));
  setControlLabel("heightInput", t("label.height"));
  setControlLabel("currentWeightInput", t("label.currentWeight"));
  setControlLabel("targetWeightInput", t("label.targetWeight"));
  setControlLabel("activityInput", t("label.activity"));
  setControlLabel("experienceInput", t("label.experience"));
  setControlLabel("trainingDaysInput", t("label.trainingDays"));
  setControlLabel("physiqueInput", t("label.physique"));
  setControlLabel("dietInput", t("label.diet"));
  setControlLabel("equipmentInput", t("label.equipment"));
  setControlLabel("injuriesInput", t("label.injuries"));
  setControlLabel("mealTypeInput", t("label.mealType"));
  setControlLabel("mealDescriptionInput", t("label.mealDescription"));
  setControlLabel("mealPhotoInput", t("label.mealPhoto"));
  setControlLabel("exerciseTypeInput", t("label.exercise"));
  setControlLabel("cameraAngleInput", t("label.cameraAngle"));
  setControlLabel("formMediaInput", t("label.formMedia"));
  setControlLabel("sleepInput", t("label.sleep"));
  setControlLabel("hrvInput", t("label.hrv"));
  setControlLabel("rhrInput", t("label.rhr"));
  setControlLabel("spo2Input", t("label.spo2"));
  setControlLabel("stepsInput", t("label.steps"));
  setControlLabel("activeEnergyInput", t("label.activeEnergy"));
  setControlLabel("workoutLoadInput", t("label.workoutLoad"));
  setAttr("#dietInput", "placeholder", t("placeholder.diet"));
  setAttr("#injuriesInput", "placeholder", t("placeholder.injuries"));
  setAttr("#mealDescriptionInput", "placeholder", t("placeholder.meal"));
  setText("#profileForm .primary-button span:last-child", t("button.savePlan"));
  setText("#mealForm .primary-button span:last-child", t("button.estimateMeal"));
  setText("#formAnalysisForm .primary-button span:last-child", t("button.analyzeForm"));
  setText("#loadPoseModel span:last-child", t("button.loadPoseModel"));
  setText("#startMotionCamera span:last-child", t("button.startCamera"));
  setText("#stopMotionCamera span:last-child", t("button.stopCamera"));
  setText("#connectHealth span:last-child", t("button.connectHealth"));
  setText(".file-inline span:nth-child(2)", t("button.importHealth"));
  setText("#healthForm .primary-button span:last-child", t("button.saveHealth"));
  updateFilePlaceholders();
  populateSelectLabels();
}

function setText(selector, text) {
  const element = $(selector);
  if (element) element.textContent = text;
}

function setAttr(selector, attribute, value) {
  const element = $(selector);
  if (element) element.setAttribute(attribute, value);
}

function setControlLabel(inputId, text) {
  const control = $(`#${inputId}`);
  const label = control ? control.closest("label") : null;
  if (!label) return;
  const textNode = Array.from(label.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) textNode.textContent = `\n                ${text}\n                `;
}

function setSelectOptions(selector, options) {
  const select = $(selector);
  if (!select) return;
  const currentValue = select.value;
  select.innerHTML = options.map(({ value, label }) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
  select.value = currentValue;
}

function populateSelectLabels() {
  setSelectOptions("#sexInput", [
    { value: "female", label: localizePhrase("女性") },
    { value: "male", label: localizePhrase("男性") },
  ]);
  setSelectOptions("#activityInput", [
    { value: "sedentary", label: localizePhrase("久坐") },
    { value: "light", label: localizePhrase("轻度活动") },
    { value: "moderate", label: localizePhrase("中等活动") },
    { value: "high", label: localizePhrase("高活动") },
  ]);
  setSelectOptions("#experienceInput", [
    { value: "beginner", label: localizePhrase("新手") },
    { value: "intermediate", label: localizePhrase("有基础") },
    { value: "advanced", label: localizePhrase("进阶") },
  ]);
  setSelectOptions(
    "#physiqueInput",
    ["减脂线条", "增肌塑形", "体态改善", "力量提升", "马甲线核心", "翘臀下肢"].map((value) => ({
      value,
      label: localizePhrase(value),
    })),
  );
  setSelectOptions("#equipmentInput", [
    { value: "home", label: localizePhrase("居家") },
    { value: "gym", label: localizePhrase("健身房") },
    { value: "minimal", label: localizePhrase("徒手/弹力带") },
  ]);
  setSelectOptions("#mealTypeInput", ["早餐", "午餐", "晚餐", "加餐"].map((value) => ({ value, label: localizePhrase(value) })));
  setSelectOptions(
    "#exerciseTypeInput",
    Object.entries(exerciseProfiles).map(([value, profile]) => ({ value, label: localizePhrase(profile.label) })),
  );
  setSelectOptions("#cameraAngleInput", [
    { value: "side", label: localizePhrase("侧面") },
    { value: "front", label: localizePhrase("正面") },
    { value: "diagonal", label: localizePhrase("45 度") },
  ]);
  setSelectOptions(
    "#insightMetricInput",
    Object.entries(insightMetrics).map(([value, metric]) => ({ value, label: t(metric.labelKey) })),
  );
}

function updateFilePlaceholders() {
  if (!pendingMealImageName) setText("#mealFileName", t("placeholder.choosePhoto"));
  if (!pendingFormMedia) setText("#formFileName", t("placeholder.chooseMedia"));
  const mealPreview = $("#mealPreview");
  if (mealPreview && !mealPreview.querySelector("img, video")) {
    mealPreview.innerHTML = `<span class="placeholder">${t("placeholder.noPhoto")}</span>`;
  }
  const formPreview = $("#formPreview");
  if (formPreview && !formPreview.querySelector("img, video")) {
    formPreview.innerHTML = `<span class="placeholder">${t("placeholder.noMedia")}</span>`;
  }
}

function setPoseModelStatus(status, message = "") {
  poseModelStatus = status;
  poseModelMessage = message;
  updatePoseModelStatus();
}

function updatePoseModelStatus() {
  const element = $("#poseModelStatus");
  if (!element) return;
  const keyByStatus = {
    idle: "status.poseIdle",
    loading: "status.poseLoading",
    ready: "status.poseReady",
    fallback: "status.poseFallback",
    analyzing: "status.poseAnalyzing",
  };
  element.textContent = poseModelMessage || t(keyByStatus[poseModelStatus] || "status.poseIdle");
}

async function loadPoseDetector() {
  if (poseDetector) {
    setPoseModelStatus("ready");
    return poseDetector;
  }
  setPoseModelStatus("loading");
  try {
    await loadExternalScript(TFJS_URL, "tfjs-runtime");
    await loadExternalScript(POSE_DETECTION_URL, "tfjs-pose-detection");
    if (!window.tf || !window.poseDetection) {
      throw new Error("TensorFlow.js pose detection globals were not available.");
    }
    if (window.tf.setBackend) {
      try {
        await window.tf.setBackend("webgl");
      } catch (error) {
        console.warn("WebGL backend unavailable; TensorFlow.js will use the default backend.", error);
      }
    }
    await window.tf.ready();
    poseDetector = await window.poseDetection.createDetector(window.poseDetection.SupportedModels.MoveNet, {
      modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
    });
    setPoseModelStatus("ready");
    return poseDetector;
  } catch (error) {
    console.warn("Pose model unavailable; falling back to rule analysis.", error);
    setPoseModelStatus("fallback");
    return null;
  }
}

function loadExternalScript(src, id) {
  if (document.getElementById(id)) return loadExternalScript.promises[id] || Promise.resolve();
  loadExternalScript.promises = loadExternalScript.promises || {};
  loadExternalScript.promises[id] = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.addEventListener("load", resolve);
    script.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });
  return loadExternalScript.promises[id];
}

function ensureComputedState(forcePlan = false) {
  state.nutritionTarget = computeNutritionTarget(state.profile);
  const stalePlan = !state.workoutPlan.length || state.workoutPlan[0].date !== todayKey;
  if (forcePlan || stalePlan) {
    state.workoutPlan = generateWorkoutPlan(state.profile, calculateReadiness(state.health.metrics).score);
  }
  saveState("status.synced");
}

function populateForms() {
  const profile = state.profile;
  $("#nameInput").value = profile.name;
  $("#ageInput").value = profile.age;
  $("#sexInput").value = profile.sex;
  $("#heightInput").value = profile.heightCm;
  $("#currentWeightInput").value = profile.currentWeightKg;
  $("#targetWeightInput").value = profile.targetWeightKg;
  $("#activityInput").value = profile.activityLevel;
  $("#experienceInput").value = profile.trainingExperience;
  $("#trainingDaysInput").value = profile.trainingDaysPerWeek;
  $("#physiqueInput").value = profile.physiqueGoal;
  $("#dietInput").value = profile.dietPreference;
  $("#equipmentInput").value = profile.equipment;
  $("#injuriesInput").value = profile.injuries;
  populateHealthForm();
}

function populateHealthForm() {
  const metrics = state.health.metrics;
  $("#sleepInput").value = metrics.sleepHours;
  $("#hrvInput").value = metrics.hrvMs;
  $("#rhrInput").value = metrics.restingHeartRate;
  $("#spo2Input").value = metrics.spo2;
  $("#stepsInput").value = metrics.steps;
  $("#activeEnergyInput").value = metrics.activeEnergyKcal;
  $("#workoutLoadInput").value = metrics.workoutLoad;
}

function render() {
  applyLanguageStatic();
  $("#todayLabel").textContent = formatFullDate(today);
  renderDashboard();
  renderAgent();
  renderInsights();
  renderTargetSummary();
  renderMeals();
  renderTraining();
  renderAnalysis();
  renderHealth();
}

function handleProfileSubmit(event) {
  event.preventDefault();
  state.profile = {
    name: $("#nameInput").value.trim() || (currentLanguage() === "zh" ? "FitSnap 用户" : "FitSnap user"),
    age: numberFromInput("#ageInput", 31),
    sex: $("#sexInput").value,
    heightCm: numberFromInput("#heightInput", 165),
    currentWeightKg: numberFromInput("#currentWeightInput", 62),
    targetWeightKg: numberFromInput("#targetWeightInput", 56),
    activityLevel: $("#activityInput").value,
    trainingExperience: $("#experienceInput").value,
    trainingDaysPerWeek: Math.round(numberFromInput("#trainingDaysInput", 4)),
    physiqueGoal: $("#physiqueInput").value,
    dietPreference: $("#dietInput").value.trim(),
    equipment: $("#equipmentInput").value,
    injuries: $("#injuriesInput").value.trim(),
  };
  state.nutritionTarget = computeNutritionTarget(state.profile);
  state.workoutPlan = generateWorkoutPlan(state.profile, calculateReadiness(state.health.metrics).score);
  saveState("status.goalSaved");
  render();
}

function computeNutritionTarget(profile) {
  const weight = toNumber(profile.currentWeightKg, 62);
  const height = toNumber(profile.heightCm, 165);
  const age = toNumber(profile.age, 31);
  const sexOffset = profile.sex === "male" ? 5 : -161;
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexOffset;
  const factors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725,
  };
  const tdee = bmr * (factors[profile.activityLevel] || 1.45);
  const mode = inferGoalMode(profile);
  const calorieAdjustment = mode.key === "cut" ? -420 : mode.key === "bulk" ? 240 : -40;
  const calories = Math.round((tdee + calorieAdjustment) / 10) * 10;
  const proteinMultiplier = mode.key === "cut" ? 2.05 : mode.key === "bulk" ? 1.8 : 1.9;
  const proteinG = Math.round(weight * proteinMultiplier);
  const fatG = Math.max(42, Math.round(weight * 0.78));
  const carbsG = Math.max(80, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  return {
    mode: mode.key,
    modeLabel: mode.label,
    calories,
    proteinG,
    carbsG,
    fatG,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    computedAt: new Date().toISOString(),
  };
}

function inferGoalMode(profile) {
  const goal = profile.physiqueGoal || "";
  const weightDelta = toNumber(profile.targetWeightKg, 0) - toNumber(profile.currentWeightKg, 0);
  if (goal.includes("增肌") || goal.includes("力量") || weightDelta > 1.5) {
    return { key: "bulk", label: "轻盈增肌" };
  }
  if (goal.includes("减脂") || goal.includes("马甲线") || goal.includes("翘臀") || weightDelta < -1) {
    return { key: "cut", label: "稳态减脂" };
  }
  return { key: "recomp", label: "体态重组" };
}

function handleMealPhotoChange(event) {
  const file = event.target.files[0];
  pendingMealImage = "";
  pendingMealImageName = "";
  pendingMealImageSize = 0;
  $("#mealPreview").innerHTML = `<span class="placeholder">${t("placeholder.noPhoto")}</span>`;
  $("#mealFileName").textContent = t("placeholder.choosePhoto");
  if (!file) return;

  pendingMealImageName = file.name;
  pendingMealImageSize = file.size;
  $("#mealFileName").textContent = file.name;
  const objectUrl = URL.createObjectURL(file);
  $("#mealPreview").innerHTML = `<img src="${objectUrl}" alt="${currentLanguage() === "zh" ? "餐食照片预览" : "Meal photo preview"}" />`;

  if (file.size <= 1_400_000) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      pendingMealImage = reader.result;
    });
    reader.readAsDataURL(file);
  }
}

function handleMealSubmit(event) {
  event.preventDefault();
  const description = $("#mealDescriptionInput").value.trim();
  if (!description && !pendingMealImageName) {
    window.alert(t("alert.mealRequired"));
    return;
  }
  const estimate = estimateMeal(description, Boolean(pendingMealImageName));
  const mealId = createId();
  const mediaAsset = pendingMealImageName
    ? createMediaAsset({
        recordType: "meal",
        recordId: mealId,
        name: pendingMealImageName,
        mimeType: "image/*",
        size: pendingMealImageSize,
        previewDataUrl: pendingMealImage,
      })
    : null;
  const meal = {
    id: mealId,
    date: todayKey,
    mealType: $("#mealTypeInput").value,
    description: description || estimate.name,
    imageUrl: pendingMealImage,
    imageName: pendingMealImageName,
    mediaAssetId: mediaAsset ? mediaAsset.id : null,
    ...estimate,
    editedByUser: false,
    createdAt: new Date().toISOString(),
  };
  if (mediaAsset) state.mediaAssets.unshift(mediaAsset);
  state.meals.unshift(meal);
  saveState("status.mealSaved");
  event.target.reset();
  $("#mealPreview").innerHTML = `<span class="placeholder">${t("placeholder.noPhoto")}</span>`;
  $("#mealFileName").textContent = t("placeholder.choosePhoto");
  pendingMealImage = "";
  pendingMealImageName = "";
  pendingMealImageSize = 0;
  render();
}

function estimateMeal(description, hasImage) {
  const normalized = description.toLowerCase();
  const matched = foodProfiles.find((profile) =>
    profile.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())),
  );
  const base = matched || {
    name: hasImage ? "混合餐盘" : "手动餐食",
    calories: hasImage ? 560 : 430,
    proteinG: hasImage ? 28 : 22,
    carbsG: hasImage ? 62 : 44,
    fatG: hasImage ? 18 : 14,
  };
  const mealSizeBias = normalized.includes("大份") || normalized.includes("double") ? 1.18 : 1;
  const lightBias = normalized.includes("少") || normalized.includes("小份") ? 0.84 : 1;
  const multiplier = mealSizeBias * lightBias;
  return {
    name: base.name,
    calories: Math.round(base.calories * multiplier),
    proteinG: Math.round(base.proteinG * multiplier),
    carbsG: Math.round(base.carbsG * multiplier),
    fatG: Math.round(base.fatG * multiplier),
    confidence: matched ? 0.78 : hasImage ? 0.63 : 0.52,
  };
}

function handleMealEdit(event) {
  const input = event.target;
  const id = input.dataset.mealId;
  const field = input.dataset.field;
  if (!id || !field) return;
  const meal = state.meals.find((item) => item.id === id);
  if (!meal) return;
  meal[field] = Math.max(0, Math.round(toNumber(input.value, meal[field])));
  meal.editedByUser = true;
  saveState("status.mealAdjusted");
  renderDashboard();
  renderInsights();
}

function handleMealDelete(event) {
  const button = event.target.closest("[data-delete-meal]");
  if (!button) return;
  const meal = state.meals.find((item) => item.id === button.dataset.deleteMeal);
  state.meals = state.meals.filter((meal) => meal.id !== button.dataset.deleteMeal);
  if (meal && meal.mediaAssetId) {
    state.mediaAssets = state.mediaAssets.filter((asset) => asset.id !== meal.mediaAssetId);
  }
  saveState("status.mealDeleted");
  render();
}

function generateWorkoutPlan(profile, readinessScore) {
  const days = Math.min(6, Math.max(2, Math.round(toNumber(profile.trainingDaysPerWeek, 4))));
  const activeDayMap = {
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 5],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5],
  };
  const activeDays = new Set(activeDayMap[days] || activeDayMap[4]);
  const mode = inferGoalMode(profile).key;
  const split = getTrainingSplit(mode, profile);
  const plan = [];
  let trainingIndex = 0;

  for (let i = 0; i < 7; i += 1) {
    const date = addDays(today, i);
    const dateKey = toDateKey(date);
    const isTrainingDay = activeDays.has(i);
    const workout = isTrainingDay
      ? buildWorkoutDay(split[trainingIndex % split.length], profile, readinessScore)
      : buildRecoveryDay(profile, readinessScore);
    plan.push({
      id: dateKey,
      date: dateKey,
      label: i === 0 ? "today" : `weekday-${date.getDay()}`,
      dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
      ...workout,
    });
    if (isTrainingDay) trainingIndex += 1;
  }
  return plan;
}

function getTrainingSplit(mode, profile) {
  if (profile.trainingExperience === "beginner") {
    return mode === "bulk"
      ? ["全身力量", "下肢臀腿", "上肢推拉", "全身容量"]
      : ["全身基础", "臀腿核心", "上肢体态", "全身代谢"];
  }
  if (mode === "bulk") return ["推", "拉", "腿", "上肢容量", "下肢容量"];
  if (mode === "cut") return ["全身力量", "低冲击有氧", "臀腿核心", "上肢力量", "代谢循环"];
  return ["上肢", "下肢", "核心体态", "全身力量"];
}

function buildWorkoutDay(focus, profile, readinessScore) {
  const lowerIntensity = readinessScore < 58;
  const rpe = lowerIntensity ? "RPE 6" : profile.trainingExperience === "advanced" ? "RPE 8" : "RPE 7";
  const rest = lowerIntensity ? "75s" : "90s";
  const gym = profile.equipment === "gym";
  const library = {
    "全身基础": [
      ["杯式深蹲", "3 x 10", rpe],
      [gym ? "坐姿划船" : "弹力带划船", "3 x 12", rpe],
      ["上斜俯卧撑", "3 x 8-10", rpe],
    ],
    "臀腿核心": [
      [gym ? "罗马尼亚硬拉" : "臀桥", "3 x 10", rpe],
      ["分腿蹲", "3 x 8/侧", rpe],
      ["死虫", "3 x 10/侧", "控制呼吸"],
    ],
    "上肢体态": [
      [gym ? "高位下拉" : "弹力带下拉", "3 x 12", rpe],
      ["哑铃肩推", "3 x 8", rpe],
      ["面拉", "3 x 14", "肩胛稳定"],
    ],
    "全身代谢": [
      ["深蹲到推举", "4 x 8", rpe],
      ["登山跑", "4 x 30s", "低冲击可替换"],
      ["平板支撑", "3 x 30s", "保持骨盆"],
    ],
    "全身力量": [
      [gym ? "杠铃深蹲" : "杯式深蹲", "4 x 5", rpe],
      [gym ? "卧推" : "俯卧撑", "4 x 6-8", rpe],
      [gym ? "硬拉" : "壶铃硬拉", "3 x 5", rpe],
    ],
    "低冲击有氧": [
      ["坡度快走", "30 min", "Zone 2"],
      ["髋屈肌拉伸", "2 x 45s/侧", "放松"],
      ["呼吸训练", "5 min", "鼻吸慢呼"],
    ],
    "上肢力量": [
      [gym ? "卧推" : "俯卧撑", "4 x 6", rpe],
      [gym ? "划船" : "弹力带划船", "4 x 8", rpe],
      ["侧平举", "3 x 12", "慢速"],
    ],
    "代谢循环": [
      ["壶铃摆动", "5 x 12", rpe],
      ["反向弓步", "4 x 10/侧", rpe],
      ["农夫走", "4 x 40m", "核心紧"],
    ],
    "下肢臀腿": [
      [gym ? "臀推" : "单腿臀桥", "4 x 8", rpe],
      [gym ? "腿举" : "保加利亚分腿蹲", "3 x 10", rpe],
      ["小腿提踵", "3 x 14", "停顿"],
    ],
    "上肢推拉": [
      [gym ? "哑铃卧推" : "俯卧撑", "3 x 10", rpe],
      [gym ? "胸托划船" : "弹力带划船", "3 x 12", rpe],
      ["面拉", "3 x 15", "肩胛"],
    ],
    "全身容量": [
      ["前蹲", "3 x 8", rpe],
      ["硬拉变式", "3 x 8", rpe],
      ["核心抗旋转", "3 x 12/侧", "稳定"],
    ],
    推: [
      ["卧推", "4 x 6", rpe],
      ["肩推", "3 x 8", rpe],
      ["绳索下压", "3 x 12", "控制"],
    ],
    拉: [
      ["引体或下拉", "4 x 6-8", rpe],
      ["杠铃划船", "3 x 8", rpe],
      ["二头弯举", "3 x 12", "慢速"],
    ],
    腿: [
      ["深蹲", "4 x 6", rpe],
      ["罗马尼亚硬拉", "3 x 8", rpe],
      ["弓步", "3 x 10/侧", "稳定"],
    ],
    上肢: [
      ["上斜卧推", "3 x 8", rpe],
      ["坐姿划船", "3 x 10", rpe],
      ["侧平举", "3 x 14", "肩线"],
    ],
    下肢: [
      ["臀推", "4 x 8", rpe],
      ["分腿蹲", "3 x 10/侧", rpe],
      ["腿弯举", "3 x 12", "腘绳肌"],
    ],
    "核心体态": [
      ["平板支撑", "4 x 30s", "肋骨下沉"],
      ["鸟狗", "3 x 10/侧", "骨盆稳定"],
      ["面拉", "3 x 15", "肩胛"],
    ],
  };

  const exercises = library[focus] || library["全身基础"];
  return {
    focus,
    intensity: lowerIntensity ? "降强度" : "正常",
    rest,
    isRestDay: false,
    exercises: exercises.map(([name, prescription, note]) => ({ name, prescription, note })),
  };
}

function buildRecoveryDay(profile, readinessScore) {
  const focus = readinessScore < 58 ? "主动恢复" : "轻活动";
  return {
    focus,
    intensity: "恢复",
    rest: "-",
    isRestDay: true,
    exercises: [
      { name: "Zone 2 快走", prescription: "20-30 min", note: "鼻吸可说话" },
      { name: "髋/胸椎活动", prescription: "8 min", note: "不追求疼痛" },
      { name: "睡前放松", prescription: "5 min", note: "慢呼吸" },
    ],
  };
}

function handleTrainingToggle(event) {
  const button = event.target.closest("[data-toggle-day]");
  if (!button) return;
  const dayId = button.dataset.toggleDay;
  state.completedWorkoutDates[dayId] = !state.completedWorkoutDates[dayId];
  saveState(state.completedWorkoutDates[dayId] ? "status.workoutDone" : "status.workoutUndone");
  renderTraining();
  renderDashboard();
  renderInsights();
}

function handleFormMediaChange(event) {
  setPendingFormMedia(event.target.files[0] || null);
}

function handleFormMediaDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add("drag-over");
}

function handleFormMediaDragLeave(event) {
  event.currentTarget.classList.remove("drag-over");
}

function handleFormMediaDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove("drag-over");
  const file = Array.from(event.dataTransfer.files || []).find((item) => item.type.startsWith("image/") || item.type.startsWith("video/"));
  if (file) setPendingFormMedia(file);
}

function setPendingFormMedia(file) {
  if (liveMotionStream) stopLiveMotionCamera({ silent: true });
  pendingFormMedia = file || null;
  if (pendingFormMediaUrl) URL.revokeObjectURL(pendingFormMediaUrl);
  pendingFormMediaUrl = "";
  pendingFormMediaPreview = "";
  $("#formFileName").textContent = t("placeholder.chooseMedia");
  $("#formPreview").innerHTML = `<span class="placeholder">${t("placeholder.noMedia")}</span>`;
  if (!file) return;
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;

  pendingFormMediaUrl = URL.createObjectURL(file);
  $("#formFileName").textContent = file.name;
  if (file.type.startsWith("video")) {
    $("#formPreview").innerHTML = `<video src="${pendingFormMediaUrl}" controls muted playsinline></video>`;
  } else {
    $("#formPreview").innerHTML = `<img src="${pendingFormMediaUrl}" alt="${currentLanguage() === "zh" ? "动作媒体预览" : "Form media preview"}" />`;
    if (file.size <= 1_400_000) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        pendingFormMediaPreview = reader.result;
      });
      reader.readAsDataURL(file);
    }
  }
}

async function startLiveMotionCamera() {
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
    window.alert(t("alert.cameraUnsupported"));
    return;
  }

  const startButton = $("#startMotionCamera");
  const stopButton = $("#stopMotionCamera");
  startButton.disabled = true;
  setPoseModelStatus("loading");

  try {
    const detector = await loadPoseDetector();
    if (!detector) {
      throw new Error(currentLanguage() === "zh" ? "Pose 模型未就绪" : "Pose model is not ready");
    }

    if (pendingFormMediaUrl) URL.revokeObjectURL(pendingFormMediaUrl);
    pendingFormMedia = null;
    pendingFormMediaUrl = "";
    pendingFormMediaPreview = "";
    $("#formFileName").textContent = t("button.startCamera");

    liveMotionStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 960 },
        height: { ideal: 540 },
      },
    });

    $("#formPreview").innerHTML = `
      <div class="live-camera-wrap">
        <video id="liveMotionVideo" autoplay muted playsinline></video>
        <canvas id="liveMotionCanvas" aria-label="${currentLanguage() === "zh" ? "实时动作关键点" : "Live pose keypoints"}"></canvas>
        <div class="live-hud" id="liveMotionHud">${t("analysis.liveWaiting")}</div>
      </div>
    `;
    liveMotionVideo = $("#liveMotionVideo");
    liveMotionCanvas = $("#liveMotionCanvas");
    liveMotionVideo.srcObject = liveMotionStream;
    await liveMotionVideo.play();
    stopButton.disabled = false;
    setPoseModelStatus("ready", t("status.cameraLive"));
    liveMotionLastInferenceAt = 0;
    liveMotionAnalysis = null;
    liveMotionFrame = window.requestAnimationFrame(runLiveMotionFrame);
  } catch (error) {
    console.warn("Unable to start live camera", error);
    stopLiveMotionCamera({ silent: true });
    setPoseModelStatus("fallback", t("status.cameraDenied"));
    window.alert(t("alert.cameraFailed", { message: error.message || error }));
  } finally {
    if (!liveMotionStream) startButton.disabled = false;
  }
}

function stopLiveMotionCamera(options = {}) {
  if (liveMotionFrame) {
    window.cancelAnimationFrame(liveMotionFrame);
    liveMotionFrame = 0;
  }
  if (liveMotionStream) {
    liveMotionStream.getTracks().forEach((track) => track.stop());
  }
  liveMotionStream = null;
  liveMotionVideo = null;
  liveMotionCanvas = null;
  liveMotionAnalysis = null;
  liveMotionLastInferenceAt = 0;
  const startButton = $("#startMotionCamera");
  const stopButton = $("#stopMotionCamera");
  if (startButton) startButton.disabled = false;
  if (stopButton) stopButton.disabled = true;
  if (!options.silent) {
    $("#formPreview").innerHTML = `<span class="placeholder">${t("placeholder.noMedia")}</span>`;
    $("#formFileName").textContent = t("placeholder.chooseMedia");
    setPoseModelStatus(poseDetector ? "ready" : "idle", poseDetector ? t("status.cameraStopped") : "");
    renderAnalysis();
  }
}

async function runLiveMotionFrame(timestamp) {
  if (!liveMotionStream || !liveMotionVideo || !poseDetector) return;

  if (timestamp - liveMotionLastInferenceAt > 320 && liveMotionVideo.readyState >= 2) {
    liveMotionLastInferenceAt = timestamp;
    try {
      const poses = await poseDetector.estimatePoses(liveMotionVideo, {
        flipHorizontal: false,
        maxPoses: 1,
      });
      const poseResult = normalizePoseResult(
        poses && poses[0],
        liveMotionVideo.videoWidth || 640,
        liveMotionVideo.videoHeight || 360,
      );
      if (poseResult && poseResult.keypoints.length) {
        liveMotionAnalysis = generatePoseBasedFormAnalysis(
          { name: currentLanguage() === "zh" ? "实时摄像" : "Live camera", type: "video/live", size: 0 },
          $("#exerciseTypeInput").value,
          $("#cameraAngleInput").value,
          poseResult,
        );
        renderLiveMotionAnalysis();
      } else {
        liveMotionAnalysis = null;
        renderLiveMotionWaiting();
      }
    } catch (error) {
      console.warn("Live pose estimation failed", error);
    }
  }

  drawLiveMotionOverlay();
  liveMotionFrame = window.requestAnimationFrame(runLiveMotionFrame);
}

function renderLiveMotionAnalysis() {
  if (!liveMotionAnalysis) return;
  const hud = $("#liveMotionHud");
  if (hud) {
    hud.textContent = `${t("analysis.livePreview")} · ${localizePhrase(liveMotionAnalysis.exerciseLabel)} ${liveMotionAnalysis.score}/100`;
  }
  $("#analysisOutput").innerHTML = renderAnalysisEntry(liveMotionAnalysis, { live: true });
}

function renderLiveMotionWaiting() {
  const hud = $("#liveMotionHud");
  if (hud) hud.textContent = t("analysis.liveWaiting");
  $("#analysisOutput").innerHTML = `<span class="placeholder">${t("analysis.liveWaiting")}</span>`;
}

function drawLiveMotionOverlay() {
  if (!liveMotionCanvas || !liveMotionVideo) return;
  const rect = liveMotionCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(320, Math.floor(rect.width || 640));
  const height = Math.max(220, Math.floor(rect.height || 360));
  liveMotionCanvas.width = width * dpr;
  liveMotionCanvas.height = height * dpr;
  const ctx = liveMotionCanvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  if (!liveMotionAnalysis || !liveMotionAnalysis.pose) return;
  const color = liveMotionAnalysis.score >= 82 ? "#6EE7B7" : liveMotionAnalysis.score >= 68 ? "#F4C95D" : "#FF8A70";
  drawDetectedPose(ctx, liveMotionAnalysis.pose, width, height, color);
}

async function handleFormAnalysisSubmit(event) {
  event.preventDefault();
  if (!pendingFormMedia) {
    window.alert(t("alert.formRequired"));
    return;
  }
  const exerciseType = $("#exerciseTypeInput").value;
  const cameraAngle = $("#cameraAngleInput").value;
  const submitButton = $("#formAnalysisForm .primary-button");
  submitButton.disabled = true;
  setPoseModelStatus("analyzing");
  try {
    const analysis = await generateFormAnalysis(pendingFormMedia, exerciseType, cameraAngle);
    state.mediaAssets.unshift(
      createMediaAsset({
        recordType: "formAnalysis",
        recordId: analysis.id,
        name: pendingFormMedia.name,
        mimeType: pendingFormMedia.type,
        size: pendingFormMedia.size,
        previewDataUrl: pendingFormMediaPreview,
      }),
    );
    state.formAnalyses.unshift(analysis);
    state.formAnalyses = state.formAnalyses.slice(0, 8);
    saveState("status.formAnalyzed");
    renderAnalysis();
    renderDashboard();
    renderInsights();
  } finally {
    submitButton.disabled = false;
  }
}

async function generateFormAnalysis(file, exerciseType, cameraAngle) {
  const poseResult = await estimatePoseFromMedia(file);
  if (poseResult && poseResult.keypoints.length) {
    return generatePoseBasedFormAnalysis(file, exerciseType, cameraAngle, poseResult);
  }
  setPoseModelStatus("fallback");
  return generateRuleBasedFormAnalysis(file, exerciseType, cameraAngle);
}

function generateRuleBasedFormAnalysis(file, exerciseType, cameraAngle) {
  const profile = exerciseProfiles[exerciseType];
  const readiness = calculateReadiness(state.health.metrics).score;
  const seed = hashString(`${file.name}-${exerciseType}-${cameraAngle}`) % 11;
  const mediaBonus = file.type.startsWith("video") ? 7 : 1;
  const angleBonus = profile.bestAngle === cameraAngle ? 5 : -3;
  const recoveryPenalty = readiness < 58 ? -4 : 0;
  const beginnerPenalty = state.profile.trainingExperience === "beginner" ? -2 : 1;
  const score = clamp(Math.round(73 + seed + mediaBonus + angleBonus + recoveryPenalty + beginnerPenalty), 45, 96);
  const riskLevel = score >= 82 ? "low" : score >= 68 ? "medium" : "high";
  const confidence = clamp(
    Math.round((file.type.startsWith("video") ? 78 : 62) + angleBonus + (file.size > 12_000_000 ? -8 : 0)),
    45,
    88,
  );
  const issueCount = riskLevel === "low" ? 1 : riskLevel === "medium" ? 2 : 3;
  const findings = profile.findings.map((item) => `已检查：${item}`);
  const issues = profile.issues.slice(0, issueCount);
  if (profile.bestAngle !== cameraAngle) {
    issues.unshift(`当前角度可用；${rawAngleLabel(profile.bestAngle)}角度会更适合识别 ${profile.label}`);
  }
  return {
    id: createId(),
    date: todayKey,
    exerciseType,
    exerciseLabel: profile.label,
    cameraAngle,
    mediaName: file.name,
    mediaKind: file.type.startsWith("video") ? "视频" : "照片",
    engine: "rule",
    score,
    riskLevel,
    confidence,
    findings,
    issues,
    compensations: profile.compensations.slice(0, issueCount),
    corrections: profile.corrections.slice(0, issueCount + 1),
    createdAt: new Date().toISOString(),
  };
}

async function estimatePoseFromMedia(file) {
  const detector = await loadPoseDetector();
  if (!detector) return null;

  let source = null;
  try {
    source = await createPoseSource(file);
    const poses = await detector.estimatePoses(source.element, {
      flipHorizontal: false,
      maxPoses: 1,
    });
    const pose = poses && poses[0];
    if (!pose || !Array.isArray(pose.keypoints)) {
      setPoseModelStatus("fallback");
      return null;
    }

    const poseResult = normalizePoseResult(pose, source.width, source.height);
    if (!poseResult || !poseResult.keypoints.length) {
      setPoseModelStatus("fallback");
      return {
        keypoints: [],
        validKeypointCount: poseResult ? poseResult.validKeypointCount : 0,
        averageScore: poseResult ? poseResult.averageScore : 0,
        sourceWidth: source.width,
        sourceHeight: source.height,
      };
    }

    setPoseModelStatus("ready");
    return poseResult;
  } catch (error) {
    console.warn("Pose estimation failed; using rule fallback.", error);
    setPoseModelStatus("fallback");
    return null;
  } finally {
    if (source && source.cleanup) source.cleanup();
  }
}

function normalizePoseResult(pose, sourceWidth, sourceHeight) {
  if (!pose || !Array.isArray(pose.keypoints)) return null;
  const keypoints = pose.keypoints.map((keypoint) => ({
    name: keypoint.name || keypoint.part,
    x: keypoint.x,
    y: keypoint.y,
    score: toNumber(keypoint.score, 0),
  }));
  const reliable = keypoints.filter((keypoint) => keypoint.score >= 0.25);
  const averageScore = reliable.length
    ? reliable.reduce((sum, keypoint) => sum + keypoint.score, 0) / reliable.length
    : 0;
  return {
    keypoints: reliable.length >= 6 && averageScore >= 0.22 ? keypoints : [],
    validKeypointCount: reliable.length,
    averageScore,
    sourceWidth,
    sourceHeight,
  };
}

function createPoseSource(file) {
  const url = pendingFormMediaUrl || URL.createObjectURL(file);
  const ownsUrl = !pendingFormMediaUrl;
  if (file.type.startsWith("video")) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.src = url;
      video.addEventListener(
        "loadedmetadata",
        () => {
          const targetTime = Number.isFinite(video.duration) && video.duration > 0 ? Math.min(1.2, video.duration * 0.35) : 0;
          const finish = () =>
            resolve({
              element: video,
              width: video.videoWidth || 640,
              height: video.videoHeight || 360,
              cleanup: () => {
                video.removeAttribute("src");
                video.load();
                if (ownsUrl) URL.revokeObjectURL(url);
              },
            });
          if (targetTime > 0) {
            video.addEventListener("seeked", finish, { once: true });
            video.currentTime = targetTime;
          } else {
            finish();
          }
        },
        { once: true },
      );
      video.addEventListener("error", () => reject(new Error("Unable to load video for pose analysis.")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener(
      "load",
      () =>
        resolve({
          element: image,
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
          cleanup: () => {
            if (ownsUrl) URL.revokeObjectURL(url);
          },
        }),
      { once: true },
    );
    image.addEventListener("error", () => reject(new Error("Unable to load image for pose analysis.")), { once: true });
    image.src = url;
  });
}

function generatePoseBasedFormAnalysis(file, exerciseType, cameraAngle, poseResult) {
  const profile = exerciseProfiles[exerciseType];
  const signals = derivePoseSignals(poseResult);
  const detectedIssues = [];
  const detectedCompensations = [];
  const corrections = [];

  if (profile.bestAngle !== cameraAngle) {
    detectedIssues.push(`当前角度可用；${rawAngleLabel(profile.bestAngle)}角度会更适合识别 ${profile.label}`);
  }
  if (poseResult.averageScore < 0.45) {
    detectedIssues.push("关键点置信度偏低");
    corrections.push("重新拍摄时保持全身入镜并提高光线");
  }
  if (signals.kneeBalance !== null && signals.kneeBalance > 18) {
    detectedIssues.push("左右膝角差异偏大");
    detectedCompensations.push("左右发力不均");
    corrections.push("降低速度，先做左右对称的控制组");
  }
  if (signals.shoulderTilt !== null && signals.shoulderTilt > 9) {
    detectedIssues.push("肩线左右高度不一致");
    detectedCompensations.push("肩胛控制不足");
    corrections.push("下一组先做肩胛定位，再开始主动作");
  }
  if (signals.hipTilt !== null && signals.hipTilt > 9) {
    detectedIssues.push("髋部左右高度不一致");
    detectedCompensations.push("髋稳定不足");
    corrections.push("加入单侧稳定练习，保持骨盆水平");
  }

  if (["squat", "lunge"].includes(exerciseType)) {
    if (signals.kneeAnkleOffset !== null && signals.kneeAnkleOffset > 0.36) {
      detectedIssues.push("膝盖与脚踝轨迹偏差较大");
      detectedCompensations.push("膝内扣");
      corrections.push("保持脚掌三点支撑，膝盖跟随脚尖方向");
    }
    if (signals.torsoLean !== null && signals.torsoLean > 26) {
      detectedIssues.push("躯干前倾角度偏大");
      detectedCompensations.push("髋主导不足");
      corrections.push("减少负重，练习暂停下蹲和髋踝活动度");
    }
  }

  if (["pushup", "plank"].includes(exerciseType) && signals.bodyLineAngle !== null && signals.bodyLineAngle < 160) {
    detectedIssues.push("核心直线需要更稳定");
    detectedCompensations.push("腰椎代偿");
    corrections.push("缩短每组时间，保持肋骨下沉和骨盆中立");
  }

  if (["press", "bench", "row"].includes(exerciseType) && signals.elbowBalance !== null && signals.elbowBalance > 20) {
    detectedIssues.push("左右肘角差异偏大");
    detectedCompensations.push("左右发力不均");
    corrections.push("降低重量，保持左右速度一致");
  }

  if (!detectedIssues.length) {
    detectedIssues.push("关键点轨迹整体稳定");
    corrections.push("保持当前重量，下一组继续用同角度复拍");
  }

  const penalties =
    detectedIssues.length * 5 +
    (poseResult.averageScore < 0.45 ? 8 : 0) +
    (profile.bestAngle !== cameraAngle ? 4 : 0);
  const score = clamp(Math.round(91 - penalties + poseResult.averageScore * 6), 48, 96);
  const riskLevel = score >= 82 ? "low" : score >= 68 ? "medium" : "high";
  const confidence = clamp(Math.round(poseResult.averageScore * 100), 35, 94);

  return {
    id: createId(),
    date: todayKey,
    exerciseType,
    exerciseLabel: profile.label,
    cameraAngle,
    mediaName: file.name,
    mediaKind: file.type.startsWith("video") ? "视频" : "照片",
    engine: "pose",
    score,
    riskLevel,
    confidence,
    findings: [
      `检测到 ${poseResult.validKeypointCount} 个有效人体关键点，平均置信度 ${confidence}%。`,
      ...profile.findings.map((item) => `已检查：${item}`),
    ],
    issues: detectedIssues,
    compensations: uniqueList([...detectedCompensations, ...profile.compensations]).slice(0, 4),
    corrections: uniqueList([...corrections, ...profile.corrections]).slice(0, 4),
    pose: {
      keypoints: poseResult.keypoints,
      sourceWidth: poseResult.sourceWidth,
      sourceHeight: poseResult.sourceHeight,
      validKeypointCount: poseResult.validKeypointCount,
      averageScore: poseResult.averageScore,
      signals,
    },
    createdAt: new Date().toISOString(),
  };
}

function derivePoseSignals(poseResult) {
  const point = (name) => poseResult.keypoints.find((keypoint) => keypoint.name === name && keypoint.score >= 0.25);
  const leftShoulder = point("left_shoulder");
  const rightShoulder = point("right_shoulder");
  const leftHip = point("left_hip");
  const rightHip = point("right_hip");
  const leftKnee = point("left_knee");
  const rightKnee = point("right_knee");
  const leftAnkle = point("left_ankle");
  const rightAnkle = point("right_ankle");
  const leftElbow = point("left_elbow");
  const rightElbow = point("right_elbow");
  const leftWrist = point("left_wrist");
  const rightWrist = point("right_wrist");

  const leftKneeAngle = angleAt(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = angleAt(rightHip, rightKnee, rightAnkle);
  const leftElbowAngle = angleAt(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = angleAt(rightShoulder, rightElbow, rightWrist);
  const shoulderMid = midpoint(leftShoulder, rightShoulder);
  const hipMid = midpoint(leftHip, rightHip);
  const kneeMid = midpoint(leftKnee, rightKnee);
  const shoulderWidth = distance(leftShoulder, rightShoulder) || poseResult.sourceWidth * 0.25;
  const kneeAnkleOffset =
    leftKnee && rightKnee && leftAnkle && rightAnkle
      ? (Math.abs(leftKnee.x - leftAnkle.x) + Math.abs(rightKnee.x - rightAnkle.x)) / 2 / shoulderWidth
      : null;

  return {
    leftKneeAngle,
    rightKneeAngle,
    kneeBalance: bothNumbers(leftKneeAngle, rightKneeAngle) ? Math.abs(leftKneeAngle - rightKneeAngle) : null,
    leftElbowAngle,
    rightElbowAngle,
    elbowBalance: bothNumbers(leftElbowAngle, rightElbowAngle) ? Math.abs(leftElbowAngle - rightElbowAngle) : null,
    torsoLean: shoulderMid && hipMid ? Math.abs((Math.atan2(shoulderMid.x - hipMid.x, hipMid.y - shoulderMid.y) * 180) / Math.PI) : null,
    shoulderTilt: tiltDegrees(leftShoulder, rightShoulder),
    hipTilt: tiltDegrees(leftHip, rightHip),
    bodyLineAngle: angleAt(shoulderMid, hipMid, kneeMid),
    kneeAnkleOffset,
  };
}

function angleAt(a, b, c) {
  if (!a || !b || !c) return null;
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magnitude = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (!magnitude) return null;
  return Math.round((Math.acos(clamp(dot / magnitude, -1, 1)) * 180) / Math.PI);
}

function midpoint(a, b) {
  if (!a || !b) return null;
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function distance(a, b) {
  if (!a || !b) return null;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function tiltDegrees(a, b) {
  if (!a || !b) return null;
  return Math.abs(Math.round((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI));
}

function bothNumbers(a, b) {
  return Number.isFinite(a) && Number.isFinite(b);
}

function uniqueList(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function handleHealthConnect() {
  state.health.authorized = true;
  recordHealthSnapshot("healthkit-simulated");
  state.health.updatedAt = new Date().toISOString();
  saveState("status.healthConnected");
  renderHealth();
  renderDashboard();
  renderInsights();
}

function handleHealthSubmit(event) {
  event.preventDefault();
  state.health.authorized = true;
  state.health.metrics = {
    sleepHours: numberFromInput("#sleepInput", 6.8),
    hrvMs: numberFromInput("#hrvInput", 48),
    restingHeartRate: numberFromInput("#rhrInput", 62),
    spo2: numberFromInput("#spo2Input", 97),
    steps: numberFromInput("#stepsInput", 8200),
    activeEnergyKcal: numberFromInput("#activeEnergyInput", 430),
    workoutLoad: numberFromInput("#workoutLoadInput", 62),
  };
  recordHealthSnapshot("manual");
  state.workoutPlan = generateWorkoutPlan(state.profile, calculateReadiness(state.health.metrics).score);
  saveState("status.healthSaved");
  render();
}

function handleHealthImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const imported = parseHealthImport(String(reader.result), file.name);
      state.health.authorized = true;
      state.health.metrics = { ...state.health.metrics, ...imported };
      recordHealthSnapshot("import");
      state.workoutPlan = generateWorkoutPlan(state.profile, calculateReadiness(state.health.metrics).score);
      populateHealthForm();
      saveState("status.healthImported");
      render();
    } catch (error) {
      window.alert(t("alert.importFailed", { message: error.message }));
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file);
}

function parseHealthImport(raw, filename) {
  if (filename.toLowerCase().endsWith(".json")) {
    const parsed = JSON.parse(raw);
    return normalizeHealthMetricKeys(parsed);
  }
  const rows = raw
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);
  if (rows.length < 2) throw new Error(currentLanguage() === "zh" ? "CSV 至少需要表头和一行数据" : "CSV needs a header and at least one data row");
  const headers = splitCsvRow(rows[0]).map((header) => header.trim());
  const values = splitCsvRow(rows[1]).map((value) => value.trim());
  const record = {};
  headers.forEach((header, index) => {
    record[header] = values[index];
  });
  return normalizeHealthMetricKeys(record);
}

function normalizeHealthMetricKeys(record) {
  const aliases = {
    sleepHours: ["sleepHours", "sleep", "睡眠小时", "sleep_hours"],
    hrvMs: ["hrvMs", "hrv", "HRV", "hrv_ms"],
    restingHeartRate: ["restingHeartRate", "rhr", "静息心率", "resting_heart_rate"],
    spo2: ["spo2", "SpO2", "bloodOxygen", "血氧"],
    steps: ["steps", "步数"],
    activeEnergyKcal: ["activeEnergyKcal", "activeEnergy", "活动能量", "active_energy"],
    workoutLoad: ["workoutLoad", "load", "训练负荷"],
  };
  const normalized = {};
  Object.entries(aliases).forEach(([targetKey, sourceKeys]) => {
    const foundKey = sourceKeys.find((key) => record[key] !== undefined);
    if (foundKey) normalized[targetKey] = toNumber(record[foundKey], state.health.metrics[targetKey]);
  });
  if (!Object.keys(normalized).length) throw new Error(currentLanguage() === "zh" ? "没有识别到支持的健康字段" : "No supported health fields were found");
  return normalized;
}

function calculateReadiness(metrics) {
  const sleep = toNumber(metrics.sleepHours, 0);
  const hrv = toNumber(metrics.hrvMs, 0);
  const rhr = toNumber(metrics.restingHeartRate, 0);
  const spo2 = toNumber(metrics.spo2, 0);
  const load = toNumber(metrics.workoutLoad, 0);
  const steps = toNumber(metrics.steps, 0);
  let score = 92;
  const factors = [];

  if (sleep < 6) {
    const penalty = Math.round((6 - sleep) * 11 + 9);
    score -= penalty;
    factors.push("睡眠明显不足");
  } else if (sleep < 7) {
    score -= 8;
    factors.push("睡眠略少");
  }

  if (hrv < 40) {
    score -= 16;
    factors.push("HRV 低于理想区间");
  } else if (hrv < 50) {
    score -= 8;
    factors.push("HRV 偏低");
  }

  if (rhr > 70) {
    score -= 14;
    factors.push("静息心率偏高");
  } else if (rhr > 64) {
    score -= 7;
    factors.push("静息心率略高");
  }

  if (spo2 && spo2 < 95) {
    score -= 13;
    factors.push("血氧偏低");
  }

  if (load > 82) {
    score -= 12;
    factors.push("训练负荷偏高");
  } else if (load > 70) {
    score -= 6;
    factors.push("训练负荷较高");
  }

  if (steps < 3000) {
    score -= 4;
    factors.push("日常活动偏少");
  }

  score = clamp(Math.round(score), 18, 98);
  const label = score >= 78 ? "恢复良好" : score >= 62 ? "压力适中" : score >= 45 ? "压力偏高" : "建议主动恢复";
  const level = score >= 78 ? "low" : score >= 62 ? "medium" : "high";
  return { score, label, level, factors };
}

function renderDashboard() {
  const readiness = calculateReadiness(state.health.metrics);
  const totals = getTodayNutritionTotals();
  const target = state.nutritionTarget;
  const remaining = target.calories - totals.calories;
  $("#readinessScore").textContent = readiness.score;
  $("#readinessRing").style.setProperty("--score", readiness.score);
  $("#stressLabel").textContent = localizePhrase(readiness.label);
  $("#stressLabel").className = `score-badge ${readiness.level === "high" ? "warm" : readiness.level === "medium" ? "blue" : ""}`;
  $("#caloriesIn").textContent = totals.calories;
  $("#caloriesTarget").textContent = target.calories;
  $("#calorieDelta").textContent =
    remaining >= 0 ? t("coach.calorieLeft", { value: remaining }) : t("coach.calorieOver", { value: Math.abs(remaining) });
  $("#formScoreMini").textContent = state.formAnalyses[0] ? `${state.formAnalyses[0].score}/100` : currentLanguage() === "zh" ? "未分析" : "No analysis";
  $("#healthSnapshot").innerHTML = renderHealthSnapshot(state.health.metrics, readiness);
  $("#macroBars").innerHTML = renderMacroBars(totals, target);
  $("#coachOutput").innerHTML = renderCoachAdvice();
  drawPoseCanvas(state.formAnalyses[0], readiness);
}

function renderHealthSnapshot(metrics, readiness) {
  const rows = [
    [currentLanguage() === "zh" ? "睡眠" : "Sleep", `${toNumber(metrics.sleepHours, 0).toFixed(1)}h`],
    ["HRV", `${Math.round(toNumber(metrics.hrvMs, 0))} ms`],
    [currentLanguage() === "zh" ? "静息心率" : "Resting HR", `${Math.round(toNumber(metrics.restingHeartRate, 0))} bpm`],
    [currentLanguage() === "zh" ? "血氧" : "SpO2", `${toNumber(metrics.spo2, 0).toFixed(1)}%`],
    [currentLanguage() === "zh" ? "步数" : "Steps", `${Math.round(toNumber(metrics.steps, 0)).toLocaleString(currentLanguage() === "zh" ? "zh-CN" : "en-US")}`],
  ];
  if (readiness.factors.length) {
    rows.push([currentLanguage() === "zh" ? "主要因素" : "Main factors", localizeList(readiness.factors.slice(0, 2)).join(currentLanguage() === "zh" ? "、" : ", ")]);
  }
  return rows
    .map(
      ([label, value]) => `
        <div class="metric-item">
          <span class="label">${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `,
    )
    .join("");
}

function renderMacroBars(totals, target) {
  const macros = [
    [t("macro.protein"), totals.proteinG, target.proteinG, "protein"],
    [t("macro.carbs"), totals.carbsG, target.carbsG, "carbs"],
    [t("macro.fat"), totals.fatG, target.fatG, "fat"],
  ];
  return macros
    .map(([label, value, goal, className]) => {
      const percent = clamp(Math.round((value / goal) * 100), 0, 140);
      return `
        <div class="macro-row">
          <header>
            <strong>${label}</strong>
            <span>${Math.round(value)}g / ${goal}g</span>
          </header>
          <div class="progress-track" aria-hidden="true">
            <div class="progress-fill ${className}" style="width:${Math.min(percent, 100)}%"></div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderCoachAdvice() {
  const target = state.nutritionTarget;
  const totals = getTodayNutritionTotals();
  const readiness = calculateReadiness(state.health.metrics);
  const todayPlan = state.workoutPlan[0];
  const latestAnalysis = state.formAnalyses[0];
  const proteinGap = Math.max(0, target.proteinG - totals.proteinG);
  const calorieGap = target.calories - totals.calories;
  const advice = [];

  if (proteinGap >= 35) {
    advice.push([
      t("coach.priority"),
      t("coach.proteinGap", {
        proteinGap,
        calorieText: calorieGap >= 0 ? t("coach.calorieLeft", { value: calorieGap }) : t("coach.calorieOver", { value: Math.abs(calorieGap) }),
      }),
    ]);
  } else if (calorieGap < -180) {
    advice.push([t("coach.priority"), t("coach.overCalories")]);
  } else {
    advice.push([t("coach.priority"), t("coach.stableNutrition")]);
  }

  if (readiness.score < 58) {
    advice.push([t("coach.training"), t("coach.lowReadiness")]);
  } else if (todayPlan) {
    advice.push([
      t("coach.training"),
      t("coach.todayPlan", {
        focus: localizePhrase(todayPlan.focus),
        intensity: localizePhrase(todayPlan.intensity),
        rest: todayPlan.rest,
      }),
    ]);
  }

  if (latestAnalysis && latestAnalysis.riskLevel !== "low") {
    advice.push([
      t("coach.form"),
      t("coach.formIssue", {
        exercise: localizePhrase(latestAnalysis.exerciseLabel),
        compensation: localizePhrase(latestAnalysis.compensations[0]),
        angle: angleLabel(exerciseProfiles[latestAnalysis.exerciseType].bestAngle),
      }),
    ]);
  } else if (readiness.factors.length) {
    advice.push([t("coach.recovery"), t("coach.recoveryFactor", { factor: localizePhrase(readiness.factors[0]) })]);
  } else {
    advice.push([t("coach.recovery"), t("coach.recoveryStable")]);
  }

  return advice
    .map(
      ([title, body]) => `
        <div class="coach-item">
          <div>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(body)}</p>
          </div>
        </div>
      `,
    )
    .join("");
}

async function handleAgentSubmit(event) {
  event.preventDefault();
  const input = $("#agentPromptInput");
  const prompt = input.value.trim();
  if (!prompt) return;
  appendAgentMessage("user", prompt);
  input.value = "";
  renderAgent();
  await runAgentCycle(prompt);
}

async function runAgentCycle(userPrompt = "") {
  const controls = [$("#runAgent"), $("#rerunAgent"), $("#agentForm .primary-button")].filter(Boolean);
  controls.forEach((control) => {
    control.disabled = true;
  });
  setAgentStatus("running");

  try {
    const context = buildAgentContext(userPrompt);
    appendAgentMessage("trace", buildAgentObservation(context), t("agent.observe"));
    renderAgent();
    await delay(220);

    appendAgentMessage("trace", buildAgentReasoning(context, userPrompt), t("agent.reason"));
    renderAgent();
    await delay(260);

    const tasks = generateAgentTasks(context, userPrompt);
    state.agent.tasks = mergeAgentTasks(tasks);
    appendAgentMessage("agent", buildAgentReply(context, tasks, userPrompt), t("agent.act"));
    state.agent.lastRunAt = new Date().toISOString();
    setAgentStatus("idle");
    saveState("status.agentDone");
    render();
  } finally {
    controls.forEach((control) => {
      control.disabled = false;
    });
  }
}

function setAgentStatus(status) {
  state.agent.status = status;
  const element = $("#agentStatus");
  if (!element) return;
  element.textContent = status === "running" ? t("status.agentRunning") : t("status.agentReady");
}

function renderAgent() {
  setAgentStatus(state.agent.status === "running" ? "running" : "idle");
  $("#agentStream").innerHTML = renderAgentStream();
  $("#agentTaskList").innerHTML = renderAgentTasks();
}

function renderAgentStream() {
  const messages = state.agent.messages.slice(-18);
  if (!messages.length) {
    return `<span class="placeholder">${t("placeholder.noAgentMessages")}</span>`;
  }
  return messages
    .map((message) => {
      const roleLabel =
        message.label ||
        (message.role === "user" ? state.profile.name || "You" : message.role === "trace" ? t("agent.reason") : "FitSnap Agent");
      return `
        <div class="agent-message ${escapeHtml(message.role)}">
          <span>${escapeHtml(roleLabel)}</span>
          <p>${escapeHtml(message.content)}</p>
        </div>
      `;
    })
    .join("");
}

function renderAgentTasks() {
  const tasks = state.agent.tasks
    .slice()
    .sort((a, b) => taskStatusWeight(a.status) - taskStatusWeight(b.status) || taskPriorityWeight(a.priority) - taskPriorityWeight(b.priority))
    .slice(0, 8);
  if (!tasks.length) {
    return `<span class="placeholder">${t("placeholder.noAgentTasks")}</span>`;
  }
  return tasks
    .map((task) => {
      const done = task.status === "done";
      return `
        <article class="agent-task ${escapeHtml(task.status || "open")}">
          <div class="agent-task-head">
            <div>
              <span class="label">${escapeHtml(textByLanguage(task.typeLabel))}</span>
              <h3>${escapeHtml(textByLanguage(task.title))}</h3>
            </div>
            <span class="pill ${escapeHtml(task.priority || "medium")}">${escapeHtml(priorityLabel(task.priority))}</span>
          </div>
          <p>${escapeHtml(textByLanguage(task.body))}</p>
          <div class="task-meta">
            <span>${t("agent.evidence")}：${escapeHtml(textByLanguage(task.evidence))}</span>
            <span>${escapeHtml(textByLanguage(task.due))}</span>
          </div>
          <div class="agent-task-actions">
            <button class="secondary-button compact" type="button" data-agent-task="${escapeHtml(task.id)}" data-agent-action="open" ${done ? "disabled" : ""}>
              ${t("button.openTask")}
            </button>
            <button class="primary-button compact" type="button" data-agent-task="${escapeHtml(task.id)}" data-agent-action="done" ${done ? "disabled" : ""}>
              ${done ? t("agent.status.done") : t("button.doneTask")}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function handleAgentTaskAction(event) {
  const button = event.target.closest("[data-agent-action]");
  if (!button) return;
  const task = state.agent.tasks.find((item) => item.id === button.dataset.agentTask);
  if (!task) return;
  const action = button.dataset.agentAction;

  if (action === "open") {
    task.status = "active";
    task.updatedAt = new Date().toISOString();
    appendAgentMessage("agent", agentOpenedMessage(task), t("agent.act"));
    saveState("status.agentTaskOpened");
    renderAgent();
    const target = task.href ? $(task.href) : null;
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (action === "done") {
    task.status = "done";
    task.completedAt = new Date().toISOString();
    task.updatedAt = task.completedAt;
    if (task.action === "markWorkoutDone" && task.workoutDate) {
      state.completedWorkoutDates[task.workoutDate] = true;
    }
    appendAgentMessage("agent", agentDoneMessage(task), t("agent.act"));
    saveState("status.agentTaskDone");
    render();
  }
}

function buildAgentContext(userPrompt = "") {
  const target = state.nutritionTarget || computeNutritionTarget(state.profile);
  const totals = getTodayNutritionTotals();
  const readiness = calculateReadiness(state.health.metrics);
  const todayPlan = state.workoutPlan.find((day) => day.date === todayKey) || state.workoutPlan[0];
  const latestAnalysis = state.formAnalyses[0] || null;
  const trainingDays = state.workoutPlan.filter((day) => !day.isRestDay);
  const completedTrainingDays = trainingDays.filter((day) => state.completedWorkoutDates[day.id]).length;
  return {
    target,
    totals,
    readiness,
    todayPlan,
    latestAnalysis,
    userPrompt,
    meals: getTodayMeals(),
    proteinGap: Math.max(0, target.proteinG - totals.proteinG),
    calorieGap: target.calories - totals.calories,
    workoutCompleted: todayPlan ? Boolean(state.completedWorkoutDates[todayPlan.id]) : false,
    weeklyCompletion: { done: completedTrainingDays, total: trainingDays.length },
    intent: detectAgentIntent(userPrompt),
  };
}

function buildAgentObservation(context) {
  const latestForm = context.latestAnalysis
    ? `${localizePhrase(context.latestAnalysis.exerciseLabel)} ${context.latestAnalysis.score}/100`
    : currentLanguage() === "zh"
      ? "暂无动作分析"
      : "no form analysis yet";
  if (currentLanguage() === "en") {
    return `Read ${context.meals.length} meals, ${context.totals.calories}/${context.target.calories} kcal, ${context.proteinGap}g protein gap, readiness ${context.readiness.score}, today plan ${localizePhrase(context.todayPlan.focus)}, and ${latestForm}.`;
  }
  return `已读取 ${context.meals.length} 条餐食、${context.totals.calories}/${context.target.calories} kcal、蛋白缺口 ${context.proteinGap}g、恢复 ${context.readiness.score} 分、今日训练 ${localizePhrase(context.todayPlan.focus)}、最近动作 ${latestForm}。`;
}

function buildAgentReasoning(context, userPrompt) {
  const intentCopy = context.intent
    ? currentLanguage() === "zh"
      ? `用户意图偏向 ${intentLabel(context.intent)}。`
      : `User intent leans ${intentLabel(context.intent)}.`
    : "";
  if (context.readiness.score < 58) {
    return currentLanguage() === "zh"
      ? `${intentCopy} 恢复评分低，先保护训练质量，再安排营养和动作复盘。`
      : `${intentCopy} Readiness is low, so the agent protects training quality before nutrition and form work.`;
  }
  if (context.proteinGap >= 30 || context.calorieGap < -180) {
    return currentLanguage() === "zh"
      ? `${intentCopy} 今日营养偏离目标，先修正下一餐，再看训练执行。`
      : `${intentCopy} Nutrition is off target, so the next meal gets priority before training execution.`;
  }
  if (context.latestAnalysis && context.latestAnalysis.riskLevel !== "low") {
    return currentLanguage() === "zh"
      ? `${intentCopy} 动作风险还没有关闭，下一组需要先处理代偿。`
      : `${intentCopy} Form risk is still open, so the next set should address compensation first.`;
  }
  return currentLanguage() === "zh"
    ? `${intentCopy || "没有额外限制。"} 当前适合按计划推进，同时保留一个恢复检查点。`
    : `${intentCopy || "No extra constraint."} Current data supports the plan with one recovery checkpoint.`;
}

function generateAgentTasks(context, userPrompt) {
  const tasks = [];
  const add = (task) => {
    if (!tasks.some((item) => item.id === task.id)) tasks.push(task);
  };

  if (context.intent === "nutrition" || context.proteinGap >= 30 || !context.meals.length) {
    add(
      createAgentTask({
        type: "nutrition",
        priority: context.proteinGap >= 35 ? "high" : "medium",
        href: "#nutrition",
        title: ["补齐下一餐蛋白质", "Close the next-meal protein gap"],
        body: [
          `下一餐优先安排 ${Math.min(45, Math.max(25, context.proteinGap || 28))}g 蛋白质，热量还${context.calorieGap >= 0 ? `剩 ${context.calorieGap}` : `超 ${Math.abs(context.calorieGap)}`} kcal。`,
          `Prioritize ${Math.min(45, Math.max(25, context.proteinGap || 28))}g protein at the next meal; calories are ${context.calorieGap >= 0 ? `${context.calorieGap} kcal under` : `${Math.abs(context.calorieGap)} kcal over`} target.`,
        ],
        evidence: [
          `今日蛋白 ${Math.round(context.totals.proteinG)}/${context.target.proteinG}g，餐食 ${context.meals.length} 条。`,
          `Protein is ${Math.round(context.totals.proteinG)}/${context.target.proteinG}g with ${context.meals.length} meal logs today.`,
        ],
        due: ["下一餐", "Next meal"],
      }),
    );
  }

  if (context.readiness.score < 58 || context.intent === "recovery") {
    add(
      createAgentTask({
        type: "recovery",
        priority: "high",
        href: "#health",
        title: ["把今日训练降到恢复模式", "Switch today to recovery mode"],
        body: [
          "把主动作保留为技术练习，强度控制在 RPE 6，晚间把睡眠窗口提前 30 分钟。",
          "Keep main lifts as technique practice at RPE 6 and move the sleep window 30 minutes earlier tonight.",
        ],
        evidence: [
          `恢复 ${context.readiness.score} 分；${context.readiness.factors.join("、") || "指标稳定"}。`,
          `Readiness is ${context.readiness.score}; ${context.readiness.factors.map(englishPhrase).join(", ") || "metrics stable"}.`,
        ],
        due: ["今天", "Today"],
      }),
    );
  } else if (context.todayPlan && !context.workoutCompleted && (context.intent === "training" || tasks.length < 3)) {
    add(
      createAgentTask({
        type: "training",
        priority: context.todayPlan.isRestDay ? "low" : "medium",
        href: "#training",
        action: "markWorkoutDone",
        workoutDate: context.todayPlan.id,
        title: [context.todayPlan.isRestDay ? "完成主动恢复" : "执行今日训练", context.todayPlan.isRestDay ? "Finish active recovery" : "Complete today's training"],
        body: [
          `${context.todayPlan.focus}，强度 ${context.todayPlan.intensity}，组间休息 ${context.todayPlan.rest}。`,
          `${englishPhrase(context.todayPlan.focus)}, ${englishPhrase(context.todayPlan.intensity)}, ${context.todayPlan.rest} rest.`,
        ],
        evidence: [
          `本周完成 ${context.weeklyCompletion.done}/${context.weeklyCompletion.total} 个训练日。`,
          `${context.weeklyCompletion.done}/${context.weeklyCompletion.total} training days completed this week.`,
        ],
        due: ["今天训练窗口", "Today's training window"],
      }),
    );
  }

  if (context.latestAnalysis && context.latestAnalysis.riskLevel !== "low") {
    add(
      createAgentTask({
        type: "form",
        priority: context.latestAnalysis.riskLevel === "high" ? "high" : "medium",
        href: "#motion",
        title: ["复拍一组动作纠正视频", "Film one corrected form set"],
        body: [
          `${context.latestAnalysis.exerciseLabel} 先处理 ${context.latestAnalysis.compensations[0]}，降低重量后从 ${rawAngleLabel(exerciseProfiles[context.latestAnalysis.exerciseType].bestAngle)} 复拍。`,
          `For ${englishPhrase(context.latestAnalysis.exerciseLabel)}, address ${englishPhrase(context.latestAnalysis.compensations[0])}, reduce load, and refilm from the ${englishPhrase(rawAngleLabel(exerciseProfiles[context.latestAnalysis.exerciseType].bestAngle))} angle.`,
        ],
        evidence: [
          `最近动作评分 ${context.latestAnalysis.score}/100，风险：${riskLabelInLanguage(context.latestAnalysis.riskLevel, "zh")}。`,
          `Latest form score is ${context.latestAnalysis.score}/100, risk: ${riskLabelInLanguage(context.latestAnalysis.riskLevel, "en")}.`,
        ],
        due: ["下一组前", "Before the next set"],
      }),
    );
  } else if (!context.latestAnalysis && (context.intent === "form" || tasks.length < 3)) {
    add(
      createAgentTask({
        type: "form",
        priority: "low",
        href: "#motion",
        title: ["上传一次主动作视频", "Upload one main-lift video"],
        body: [
          "选择今日训练的第一个主动作，拍侧面或正面全身画面，建立动作基线。",
          "Pick the first main lift today and film a full-body side or front view to create a form baseline.",
        ],
        evidence: ["今天还没有动作分析记录。", "No form analysis has been logged today."],
        due: ["训练中", "During training"],
      }),
    );
  }

  if (context.readiness.score >= 58 && toNumber(state.health.metrics.sleepHours, 0) < 7 && tasks.length < 4) {
    add(
      createAgentTask({
        type: "recovery",
        priority: "medium",
        href: "#health",
        title: ["设置睡前降速流程", "Set a bedtime downshift"],
        body: ["睡前 20 分钟做低光、慢呼吸和屏幕降亮，目标把睡眠拉回 7 小时以上。", "Use 20 minutes of low light, slow breathing, and dimmed screens to push sleep back above 7 hours."],
        evidence: [`昨晚睡眠 ${toNumber(state.health.metrics.sleepHours, 0).toFixed(1)}h。`, `Sleep is ${toNumber(state.health.metrics.sleepHours, 0).toFixed(1)}h.`],
        due: ["睡前", "Before bed"],
      }),
    );
  }

  if (!tasks.length) {
    add(
      createAgentTask({
        type: "training",
        priority: "low",
        href: "#dashboard",
        title: ["按计划推进并记录一次反馈", "Follow the plan and log one feedback signal"],
        body: ["今天数据稳定，完成训练或餐食后回来刷新 Agent，让它继续调整下一步。", "Data looks stable today. Finish a workout or meal log, then rerun the agent for the next adjustment."],
        evidence: [`恢复 ${context.readiness.score} 分，热量差 ${context.calorieGap} kcal。`, `Readiness ${context.readiness.score}, calorie delta ${context.calorieGap} kcal.`],
        due: ["今天", "Today"],
      }),
    );
  }

  return tasks.sort((a, b) => taskPriorityWeight(a.priority) - taskPriorityWeight(b.priority)).slice(0, 4);
}

function createAgentTask({ type, priority, href, action, workoutDate, title, body, evidence, due }) {
  const [titleZh, titleEn] = title;
  const id = `agent-${todayKey}-${hashString(`${type}-${titleZh}`)}`;
  return {
    id,
    date: todayKey,
    type,
    typeLabel: {
      zh: { nutrition: "饮食", training: "训练", recovery: "恢复", form: "动作" }[type] || "Agent",
      en: { nutrition: "Nutrition", training: "Training", recovery: "Recovery", form: "Form" }[type] || "Agent",
    },
    priority,
    status: "open",
    href,
    action: action || "",
    workoutDate: workoutDate || "",
    title: { zh: titleZh, en: titleEn },
    body: { zh: body[0], en: body[1] },
    evidence: { zh: evidence[0], en: evidence[1] },
    due: { zh: due[0], en: due[1] },
    createdAt: new Date().toISOString(),
  };
}

function mergeAgentTasks(nextTasks) {
  const oldById = new Map(state.agent.tasks.map((task) => [task.id, task]));
  const nextIds = new Set(nextTasks.map((task) => task.id));
  const merged = nextTasks.map((task) => {
    const previous = oldById.get(task.id);
    return {
      ...task,
      status: previous ? previous.status : task.status,
      createdAt: previous ? previous.createdAt : task.createdAt,
      updatedAt: previous ? previous.updatedAt : task.updatedAt,
      completedAt: previous ? previous.completedAt : task.completedAt,
    };
  });
  const carryOver = state.agent.tasks
    .filter((task) => task.date === todayKey && !nextIds.has(task.id) && task.status !== "done")
    .slice(0, 3);
  const completed = state.agent.tasks.filter((task) => task.date === todayKey && task.status === "done").slice(0, 4);
  return [...merged, ...carryOver, ...completed].slice(0, 10);
}

function buildAgentReply(context, tasks) {
  const openTasks = tasks.filter((task) => task.status !== "done");
  const topTask = openTasks[0] || tasks[0];
  if (currentLanguage() === "en") {
    return `I created ${tasks.length} action${tasks.length === 1 ? "" : "s"}. Start with "${textByLanguage(topTask.title)}" because it has the clearest impact on today's goal. After you log the result, rerun me and I will adjust the next move.`;
  }
  return `我生成了 ${tasks.length} 个行动项。先做「${textByLanguage(topTask.title)}」，因为它对今天目标的影响最大。完成或记录结果后重新运行 Agent，我会继续调整下一步。`;
}

function appendAgentMessage(role, content, label = "") {
  state.agent.messages = [
    ...state.agent.messages,
    {
      id: createId(),
      role,
      label,
      content,
      createdAt: new Date().toISOString(),
    },
  ].slice(-36);
}

function detectAgentIntent(prompt) {
  const text = String(prompt || "").toLowerCase();
  if (!text) return "";
  if (/meal|food|protein|calorie|diet|吃|餐|蛋白|热量|饮食/.test(text)) return "nutrition";
  if (/workout|training|train|lift|练|训练|力量|臀|腿|胸|背/.test(text)) return "training";
  if (/sleep|hrv|recovery|heart|rest|睡|恢复|心率|休息|血氧/.test(text)) return "recovery";
  if (/form|pose|video|squat|deadlift|动作|视频|深蹲|硬拉|代偿/.test(text)) return "form";
  return "";
}

function intentLabel(intent) {
  const labels = {
    nutrition: currentLanguage() === "zh" ? "饮食" : "nutrition",
    training: currentLanguage() === "zh" ? "训练" : "training",
    recovery: currentLanguage() === "zh" ? "恢复" : "recovery",
    form: currentLanguage() === "zh" ? "动作" : "form",
  };
  return labels[intent] || intent;
}

function agentOpenedMessage(task) {
  return currentLanguage() === "zh"
    ? `已打开「${textByLanguage(task.title)}」对应位置。`
    : `Opened the section for "${textByLanguage(task.title)}."`;
}

function agentDoneMessage(task) {
  return currentLanguage() === "zh"
    ? `已把「${textByLanguage(task.title)}」标记完成。`
    : `Marked "${textByLanguage(task.title)}" as done.`;
}

function priorityLabel(priority) {
  return t(`agent.priority.${priority || "medium"}`);
}

function textByLanguage(value) {
  if (!value || typeof value === "string") return value || "";
  return currentLanguage() === "en" ? value.en || value.zh || "" : value.zh || value.en || "";
}

function taskPriorityWeight(priority) {
  return { high: 0, medium: 1, low: 2 }[priority] ?? 1;
}

function taskStatusWeight(status) {
  return { active: 0, open: 1, done: 2 }[status] ?? 1;
}

function renderInsights() {
  const canvas = $("#trendCanvas");
  if (!canvas) return;

  $("#databaseStatus").textContent = dbReady ? t("status.dbReady") : t("status.storageFallback");
  $$("#insightPeriodControls button").forEach((button) => {
    button.classList.toggle("active", button.dataset.period === visualizationState.period);
  });
  $("#insightMetricInput").value = visualizationState.metric;

  const points = buildTrendPoints(visualizationState.period, visualizationState.metric);
  visualizationState.points = points;
  $("#insightSummary").innerHTML = renderInsightSummary(points, visualizationState.metric);
  $("#uploadTimeline").innerHTML = renderUploadTimeline();
  requestAnimationFrame(() => drawTrendChart(points, visualizationState.metric));
}

function handleInsightPeriodChange(event) {
  const button = event.target.closest("[data-period]");
  if (!button) return;
  visualizationState.period = button.dataset.period;
  renderInsights();
}

function handleInsightMetricChange(event) {
  visualizationState.metric = event.target.value;
  renderInsights();
}

function buildTrendPoints(period, metricKey) {
  const dayCount = period === "month" ? 30 : 7;
  const start = addDays(today, -(dayCount - 1));
  return Array.from({ length: dayCount }, (_, index) => {
    const date = addDays(start, index);
    const dateKey = toDateKey(date);
    const meals = state.meals.filter((meal) => meal.date === dateKey);
    const analyses = state.formAnalyses.filter((analysis) => analysis.date === dateKey);
    const uploads = state.mediaAssets.filter((asset) => asset.date === dateKey);
    const snapshot = getHealthSnapshotForDate(dateKey);
    const nutrition = meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + toNumber(meal.calories, 0),
        proteinG: totals.proteinG + toNumber(meal.proteinG, 0),
      }),
      { calories: 0, proteinG: 0 },
    );
    const values = {
      calories: nutrition.calories,
      protein: nutrition.proteinG,
      workouts: state.completedWorkoutDates[dateKey] ? 1 : 0,
      readiness: snapshot ? snapshot.readinessScore : dateKey === todayKey ? calculateReadiness(state.health.metrics).score : null,
      formScore: analyses.length ? Math.round(analyses.reduce((sum, item) => sum + item.score, 0) / analyses.length) : null,
      uploads: uploads.length,
    };
    return {
      date: dateKey,
      label: period === "month" ? `${date.getMonth() + 1}/${date.getDate()}` : getWeekdayLabel(date),
      fullLabel: formatShortDate(date),
      value: values[metricKey],
      meals: meals.length,
      uploads: uploads.length,
    };
  });
}

function renderInsightSummary(points, metricKey) {
  const metric = insightMetrics[metricKey];
  const numericValues = points.map((point) => point.value).filter((value) => value !== null && value !== undefined);
  const total = numericValues.reduce((sum, value) => sum + value, 0);
  const average = numericValues.length ? total / numericValues.length : 0;
  const target = getMetricTarget(metricKey);
  const activeDays = numericValues.filter((value) => value > 0).length;
  const hasSignal = metricKey === "readiness" ? numericValues.length > 0 : activeDays > 0;
  const bestPoint = hasSignal
    ? points.reduce((best, point) => {
    if (point.value === null || point.value === undefined || point.value <= 0) return best;
    if (!best || point.value > best.value) return point;
    return best;
  }, null)
    : null;
  const deltaLabel = target
    ? hasSignal
      ? currentLanguage() === "zh"
        ? `${Math.round((average / target) * 100)}% 目标`
        : `${Math.round((average / target) * 100)}% of target`
      : "--"
    : currentLanguage() === "zh"
      ? `${activeDays}/${points.length} 天有记录`
      : `${activeDays}/${points.length} days logged`;

  return `
    <div class="insight-stat">
      <span class="label">${t("chart.total")}</span>
      <strong>${formatMetricValue(total, metricKey)}</strong>
    </div>
    <div class="insight-stat">
      <span class="label">${t("chart.average")}</span>
      <strong>${formatMetricValue(average, metricKey)}</strong>
    </div>
    <div class="insight-stat">
      <span class="label">${t("chart.vsTarget")}</span>
      <strong>${escapeHtml(deltaLabel)}</strong>
    </div>
    <div class="insight-stat">
      <span class="label">${t("chart.bestDay")}</span>
      <strong>${bestPoint ? escapeHtml(bestPoint.label) : "--"}</strong>
    </div>
    <p class="summary-note full-span">${escapeHtml(t(metric.labelKey))} · ${hasSignal ? t("chart.help") : t("chart.empty")}</p>
  `;
}

function renderUploadTimeline() {
  const recentAssets = state.mediaAssets.slice(0, 5);
  if (!recentAssets.length) {
    return `<span class="placeholder">${t("placeholder.noUploads")}</span>`;
  }
  return `
    <p class="eyebrow">${t("section.recentUploads")}</p>
    ${recentAssets
      .map(
        (asset) => `
          <div class="timeline-item">
            <span class="timeline-dot" aria-hidden="true"></span>
            <div>
              <strong>${escapeHtml(mediaRecordLabel(asset.recordType))}</strong>
              <p>${escapeHtml(asset.name)} · ${escapeHtml(asset.date)} · ${formatBytes(asset.size)}</p>
            </div>
          </div>
        `,
      )
      .join("")}
  `;
}

function drawTrendChart(points, metricKey) {
  const canvas = $("#trendCanvas");
  const frame = canvas.parentElement;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(320, Math.floor(rect.width || 920));
  const height = Math.max(260, Math.floor(rect.height || 360));
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const metric = insightMetrics[metricKey];
  const padding = { top: 34, right: 22, bottom: 54, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = points.map((point) => toNumber(point.value, 0));
  const target = getMetricTarget(metricKey);
  const maxValue = Math.max(1, target || 0, ...values) * 1.18;
  const minY = padding.top;
  const maxY = padding.top + chartHeight;

  ctx.fillStyle = "#101923";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(247,249,250,0.10)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(247,249,250,0.68)";
  ctx.font = "600 12px system-ui, sans-serif";

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (chartHeight / 4) * i;
    const label = Math.round(maxValue - (maxValue / 4) * i);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(String(label), 14, y + 4);
  }

  if (target) {
    const targetY = scaleY(target, maxValue, minY, maxY);
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "rgba(244,201,93,0.58)";
    ctx.beginPath();
    ctx.moveTo(padding.left, targetY);
    ctx.lineTo(width - padding.right, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(244,201,93,0.88)";
    ctx.fillText(t("chart.target"), width - padding.right - 52, targetY - 8);
  }

  const gap = chartWidth / points.length;
  visualizationState.hitRegions = [];
  if (metric.kind === "line") {
    ctx.strokeStyle = metric.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((point, index) => {
      const x = padding.left + gap * index + gap / 2;
      const y = point.value === null || point.value === undefined ? null : scaleY(point.value, maxValue, minY, maxY);
      if (y === null) return;
      if (index === 0 || points.slice(0, index).every((previous) => previous.value === null || previous.value === undefined)) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  points.forEach((point, index) => {
    const x = padding.left + gap * index + gap / 2;
    const value = toNumber(point.value, 0);
    const y = scaleY(value, maxValue, minY, maxY);
    if (metric.kind === "bar") {
      const barWidth = Math.max(10, Math.min(34, gap * 0.56));
      const barHeight = Math.max(2, maxY - y);
      ctx.fillStyle = value > 0 ? metric.color : "rgba(247,249,250,0.12)";
      roundRect(ctx, x - barWidth / 2, maxY - barHeight, barWidth, barHeight, 5);
      ctx.fill();
    } else if (point.value !== null && point.value !== undefined) {
      ctx.fillStyle = "#101923";
      ctx.strokeStyle = metric.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (points.length <= 10 || index % 3 === 0 || index === points.length - 1) {
      ctx.fillStyle = "rgba(247,249,250,0.68)";
      ctx.textAlign = "center";
      ctx.fillText(point.label, x, height - 22);
      ctx.textAlign = "left";
    }
    visualizationState.hitRegions.push({ x, y, radius: Math.max(18, gap * 0.45), point });
  });

  ctx.fillStyle = "#F7F9FA";
  ctx.font = "800 18px system-ui, sans-serif";
  ctx.fillText(t(metric.labelKey), padding.left, 24);
  ctx.fillStyle = "rgba(247,249,250,0.66)";
  ctx.font = "600 12px system-ui, sans-serif";
  ctx.fillText(`${t(visualizationState.period === "week" ? "range.week" : "range.month")} · ${metricUnit(metricKey)}`, padding.left + 112, 24);
  frame.dataset.metric = metricKey;
}

function handleChartPointerMove(event) {
  const canvas = $("#trendCanvas");
  const frame = canvas.parentElement;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const hit = visualizationState.hitRegions.reduce((best, region) => {
    const distance = Math.hypot(region.x - x, region.y - y);
    if (distance <= region.radius && (!best || distance < best.distance)) return { ...region, distance };
    return best;
  }, null);
  if (!hit) {
    hideChartTooltip();
    return;
  }

  const metric = insightMetrics[visualizationState.metric];
  const tooltip = $("#chartTooltip");
  tooltip.hidden = false;
  tooltip.innerHTML = `
    <strong>${escapeHtml(hit.point.fullLabel)}</strong>
    ${t("chart.tooltip", {
      metric: escapeHtml(t(metric.labelKey)),
      value: formatMetricValue(hit.point.value, visualizationState.metric),
      meals: hit.point.meals,
      uploads: hit.point.uploads,
    })}
  `;
  const left = clamp(hit.x + 12, 8, frame.clientWidth - 230);
  const top = clamp(hit.y - 58, 8, frame.clientHeight - 90);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideChartTooltip() {
  const tooltip = $("#chartTooltip");
  if (tooltip) tooltip.hidden = true;
}

function renderTargetSummary() {
  const target = state.nutritionTarget;
  const profile = state.profile;
  $("#goalMode").textContent = localizePhrase(target.modeLabel);
  const weeklyPace =
    target.mode === "cut"
      ? t("summary.cutPace")
      : target.mode === "bulk"
        ? t("summary.bulkPace")
        : t("summary.recompPace");
  $("#targetSummary").innerHTML = `
    <div class="summary-grid">
      <div class="summary-stat">
        <span class="label">${t("summary.dailyCalories")}</span>
        <strong>${target.calories}</strong>
      </div>
      <div class="summary-stat">
        <span class="label">${t("summary.protein")}</span>
        <strong>${target.proteinG}g</strong>
      </div>
      <div class="summary-stat">
        <span class="label">${t("summary.tdee")}</span>
        <strong>${target.tdee}</strong>
      </div>
      <div class="summary-stat">
        <span class="label">${t("summary.weightDelta")}</span>
        <strong>${formatSigned(profile.targetWeightKg - profile.currentWeightKg)}kg</strong>
      </div>
    </div>
    <p class="summary-note">${escapeHtml(t("summary.profile", {
      name: profile.name,
      mode: localizePhrase(target.modeLabel),
      pace: weeklyPace,
      days: profile.trainingDaysPerWeek,
    }))}</p>
    <p class="summary-note">${escapeHtml(t("summary.macros", {
      carbs: target.carbsG,
      fat: target.fatG,
      diet: localizePhrase(profile.dietPreference || (currentLanguage() === "zh" ? "未填写" : "Not set")),
    }))}</p>
  `;
}

function renderMeals() {
  const meals = getTodayMeals();
  $("#mealCount").textContent = t("meal.count", { count: meals.length });
  if (!meals.length) {
    $("#mealList").innerHTML = `<span class="placeholder">${t("placeholder.noMeals")}</span>`;
    return;
  }
  $("#mealList").innerHTML = meals
    .map(
      (meal) => `
        <article class="meal-entry">
          <div class="meal-title-row">
            <div>
              <h3>${escapeHtml(localizePhrase(meal.mealType))} · ${escapeHtml(localizePhrase(meal.name))}</h3>
              <span class="label">${escapeHtml(localizePhrase(meal.description))} · ${t("analysis.confidence", { value: Math.round(meal.confidence * 100) })}</span>
            </div>
            <button class="delete-button" type="button" data-delete-meal="${meal.id}" title="${currentLanguage() === "zh" ? "删除餐食" : "Delete meal"}">×</button>
          </div>
          <div class="meal-edit-grid">
            ${renderMealNumberInput(meal, "calories", "kcal")}
            ${renderMealNumberInput(meal, "proteinG", `${t("macro.protein")} g`)}
            ${renderMealNumberInput(meal, "carbsG", `${t("macro.carbs")} g`)}
            ${renderMealNumberInput(meal, "fatG", `${t("macro.fat")} g`)}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderMealNumberInput(meal, field, label) {
  return `
    <label>
      ${label}
      <input type="number" min="0" step="1" value="${meal[field]}" data-meal-id="${meal.id}" data-field="${field}" />
    </label>
  `;
}

function renderTraining() {
  const trainingDays = state.workoutPlan.filter((day) => !day.isRestDay);
  const completed = trainingDays.filter((day) => state.completedWorkoutDates[day.id]).length;
  $("#trainingProgress").textContent = t("training.progress", { done: completed, total: trainingDays.length });
  $("#trainingGrid").innerHTML = state.workoutPlan
    .map((day) => {
      const completedDay = Boolean(state.completedWorkoutDates[day.id]);
      return `
        <article class="training-day ${completedDay ? "completed" : ""}">
          <header>
            <span class="label">${escapeHtml(formatPlanDayLabel(day.label))} · ${day.dateLabel}</span>
            <h3>${escapeHtml(localizePhrase(day.focus))}</h3>
            <span class="pill ${day.isRestDay ? "medium" : "low"}">${escapeHtml(localizePhrase(day.intensity))}</span>
          </header>
          <ul class="exercise-list">
            ${day.exercises
              .map(
                (exercise) => `
                  <li>
                    <strong>${escapeHtml(localizePhrase(exercise.name))}</strong>
                    <span>${escapeHtml(exercise.prescription)} · ${escapeHtml(localizePhrase(exercise.note))}</span>
                  </li>
                `,
              )
              .join("")}
          </ul>
          <button class="day-button" type="button" data-toggle-day="${day.id}">
            ${completedDay ? t("button.completed") : day.isRestDay ? t("button.recoveryDone") : t("button.markDone")}
          </button>
        </article>
      `;
    })
    .join("");
}

function renderAnalysis() {
  if (liveMotionStream && liveMotionAnalysis) {
    $("#analysisOutput").innerHTML = renderAnalysisEntry(liveMotionAnalysis, { live: true });
    return;
  }
  const latest = state.formAnalyses[0];
  if (!latest) {
    $("#analysisOutput").innerHTML = `<span class="placeholder">${t("placeholder.noAnalysis")}</span>`;
    return;
  }
  $("#analysisOutput").innerHTML = renderAnalysisEntry(latest);
}

function renderAnalysisEntry(latest, options = {}) {
  const finePrint = options.live ? t("fine.formLive") : latest.engine === "pose" ? t("fine.formPose") : t("fine.form");
  const mediaLabel = options.live ? t("analysis.livePreview") : localizePhrase(latest.mediaKind);
  return `
    <article class="analysis-entry">
      <div class="entry-title-row">
        <div>
          <h3>${escapeHtml(localizePhrase(latest.exerciseLabel))} · ${latest.score}/100</h3>
          <span class="label">${escapeHtml(mediaLabel)} · ${escapeHtml(latest.mediaName)} · ${t("analysis.confidence", { value: latest.confidence })}</span>
          <span class="label">${t("analysis.model")} · ${latest.engine === "pose" ? t("analysis.poseEngine") : t("analysis.ruleEngine")}${latest.pose ? ` · ${t("analysis.keypointConfidence", { value: Math.round(latest.pose.averageScore * 100) })}` : ""}</span>
        </div>
        <span class="pill ${latest.riskLevel}">${riskLabel(latest.riskLevel)}</span>
      </div>
      <div class="risk-row">
        ${latest.compensations.map((item) => `<span class="pill">${escapeHtml(localizePhrase(item))}</span>`).join("")}
      </div>
      <ul class="finding-list">
        ${latest.findings.map((item) => `<li>${escapeHtml(localizePhrase(item))}</li>`).join("")}
        ${latest.issues.map((item) => `<li>${escapeHtml(localizePhrase(item))}</li>`).join("")}
        ${latest.corrections.map((item) => `<li>${escapeHtml(localizePhrase(item))}</li>`).join("")}
      </ul>
      <p class="fine-print">${finePrint}</p>
    </article>
  `;
}

function renderHealth() {
  const readiness = calculateReadiness(state.health.metrics);
  $("#healthAuthStatus").textContent = state.health.authorized ? t("auth.authorized") : t("auth.unauthorized");
  $("#healthOutput").innerHTML = `
    <div class="summary-grid">
      <div class="summary-stat">
        <span class="label">${t("title.readiness")}</span>
        <strong>${readiness.score}</strong>
      </div>
      <div class="summary-stat">
        <span class="label">${currentLanguage() === "zh" ? "压力负荷" : "Stress load"}</span>
        <strong>${escapeHtml(localizePhrase(readiness.label))}</strong>
      </div>
    </div>
    <article class="health-entry">
      <div class="risk-row">
        ${(readiness.factors.length ? readiness.factors : ["指标稳定"]).map((item) => `<span class="pill ${readiness.level}">${escapeHtml(localizePhrase(item))}</span>`).join("")}
      </div>
      <p class="summary-note">${renderHealthInterpretation(readiness)}</p>
    </article>
  `;
}

function renderHealthInterpretation(readiness) {
  if (readiness.score >= 78) {
    return t("health.interpret.good");
  }
  if (readiness.score >= 62) {
    return t("health.interpret.medium");
  }
  if (readiness.score >= 45) {
    return t("health.interpret.low");
  }
  return t("health.interpret.rest");
}

function getTodayMeals() {
  return state.meals.filter((meal) => meal.date === todayKey);
}

function getTodayNutritionTotals() {
  return getTodayMeals().reduce(
    (totals, meal) => ({
      calories: totals.calories + toNumber(meal.calories, 0),
      proteinG: totals.proteinG + toNumber(meal.proteinG, 0),
      carbsG: totals.carbsG + toNumber(meal.carbsG, 0),
      fatG: totals.fatG + toNumber(meal.fatG, 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

function drawPoseCanvas(analysis, readiness) {
  const canvas = $("#poseCanvas");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(320, Math.floor(rect.width || 520));
  const height = Math.max(220, Math.floor(rect.height || 280));
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#101923";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  for (let x = 24; x < width; x += 42) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 24; y < height; y += 42) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const score = analysis ? analysis.score : readiness.score;
  const color = score >= 82 ? "#6EE7B7" : score >= 68 ? "#F4C95D" : "#FF8A70";
  if (analysis && analysis.pose && Array.isArray(analysis.pose.keypoints)) {
    drawDetectedPose(ctx, analysis.pose, width, height, color);
    ctx.fillStyle = "#F7F9FA";
    ctx.font = "700 18px system-ui, sans-serif";
    ctx.fillText(localizePhrase(analysis.exerciseLabel), 18, 34);
    ctx.font = "800 34px system-ui, sans-serif";
    ctx.fillText(String(score), 18, 74);
    ctx.font = "600 13px system-ui, sans-serif";
    ctx.fillStyle = "rgba(247,249,250,0.72)";
    ctx.fillText(`${t("analysis.poseEngine")} · ${riskLabel(analysis.riskLevel)}`, 18, 96);
    return;
  }
  const cx = width * 0.48;
  const cy = height * 0.52;
  const scale = Math.min(width, height) / 290;
  const points = {
    head: [cx, cy - 86 * scale],
    neck: [cx, cy - 52 * scale],
    lShoulder: [cx - 38 * scale, cy - 42 * scale],
    rShoulder: [cx + 40 * scale, cy - 40 * scale],
    lElbow: [cx - 72 * scale, cy - 10 * scale],
    rElbow: [cx + 76 * scale, cy - 8 * scale],
    lHand: [cx - 82 * scale, cy + 30 * scale],
    rHand: [cx + 88 * scale, cy + 26 * scale],
    hip: [cx, cy + 24 * scale],
    lKnee: [cx - 42 * scale, cy + 74 * scale],
    rKnee: [cx + 52 * scale, cy + 75 * scale],
    lFoot: [cx - 70 * scale, cy + 118 * scale],
    rFoot: [cx + 82 * scale, cy + 116 * scale],
  };
  const links = [
    ["head", "neck"],
    ["neck", "lShoulder"],
    ["neck", "rShoulder"],
    ["lShoulder", "lElbow"],
    ["lElbow", "lHand"],
    ["rShoulder", "rElbow"],
    ["rElbow", "rHand"],
    ["neck", "hip"],
    ["hip", "lKnee"],
    ["hip", "rKnee"],
    ["lKnee", "lFoot"],
    ["rKnee", "rFoot"],
  ];

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = 6 * scale;
  links.forEach(([from, to]) => {
    ctx.beginPath();
    ctx.moveTo(points[from][0], points[from][1]);
    ctx.lineTo(points[to][0], points[to][1]);
    ctx.stroke();
  });

  Object.values(points).forEach(([x, y]) => {
    ctx.beginPath();
    ctx.fillStyle = "#F7F9FA";
    ctx.arc(x, y, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
  });

  if (analysis && analysis.riskLevel !== "low") {
    ctx.strokeStyle = "#FF8A70";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(points.rKnee[0], points.rKnee[1], 24 * scale, 0.2, 1.7 * Math.PI);
    ctx.stroke();
  }

  ctx.fillStyle = "#F7F9FA";
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillText(analysis ? localizePhrase(analysis.exerciseLabel) : currentLanguage() === "zh" ? "动作基线" : "Form baseline", 18, 34);
  ctx.font = "800 34px system-ui, sans-serif";
  ctx.fillText(String(score), 18, 74);
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.fillStyle = "rgba(247,249,250,0.72)";
  ctx.fillText(analysis ? riskLabel(analysis.riskLevel) : localizePhrase(readiness.label), 18, 96);
}

function drawDetectedPose(ctx, pose, width, height, color) {
  const padding = 28;
  const sourceWidth = pose.sourceWidth || width;
  const sourceHeight = pose.sourceHeight || height;
  const scale = Math.min((width - padding * 2) / sourceWidth, (height - padding * 2) / sourceHeight);
  const offsetX = (width - sourceWidth * scale) / 2;
  const offsetY = (height - sourceHeight * scale) / 2;
  const keypointMap = new Map(
    pose.keypoints
      .filter((keypoint) => keypoint.score >= 0.2)
      .map((keypoint) => [
        keypoint.name,
        {
          x: offsetX + keypoint.x * scale,
          y: offsetY + keypoint.y * scale,
          score: keypoint.score,
        },
      ]),
  );
  const links = [
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"],
    ["right_elbow", "right_wrist"],
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"],
    ["right_knee", "right_ankle"],
  ];

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  links.forEach(([from, to]) => {
    const a = keypointMap.get(from);
    const b = keypointMap.get(to);
    if (!a || !b) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });

  keypointMap.forEach((point) => {
    ctx.beginPath();
    ctx.fillStyle = point.score >= 0.45 ? "#F7F9FA" : "rgba(247,249,250,0.52)";
    ctx.arc(point.x, point.y, point.score >= 0.45 ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function createMediaAsset({ recordType, recordId, name, mimeType, size, previewDataUrl }) {
  return {
    id: createId(),
    userId: CURRENT_USER_ID,
    recordType,
    recordId,
    date: todayKey,
    name: name || "uploaded-media",
    mimeType: mimeType || "application/octet-stream",
    size: toNumber(size, 0),
    previewDataUrl: previewDataUrl || "",
    createdAt: new Date().toISOString(),
  };
}

function recordHealthSnapshot(source) {
  const readiness = calculateReadiness(state.health.metrics);
  const now = new Date().toISOString();
  const snapshot = {
    id: `${todayKey}-${source}`,
    userId: CURRENT_USER_ID,
    date: todayKey,
    source,
    metrics: clone(state.health.metrics),
    readinessScore: readiness.score,
    stressLoadLabel: readiness.label,
    factors: readiness.factors,
    updatedAt: now,
    createdAt: now,
  };
  state.health.history = [
    snapshot,
    ...state.health.history.filter((item) => !(item.date === todayKey && item.source === source)),
  ].slice(0, 180);
  state.health.updatedAt = now;
}

function getHealthSnapshotForDate(dateKey) {
  return state.health.history
    .filter((snapshot) => snapshot.date === dateKey)
    .sort(sortByUpdatedAtDesc)[0];
}

function getMetricTarget(metricKey) {
  const target = state.nutritionTarget || {};
  if (metricKey === "calories") return target.calories;
  if (metricKey === "protein") return target.proteinG;
  if (metricKey === "readiness") return 78;
  if (metricKey === "workouts") return 1;
  return null;
}

function formatMetricValue(value, metricKey) {
  if (value === null || value === undefined) return "--";
  const metric = insightMetrics[metricKey];
  const rounded = metricKey === "calories" ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded}${metricUnit(metricKey)}`;
}

function mediaRecordLabel(recordType) {
  return recordType === "meal" ? t("media.meal") : recordType === "formAnalysis" ? t("media.formAnalysis") : t("media.file");
}

function formatBytes(bytes) {
  const size = toNumber(bytes, 0);
  if (!size) return "metadata";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`;
  return `${Math.round(size / 1024 / 102.4) / 10} MB`;
}

function scaleY(value, maxValue, minY, maxY) {
  return maxY - (clamp(value, 0, maxValue) / maxValue) * (maxY - minY);
}

function roundRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function sortByCreatedAtDesc(a, b) {
  return String(b.createdAt || b.updatedAt || "").localeCompare(String(a.createdAt || a.updatedAt || ""));
}

function sortByUpdatedAtDesc(a, b) {
  return String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function formatFullDate(date) {
  if (currentLanguage() === "en") {
    return `${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · ${weekdayLabelsEn[date.getDay()]}`;
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 · ${weekdayLabels[date.getDay()]}`;
}

function formatShortDate(date) {
  return currentLanguage() === "en" ? `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : `${date.getMonth() + 1}月${date.getDate()}日`;
}

function getWeekdayLabel(date) {
  return currentLanguage() === "en" ? weekdayLabelsEn[date.getDay()] : weekdayLabels[date.getDay()];
}

function formatPlanDayLabel(label) {
  if (label === "today") return t("nav.today");
  if (label && label.startsWith("weekday-")) {
    const day = Number(label.replace("weekday-", ""));
    return currentLanguage() === "en" ? weekdayLabelsEn[day] : weekdayLabels[day];
  }
  return localizePhrase(label);
}

function metricUnit(metricKey) {
  const metric = insightMetrics[metricKey];
  if (!metric) return "";
  return metric.unit.startsWith("unit.") ? t(metric.unit) : metric.unit;
}

function numberFromInput(selector, fallback) {
  return toNumber($(selector).value, fallback);
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatSigned(value) {
  const rounded = Math.round(value * 10) / 10;
  return rounded > 0 ? `+${rounded}` : String(rounded);
}

function angleLabel(angle) {
  return localizePhrase(rawAngleLabel(angle));
}

function rawAngleLabel(angle) {
  return {
    side: "侧面",
    front: "正面",
    diagonal: "45 度",
  }[angle];
}

function riskLabel(level) {
  return {
    low: t("risk.low"),
    medium: t("risk.medium"),
    high: t("risk.high"),
  }[level];
}

function riskLabelInLanguage(level, language) {
  const labels = {
    zh: { low: "低风险", medium: "中等风险", high: "高风险" },
    en: { low: "Low risk", medium: "Medium risk", high: "High risk" },
  };
  return (labels[language] && labels[language][level]) || riskLabel(level);
}

function englishPhrase(value) {
  return phraseTranslations.en[value] || value;
}

function hashString(input) {
  return Array.from(input).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function splitCsvRow(row) {
  const result = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < row.length; index += 1) {
    const char = row[index];
    if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
