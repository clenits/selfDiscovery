export const SUPPORTED_LOCALES = ["en", "ko", "es", "zh", "ja"];

export const LOCALE_OPTIONS = [
  { id: "en", label: "English" },
  { id: "ko", label: "한국어" },
  { id: "es", label: "Español" },
  { id: "zh", label: "中文" },
  { id: "ja", label: "日本語" },
];

const TRANSLATIONS = {
  en: {
    app: {
      brand: "Self Discovery Lab",
      skipToContent: "Skip to content",
      navSection: "Section",
      nav: {
        home: "Home",
        tests: "Tests",
        profile: "My Profile",
      },
      language: "Language",
      themeToggleAria: "Toggle theme",
      themeLight: "Theme: Light",
      themeDark: "Theme: Dark",
      footer: "Local-only storage. No account. No PII collection.",
      fallback: {
        title: "Self Discovery Lab",
        description:
          "This section needs JavaScript enabled for interactive quizzes. Your data stays on your device in local storage.",
        cacheHint:
          "If scripts fail to load, refresh once while online to cache files for offline use.",
        openTests: "Open available tests",
      },
      noscript: {
        title: "JavaScript Required",
        description:
          "Interactive tests require JavaScript. Enable it to run quizzes and save your local profile.",
      },
    },
    meta: {
      homeTitle: "Self Discovery Lab",
      homeDescription: "A place to learn about yourself with offline data-driven tests.",
      testsTitle: "Tests | Self Discovery Lab",
      testsDescription: "Browse personality and house sorting quizzes.",
      profileTitle: "My Profile | Self Discovery Lab",
      profileDescription: "View your locally saved quiz outcomes and history.",
      shareTitle: "Shared Result | Self Discovery Lab",
      shareDescription: "View a shared Self Discovery result card.",
      notFoundTitle: "Not Found | Self Discovery Lab",
      notFoundDescription: "The requested route was not found.",
      quizFallbackTitle: "Quiz",
      quizFallbackDescription: "Take this self discovery test.",
    },
    common: {
      pageNotFoundTitle: "Page Not Found",
      pageNotFoundDesc: "That route does not exist.",
      registryErrorTitle: "Quiz Registry Error",
      registryErrorDesc:
        "Quiz data could not be loaded. Check JSON schema and file paths.",
      unknownError: "Unknown error",
      backToTests: "Back to Tests",
      questionOf: "Question {{current}} of {{total}}",
      answerRequired: "Answer required",
      localOnlyAnswers: "Local-only answers",
      confidence: "Confidence",
      code: "Code",
      latestResult: "Latest: {{title}} ({{confidence}}% confidence)",
      savedResult: "Saved result: {{title}} ({{confidence}}% confidence)",
      noSavedResult: "No saved result yet",
      noLocalSavedResult: "No local result saved yet.",
      copyFailed: "Copy failed in this browser.",
      linkCopied: "Link copied.",
    },
    home: {
      title: "A Place To Learn About Yourself",
      description:
        "Choose a test, answer at your own pace, and save results locally on this device.",
      browseTests: "Browse Tests",
      openProfile: "Open My Profile",
      progressiveNote:
        "Progressive enhancement: if JavaScript is unavailable, fallback content remains visible.",
      start: "Start",
    },
    tests: {
      title: "Available Tests",
      description:
        "Each quiz is driven by JSON data. Add new tests by dropping a data file and registering metadata.",
      takeTest: "Take Test",
      viewProfile: "View Profile",
    },
    profile: {
      title: "My Profile",
      emptyDescription:
        "No saved results yet. Complete a test and your latest results will appear here.",
      browseTests: "Browse Tests",
      confidenceAt: "Confidence {{confidence}}% · {{date}}",
      retake: "Retake",
      savedHistory: "Saved History",
      localOnly: "Stored in this browser only.",
      historyItem: "{{date}} · Confidence {{confidence}}%",
      localPrivacyTitle: "Local Privacy",
      localPrivacyDescription:
        "Data never leaves your browser unless you manually share a link.",
      takeAnotherTest: "Take Another Test",
      clearLocalData: "Clear Local Data",
    },
    quiz: {
      shareableCardTitle: "Shareable Card",
      shareableCardDescription:
        "Generate a local image via canvas and copy a hash-link that reproduces this result view.",
      downloadPng: "Download PNG",
      copyShareLink: "Copy Share Link",
      openShareView: "Open Share View",
      shareCopied: "Share link copied.",
      whatNextTitle: "What Next",
      whatNextDescription: "Save remains local to this browser only.",
      retakeQuiz: "Retake Quiz",
      back: "Back",
      next: "Next",
      finish: "Finish",
      quit: "Quit",
      chooseAnswerError: "Choose at least one answer to continue.",
      questionRequired: "Question required",
      quizUnavailable: "Quiz Unavailable",
      couldNotLoad: "Could not load '{{quizId}}'.",
      validationErrors: "Validation or loading errors",
      unexpectedLoadError: "Unexpected error while loading quiz.",
    },
    share: {
      title: "Shared Result",
      invalidDescription: "This link is missing or has invalid data.",
      decodeErrorTitle: "Unable to decode shared payload",
      decodeErrorHint: "Use a valid link generated from a quiz result page.",
      sharedQuizFallback: "Shared Quiz",
      fromQuiz: "From {{quizTitle}} · Confidence {{confidence}}%",
      capturedAt: "Captured {{date}}",
      actionsTitle: "Share Actions",
      actionsDescription: "Regenerate the card image or open the original quiz.",
      copyLink: "Copy Link",
      takeThisTest: "Take This Test",
    },
  },
  ko: {
    app: {
      brand: "자기발견 랩",
      skipToContent: "본문으로 건너뛰기",
      navSection: "섹션",
      nav: {
        home: "홈",
        tests: "테스트",
        profile: "내 프로필",
      },
      language: "언어",
      themeToggleAria: "테마 전환",
      themeLight: "테마: 라이트",
      themeDark: "테마: 다크",
      footer: "로컬 저장만 사용합니다. 계정 없음, 개인정보 수집 없음.",
      fallback: {
        title: "자기발견 랩",
        description:
          "인터랙티브 퀴즈를 위해 JavaScript가 필요합니다. 데이터는 이 기기 로컬 저장소에만 보관됩니다.",
        cacheHint:
          "스크립트가 로드되지 않으면 온라인 상태에서 한 번 새로고침해 오프라인 캐시를 준비하세요.",
        openTests: "테스트 보기",
      },
      noscript: {
        title: "JavaScript 필요",
        description:
          "인터랙티브 테스트는 JavaScript가 필요합니다. 활성화하면 퀴즈 실행과 로컬 프로필 저장이 가능합니다.",
      },
    },
    meta: {
      homeTitle: "자기발견 랩",
      homeDescription: "오프라인 데이터 기반 테스트로 나를 알아보는 공간입니다.",
      testsTitle: "테스트 | 자기발견 랩",
      testsDescription: "성향 테스트와 기숙사 매칭 테스트를 탐색하세요.",
      profileTitle: "내 프로필 | 자기발견 랩",
      profileDescription: "로컬에 저장된 테스트 결과와 기록을 확인하세요.",
      shareTitle: "공유 결과 | 자기발견 랩",
      shareDescription: "공유된 자기발견 결과 카드를 확인하세요.",
      notFoundTitle: "페이지 없음 | 자기발견 랩",
      notFoundDescription: "요청한 경로를 찾을 수 없습니다.",
      quizFallbackTitle: "퀴즈",
      quizFallbackDescription: "자기발견 테스트를 진행해보세요.",
    },
    common: {
      pageNotFoundTitle: "페이지를 찾을 수 없음",
      pageNotFoundDesc: "해당 경로가 존재하지 않습니다.",
      registryErrorTitle: "퀴즈 레지스트리 오류",
      registryErrorDesc: "퀴즈 데이터를 불러오지 못했습니다. JSON 스키마와 경로를 확인하세요.",
      unknownError: "알 수 없는 오류",
      backToTests: "테스트로 돌아가기",
      questionOf: "문항 {{current}} / {{total}}",
      answerRequired: "응답 필요",
      localOnlyAnswers: "응답은 로컬에만 저장",
      confidence: "신뢰도",
      code: "코드",
      latestResult: "최근 결과: {{title}} (신뢰도 {{confidence}}%)",
      savedResult: "저장된 결과: {{title}} (신뢰도 {{confidence}}%)",
      noSavedResult: "저장된 결과 없음",
      noLocalSavedResult: "로컬에 저장된 결과가 없습니다.",
      copyFailed: "이 브라우저에서는 복사에 실패했습니다.",
      linkCopied: "링크가 복사되었습니다.",
    },
    home: {
      title: "나를 알아가는 공간",
      description: "테스트를 선택하고 천천히 답변한 뒤, 결과를 이 기기에 로컬 저장하세요.",
      browseTests: "테스트 둘러보기",
      openProfile: "내 프로필 열기",
      progressiveNote:
        "점진적 향상: JavaScript를 사용할 수 없어도 기본 안내는 계속 표시됩니다.",
      start: "시작",
    },
    tests: {
      title: "사용 가능한 테스트",
      description:
        "각 퀴즈는 JSON 데이터 기반입니다. 새 테스트는 데이터 파일 추가 + 메타 등록으로 확장됩니다.",
      takeTest: "테스트 시작",
      viewProfile: "프로필 보기",
    },
    profile: {
      title: "내 프로필",
      emptyDescription: "아직 저장된 결과가 없습니다. 테스트를 완료하면 최신 결과가 여기에 표시됩니다.",
      browseTests: "테스트 둘러보기",
      confidenceAt: "신뢰도 {{confidence}}% · {{date}}",
      retake: "다시 하기",
      savedHistory: "저장 기록",
      localOnly: "이 브라우저에만 저장됩니다.",
      historyItem: "{{date}} · 신뢰도 {{confidence}}%",
      localPrivacyTitle: "로컬 프라이버시",
      localPrivacyDescription: "직접 링크를 공유하지 않는 한 데이터는 브라우저 밖으로 나가지 않습니다.",
      takeAnotherTest: "다른 테스트 하기",
      clearLocalData: "로컬 데이터 삭제",
    },
    quiz: {
      shareableCardTitle: "공유 카드",
      shareableCardDescription: "캔버스로 이미지를 만들고 이 결과를 재현하는 해시 링크를 복사할 수 있습니다.",
      downloadPng: "PNG 다운로드",
      copyShareLink: "공유 링크 복사",
      openShareView: "공유 화면 열기",
      shareCopied: "공유 링크가 복사되었습니다.",
      whatNextTitle: "다음 단계",
      whatNextDescription: "저장은 현재 브라우저 로컬에만 남습니다.",
      retakeQuiz: "퀴즈 다시 하기",
      back: "이전",
      next: "다음",
      finish: "완료",
      quit: "종료",
      chooseAnswerError: "계속하려면 최소 1개 이상 선택하세요.",
      questionRequired: "응답 필요",
      quizUnavailable: "퀴즈를 열 수 없음",
      couldNotLoad: "'{{quizId}}'를 불러오지 못했습니다.",
      validationErrors: "검증 또는 로딩 오류",
      unexpectedLoadError: "퀴즈 로딩 중 예기치 않은 오류가 발생했습니다.",
    },
    share: {
      title: "공유 결과",
      invalidDescription: "이 링크는 누락되었거나 데이터가 올바르지 않습니다.",
      decodeErrorTitle: "공유 데이터 해석 실패",
      decodeErrorHint: "결과 페이지에서 생성된 유효한 링크를 사용하세요.",
      sharedQuizFallback: "공유 퀴즈",
      fromQuiz: "{{quizTitle}} 결과 · 신뢰도 {{confidence}}%",
      capturedAt: "생성 시각 {{date}}",
      actionsTitle: "공유 동작",
      actionsDescription: "카드 이미지를 다시 만들거나 원본 퀴즈를 열 수 있습니다.",
      copyLink: "링크 복사",
      takeThisTest: "이 테스트 하기",
    },
  },
  es: {
    app: {
      brand: "Laboratorio de Autodescubrimiento",
      skipToContent: "Saltar al contenido",
      navSection: "Sección",
      nav: {
        home: "Inicio",
        tests: "Pruebas",
        profile: "Mi Perfil",
      },
      language: "Idioma",
      themeToggleAria: "Cambiar tema",
      themeLight: "Tema: Claro",
      themeDark: "Tema: Oscuro",
      footer: "Solo almacenamiento local. Sin cuenta. Sin recopilación de PII.",
      fallback: {
        title: "Laboratorio de Autodescubrimiento",
        description:
          "Esta sección necesita JavaScript para cuestionarios interactivos. Tus datos permanecen en este dispositivo.",
        cacheHint:
          "Si los scripts fallan, recarga una vez en línea para guardar archivos en caché offline.",
        openTests: "Ver pruebas disponibles",
      },
      noscript: {
        title: "JavaScript requerido",
        description:
          "Las pruebas interactivas requieren JavaScript. Actívalo para ejecutar cuestionarios y guardar tu perfil local.",
      },
    },
    meta: {
      homeTitle: "Laboratorio de Autodescubrimiento",
      homeDescription: "Un lugar para conocerte mejor con pruebas offline y guiadas por datos.",
      testsTitle: "Pruebas | Laboratorio de Autodescubrimiento",
      testsDescription: "Explora pruebas de personalidad y de casa de Hogwarts.",
      profileTitle: "Mi Perfil | Laboratorio de Autodescubrimiento",
      profileDescription: "Revisa tus resultados locales y el historial.",
      shareTitle: "Resultado Compartido | Laboratorio de Autodescubrimiento",
      shareDescription: "Visualiza una tarjeta compartida de resultado.",
      notFoundTitle: "No encontrado | Laboratorio de Autodescubrimiento",
      notFoundDescription: "La ruta solicitada no fue encontrada.",
      quizFallbackTitle: "Cuestionario",
      quizFallbackDescription: "Haz esta prueba de autodescubrimiento.",
    },
    common: {
      pageNotFoundTitle: "Página no encontrada",
      pageNotFoundDesc: "Esa ruta no existe.",
      registryErrorTitle: "Error del registro de pruebas",
      registryErrorDesc: "No se pudieron cargar los datos de pruebas. Revisa el esquema JSON y rutas.",
      unknownError: "Error desconocido",
      backToTests: "Volver a pruebas",
      questionOf: "Pregunta {{current}} de {{total}}",
      answerRequired: "Respuesta requerida",
      localOnlyAnswers: "Respuestas solo locales",
      confidence: "Confianza",
      code: "Código",
      latestResult: "Último: {{title}} ({{confidence}}% de confianza)",
      savedResult: "Guardado: {{title}} ({{confidence}}% de confianza)",
      noSavedResult: "Aún no hay resultado guardado",
      noLocalSavedResult: "Todavía no hay resultado local guardado.",
      copyFailed: "Falló la copia en este navegador.",
      linkCopied: "Enlace copiado.",
    },
    home: {
      title: "Un Lugar Para Conocerte",
      description:
        "Elige una prueba, responde a tu ritmo y guarda resultados localmente en este dispositivo.",
      browseTests: "Explorar pruebas",
      openProfile: "Abrir Mi Perfil",
      progressiveNote:
        "Mejora progresiva: si JavaScript falla, el contenido de respaldo sigue visible.",
      start: "Comenzar",
    },
    tests: {
      title: "Pruebas Disponibles",
      description:
        "Cada cuestionario se define con datos JSON. Agrega nuevas pruebas con un archivo JSON y metadatos.",
      takeTest: "Hacer prueba",
      viewProfile: "Ver perfil",
    },
    profile: {
      title: "Mi Perfil",
      emptyDescription:
        "Aún no hay resultados guardados. Completa una prueba y aquí aparecerá tu último resultado.",
      browseTests: "Explorar pruebas",
      confidenceAt: "Confianza {{confidence}}% · {{date}}",
      retake: "Repetir",
      savedHistory: "Historial Guardado",
      localOnly: "Guardado solo en este navegador.",
      historyItem: "{{date}} · Confianza {{confidence}}%",
      localPrivacyTitle: "Privacidad Local",
      localPrivacyDescription:
        "Los datos no salen de tu navegador a menos que compartas un enlace manualmente.",
      takeAnotherTest: "Hacer otra prueba",
      clearLocalData: "Borrar datos locales",
    },
    quiz: {
      shareableCardTitle: "Tarjeta Compartible",
      shareableCardDescription:
        "Genera una imagen local con canvas y copia un hash-link para reproducir este resultado.",
      downloadPng: "Descargar PNG",
      copyShareLink: "Copiar enlace",
      openShareView: "Abrir vista compartida",
      shareCopied: "Enlace compartido copiado.",
      whatNextTitle: "Qué sigue",
      whatNextDescription: "El guardado permanece solo en este navegador.",
      retakeQuiz: "Repetir cuestionario",
      back: "Atrás",
      next: "Siguiente",
      finish: "Finalizar",
      quit: "Salir",
      chooseAnswerError: "Selecciona al menos una respuesta para continuar.",
      questionRequired: "Pregunta obligatoria",
      quizUnavailable: "Cuestionario no disponible",
      couldNotLoad: "No se pudo cargar '{{quizId}}'.",
      validationErrors: "Errores de validación o carga",
      unexpectedLoadError: "Error inesperado al cargar el cuestionario.",
    },
    share: {
      title: "Resultado Compartido",
      invalidDescription: "Este enlace falta o contiene datos inválidos.",
      decodeErrorTitle: "No se pudo decodificar el contenido compartido",
      decodeErrorHint: "Usa un enlace válido generado desde la página de resultados.",
      sharedQuizFallback: "Prueba compartida",
      fromQuiz: "De {{quizTitle}} · Confianza {{confidence}}%",
      capturedAt: "Capturado {{date}}",
      actionsTitle: "Acciones de compartir",
      actionsDescription: "Regenera la imagen o abre la prueba original.",
      copyLink: "Copiar enlace",
      takeThisTest: "Hacer esta prueba",
    },
  },
  zh: {
    app: {
      brand: "自我探索实验室",
      skipToContent: "跳到内容",
      navSection: "导航",
      nav: {
        home: "首页",
        tests: "测试",
        profile: "我的档案",
      },
      language: "语言",
      themeToggleAria: "切换主题",
      themeLight: "主题：浅色",
      themeDark: "主题：深色",
      footer: "仅本地存储。无需账号。不收集个人隐私信息。",
      fallback: {
        title: "自我探索实验室",
        description: "此区域需要启用 JavaScript 才能进行互动测验。数据仅保存在你的设备本地。",
        cacheHint: "如果脚本加载失败，请在联网状态下刷新一次以缓存离线资源。",
        openTests: "查看可用测试",
      },
      noscript: {
        title: "需要 JavaScript",
        description: "互动测试需要 JavaScript。启用后可进行测验并保存本地档案。",
      },
    },
    meta: {
      homeTitle: "自我探索实验室",
      homeDescription: "通过离线、数据驱动的测试来更了解自己。",
      testsTitle: "测试 | 自我探索实验室",
      testsDescription: "浏览人格与霍格沃茨学院测试。",
      profileTitle: "我的档案 | 自我探索实验室",
      profileDescription: "查看本地保存的测试结果与历史记录。",
      shareTitle: "分享结果 | 自我探索实验室",
      shareDescription: "查看分享的自我探索结果卡片。",
      notFoundTitle: "未找到 | 自我探索实验室",
      notFoundDescription: "未找到请求的路由。",
      quizFallbackTitle: "测验",
      quizFallbackDescription: "参加此自我探索测试。",
    },
    common: {
      pageNotFoundTitle: "页面不存在",
      pageNotFoundDesc: "该路由不存在。",
      registryErrorTitle: "测试注册表错误",
      registryErrorDesc: "无法加载测试数据。请检查 JSON 结构和文件路径。",
      unknownError: "未知错误",
      backToTests: "返回测试列表",
      questionOf: "第 {{current}} / {{total}} 题",
      answerRequired: "需要作答",
      localOnlyAnswers: "答案仅保存在本地",
      confidence: "置信度",
      code: "代码",
      latestResult: "最近结果：{{title}}（置信度 {{confidence}}%）",
      savedResult: "已保存结果：{{title}}（置信度 {{confidence}}%）",
      noSavedResult: "暂无保存结果",
      noLocalSavedResult: "暂无本地保存结果。",
      copyFailed: "当前浏览器复制失败。",
      linkCopied: "链接已复制。",
    },
    home: {
      title: "一个了解自己的地方",
      description: "选择测试，按自己的节奏作答，并将结果仅保存在本设备。",
      browseTests: "浏览测试",
      openProfile: "打开我的档案",
      progressiveNote: "渐进增强：即使 JavaScript 不可用，仍会显示基础回退内容。",
      start: "开始",
    },
    tests: {
      title: "可用测试",
      description: "每个测验都由 JSON 数据驱动。新增测试只需添加 JSON 并注册元数据。",
      takeTest: "开始测试",
      viewProfile: "查看档案",
    },
    profile: {
      title: "我的档案",
      emptyDescription: "还没有保存结果。完成测试后，最新结果会显示在这里。",
      browseTests: "浏览测试",
      confidenceAt: "置信度 {{confidence}}% · {{date}}",
      retake: "重新测试",
      savedHistory: "保存历史",
      localOnly: "仅保存在此浏览器中。",
      historyItem: "{{date}} · 置信度 {{confidence}}%",
      localPrivacyTitle: "本地隐私",
      localPrivacyDescription: "除非你手动分享链接，否则数据不会离开浏览器。",
      takeAnotherTest: "进行其他测试",
      clearLocalData: "清除本地数据",
    },
    quiz: {
      shareableCardTitle: "可分享卡片",
      shareableCardDescription: "使用 canvas 生成本地图片，并复制可复现结果的哈希链接。",
      downloadPng: "下载 PNG",
      copyShareLink: "复制分享链接",
      openShareView: "打开分享视图",
      shareCopied: "分享链接已复制。",
      whatNextTitle: "下一步",
      whatNextDescription: "结果只保存在当前浏览器本地。",
      retakeQuiz: "重新测验",
      back: "上一步",
      next: "下一步",
      finish: "完成",
      quit: "退出",
      chooseAnswerError: "请至少选择一个答案后继续。",
      questionRequired: "必须作答",
      quizUnavailable: "测验不可用",
      couldNotLoad: "无法加载 '{{quizId}}'。",
      validationErrors: "校验或加载错误",
      unexpectedLoadError: "加载测验时发生意外错误。",
    },
    share: {
      title: "分享结果",
      invalidDescription: "此链接缺失或数据无效。",
      decodeErrorTitle: "无法解析分享数据",
      decodeErrorHint: "请使用从结果页生成的有效链接。",
      sharedQuizFallback: "分享测验",
      fromQuiz: "来自 {{quizTitle}} · 置信度 {{confidence}}%",
      capturedAt: "生成于 {{date}}",
      actionsTitle: "分享操作",
      actionsDescription: "重新生成卡片图片或打开原始测验。",
      copyLink: "复制链接",
      takeThisTest: "参加此测试",
    },
  },
  ja: {
    app: {
      brand: "セルフディスカバリー ラボ",
      skipToContent: "本文へ移動",
      navSection: "セクション",
      nav: {
        home: "ホーム",
        tests: "テスト",
        profile: "マイプロフィール",
      },
      language: "言語",
      themeToggleAria: "テーマ切替",
      themeLight: "テーマ: ライト",
      themeDark: "テーマ: ダーク",
      footer: "ローカル保存のみ。アカウント不要。PII収集なし。",
      fallback: {
        title: "セルフディスカバリー ラボ",
        description:
          "このセクションの対話型クイズには JavaScript が必要です。データは端末内のローカルストレージにのみ保存されます。",
        cacheHint:
          "スクリプト読み込みに失敗した場合は、オンラインで一度再読み込みしてオフライン用キャッシュを作成してください。",
        openTests: "利用可能なテストを見る",
      },
      noscript: {
        title: "JavaScript が必要です",
        description:
          "対話型テストには JavaScript が必要です。有効にするとクイズ実行とローカル保存ができます。",
      },
    },
    meta: {
      homeTitle: "セルフディスカバリー ラボ",
      homeDescription: "オフライン対応のデータ駆動テストで自分を知る場所。",
      testsTitle: "テスト | セルフディスカバリー ラボ",
      testsDescription: "性格テストとホグワーツ寮マッチを確認できます。",
      profileTitle: "マイプロフィール | セルフディスカバリー ラボ",
      profileDescription: "ローカル保存された結果と履歴を表示します。",
      shareTitle: "共有結果 | セルフディスカバリー ラボ",
      shareDescription: "共有された結果カードを表示します。",
      notFoundTitle: "未検出 | セルフディスカバリー ラボ",
      notFoundDescription: "指定されたルートが見つかりません。",
      quizFallbackTitle: "クイズ",
      quizFallbackDescription: "このセルフディスカバリーテストを受けましょう。",
    },
    common: {
      pageNotFoundTitle: "ページが見つかりません",
      pageNotFoundDesc: "そのルートは存在しません。",
      registryErrorTitle: "クイズレジストリエラー",
      registryErrorDesc: "クイズデータを読み込めませんでした。JSON スキーマとパスを確認してください。",
      unknownError: "不明なエラー",
      backToTests: "テストに戻る",
      questionOf: "質問 {{current}} / {{total}}",
      answerRequired: "回答必須",
      localOnlyAnswers: "回答はローカル保存のみ",
      confidence: "信頼度",
      code: "コード",
      latestResult: "最新: {{title}} (信頼度 {{confidence}}%)",
      savedResult: "保存済み: {{title}} (信頼度 {{confidence}}%)",
      noSavedResult: "まだ保存結果がありません",
      noLocalSavedResult: "ローカル保存結果がありません。",
      copyFailed: "このブラウザではコピーに失敗しました。",
      linkCopied: "リンクをコピーしました。",
    },
    home: {
      title: "自分を知るための場所",
      description:
        "テストを選び、自分のペースで回答し、この端末にローカル保存できます。",
      browseTests: "テストを見る",
      openProfile: "マイプロフィールを開く",
      progressiveNote:
        "プログレッシブエンハンスメント: JavaScript が使えない場合もフォールバック表示は維持されます。",
      start: "開始",
    },
    tests: {
      title: "利用可能なテスト",
      description:
        "各クイズは JSON データで駆動します。新しいテストは JSON 追加とメタ登録で拡張できます。",
      takeTest: "テスト開始",
      viewProfile: "プロフィール表示",
    },
    profile: {
      title: "マイプロフィール",
      emptyDescription:
        "まだ保存結果がありません。テストを完了すると最新結果がここに表示されます。",
      browseTests: "テストを見る",
      confidenceAt: "信頼度 {{confidence}}% · {{date}}",
      retake: "再受験",
      savedHistory: "保存履歴",
      localOnly: "このブラウザにのみ保存されます。",
      historyItem: "{{date}} · 信頼度 {{confidence}}%",
      localPrivacyTitle: "ローカルプライバシー",
      localPrivacyDescription:
        "手動でリンク共有しない限り、データはブラウザ外へ送信されません。",
      takeAnotherTest: "別のテストを受ける",
      clearLocalData: "ローカルデータ削除",
    },
    quiz: {
      shareableCardTitle: "共有カード",
      shareableCardDescription:
        "canvas でローカル画像を生成し、この結果を再現するハッシュリンクをコピーできます。",
      downloadPng: "PNG ダウンロード",
      copyShareLink: "共有リンクをコピー",
      openShareView: "共有ビューを開く",
      shareCopied: "共有リンクをコピーしました。",
      whatNextTitle: "次のアクション",
      whatNextDescription: "保存はこのブラウザ内のローカルにのみ残ります。",
      retakeQuiz: "クイズをやり直す",
      back: "戻る",
      next: "次へ",
      finish: "完了",
      quit: "終了",
      chooseAnswerError: "続行するには少なくとも1つ選択してください。",
      questionRequired: "回答が必要です",
      quizUnavailable: "クイズを利用できません",
      couldNotLoad: "'{{quizId}}' を読み込めませんでした。",
      validationErrors: "検証または読み込みエラー",
      unexpectedLoadError: "クイズ読み込み中に予期しないエラーが発生しました。",
    },
    share: {
      title: "共有結果",
      invalidDescription: "このリンクは無効かデータが不足しています。",
      decodeErrorTitle: "共有データをデコードできません",
      decodeErrorHint: "結果ページで生成された有効なリンクを使ってください。",
      sharedQuizFallback: "共有クイズ",
      fromQuiz: "{{quizTitle}} より · 信頼度 {{confidence}}%",
      capturedAt: "取得時刻 {{date}}",
      actionsTitle: "共有アクション",
      actionsDescription: "カード画像を再生成するか元のクイズを開けます。",
      copyLink: "リンクをコピー",
      takeThisTest: "このテストを受ける",
    },
  },
};

function getByPath(source, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), source);
}

function interpolate(template, params = {}) {
  return String(template).replace(/{{\s*([\w]+)\s*}}/g, (_, key) => {
    const value = params[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function normalizeLocale(locale) {
  const value = String(locale || "").toLowerCase();
  if (value.startsWith("ko")) {
    return "ko";
  }
  if (value.startsWith("es")) {
    return "es";
  }
  if (value.startsWith("zh")) {
    return "zh";
  }
  if (value.startsWith("ja")) {
    return "ja";
  }
  return "en";
}

export function detectPreferredLocale(savedLocale) {
  if (savedLocale) {
    return normalizeLocale(savedLocale);
  }
  return normalizeLocale(navigator.language || "en");
}

export function createTranslator(locale) {
  const normalized = normalizeLocale(locale);
  const current = TRANSLATIONS[normalized] || TRANSLATIONS.en;

  return (key, params = {}) => {
    const local = getByPath(current, key);
    const fallback = getByPath(TRANSLATIONS.en, key);
    const raw = local !== undefined ? local : fallback;
    if (raw === undefined) {
      return key;
    }
    return interpolate(raw, params);
  };
}
