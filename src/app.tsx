import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, Globe, Check, Loader2, RefreshCw, Download, MessageCircle, X, Send, SkipForward, Flame, Users, Trophy, BarChart3, FileText, ArrowRight, AlertCircle, Link2, Wand2, Eraser, Zap, Target, Search, Clock, Megaphone, Compass, TrendingUp, Briefcase, PieChart, Lock, FileEdit, Film, ListChecks } from 'lucide-react';

const WORKER_URL = 'https://fabrisio-proxy.fabrisioroche.workers.dev';

const t = {
  es: {
    appName:'Fabrisio sin Humo', subtitle:'Constructor de estrategias y consultoría con IA',
    heroDesc:'Caja de herramientas profesional para diagnosticar, estrategizar y escalar tu negocio. Sin plantillas genéricas. Sin humo.',
    startBtn:'Empezar', next:'Siguiente', back:'Atrás', skip:'Saltar',
    dontKnow:'No sé / Ayudame a pensarlo', askClaude:'Preguntale a Fabrisio',
    send:'Enviar', step:'Paso', of:'de', selectMultiple:'Podés elegir varias',
    chatPlaceholder:'Preguntale lo que necesites...', chatEmpty:'Contame qué te traba y te ayudo.',
    bizTypeTitle:'¿Qué tipo de negocio tenés?',
    bizTypeDesc:'Esto adapta TODAS las herramientas a tu realidad.',
    bizTypeContinue:'Continuar', bizTypeChange:'Cambiar',
    bizTypes:{
      ecommerce:{label:'E-commerce / Retail',desc:'Productos físicos, tienda online'},
      service:{label:'Servicio profesional',desc:'Consultoría, agencia, freelance'},
      b2b:{label:'B2B / Empresa a empresa',desc:'Software, soluciones corporativas'},
      health:{label:'Salud y bienestar',desc:'Clínica, consultorio, terapeuta, gym'},
      education:{label:'Educación / Infoproductos',desc:'Cursos, mentorías, capacitaciones'},
      local:{label:'Local / Servicio presencial',desc:'Restaurante, peluquería, inmobiliaria'}
    },
    toolboxTitle:'Caja de herramientas', toolboxSubtitle:'Tu kit de consultoría completo',
    toolboxDesc:'Elegí qué problema querés resolver hoy.',
    toolboxSearch:'Buscar herramienta...', toolboxRecommended:'Recomendado para tu negocio',
    toolboxAll:'Todas', toolboxEmpty:'No encontré herramientas.', toolboxBack:'Volver a herramientas',
    toolStart:'Empezar', toolSoon:'Pronto',
    toolLevelBasico:'Básico', toolLevelIntermedio:'Intermedio', toolLevelAvanzado:'Avanzado',
    toolTimeMin:'min',
    catDiagnosis:'Diagnóstico y Estrategia', catMarketing:'Marketing y Captación',
    catContent:'Contenido y Producción', catOperations:'Operaciones y Análisis',
    catGrowth:'Crecimiento y Escalamiento',
    catDiagnosisDesc:'Entendé dónde estás parado', catMarketingDesc:'Atraé clientes y vendé más',
    catContentDesc:'Creá contenido que conecta', catOperationsDesc:'Optimizá la salud de tu negocio',
    catGrowthDesc:'Llevalo al siguiente nivel',
    loginTitle:'Acceso a Fabrisio sin Humo',
    loginDesc:'Ingresá tu contraseña de acceso para continuar.',
    loginPlaceholder:'Contraseña de acceso...', loginBtn:'Acceder',
    loginContact:'¿No tenés acceso? Contactá a Fabrisio en WhatsApp.',
    error:'Algo salió mal', retry:'Reintentar', generating:'Fabrisio está pensando...', cancel:'Cancelar',
    entryTitle:'¿Cómo querés arrancar?', entryDesc:'Elegí el modo que más te convenga.',
    entryGuided:'Pregunta por pregunta', entryGuidedDesc:'Modo prolijo. Te guío con preguntas.',
    entryPreload:'Pre-carga con URL/redes', entryPreloadDesc:'Pegá la URL de tu sitio y pre-lleno.',
    reviewTitle:'Resumen ejecutivo', reviewDesc:'Confirmá antes de armar la entrega final.',
    confirmReview:'¿Está todo bien o ajustamos?', yesGenerate:'Sí, generar entrega', noAdjust:'No, ajustar',
    approveContinue:'Aprobar y continuar', finalizeStrategy:'Finalizar',
    refine:'Refinar este bloque', refineLabel:'¿Qué querés refinar?',
    refinePlaceholder:'Ej: Más detalle, agregá X...', applyRefine:'Aplicar refinamiento',
    finalTitle:'¡Listo!', finalDesc:'Tu entrega está completa.',
    exportMd:'Exportar Markdown', exportPdf:'Exportar PDF (HTML)',
    exportEditorial:'Exportar como libro editorial',
    newConsult:'Nueva consultoría', exec:'Resumen Ejecutivo',
    preloadUrlLabel:'URL del sitio web', preloadUrlPlaceholder:'https://tu-sitio.com',
    preloadSocialLabel:'Contenido de redes sociales',
    preloadSocialPlaceholder:'Pegá bio de Instagram, posts representativos...',
    preloadFetching:'Accediendo al sitio...', preloadAnalyzing:'Analizando...',
    preloadSuccess:'¡Listo! Pre-llené el diagnóstico.',
    preloadFailed:'No pude acceder al sitio. Pegá el contenido manualmente.',
    autoDetected:'Auto-detectado', clearField:'Limpiar',
    fromProfile:'Tomado de tu perfil',
    vagueTitle:'Necesito más concreto', vagueRefine:'Refinar respuesta', vagueContinue:'Avanzar igual',
    profileTitle:'¿Cuál te representa mejor?',
    profileDesc:'Las preguntas se adaptan según tu perfil.',
    myProfile:'Mi perfil',
    myProfileTitle:'Perfil de tu negocio',
    myProfileDesc:'Estos datos se reusan automáticamente en cada herramienta. Editá cuando cambien.',
    myProfileFilledCount:'cargados de 5',
    myProfileSave:'Guardar cambios',
    myProfileSaved:'✓ Perfil guardado',
    myProfileDelete:'Borrar perfil',
    myProfileDeleteConfirm:'¿Seguro? Esto borra los 5 campos. No se puede deshacer.',
    myProfileDeleteYes:'Sí, borrar todo',
    myProfileDeleteCancel:'Cancelar',
    myProfileEmpty:'(vacío)',
    profileBusinessName:'Nombre del negocio o cuenta',
    profileBusinessNamePh:'Ej: Estación Bit, @nutricion.real, Cabañas del Sol...',
    profileBusinessDescription:'Qué hacés / qué ofrecés',
    profileBusinessDescriptionPh:'Ej: E-commerce de tech accesible. Smartwatches, auriculares, accesorios. Ticket promedio $40k...',
    profileIdealCustomer:'Cliente o seguidor ideal',
    profileIdealCustomerPh:'Ej: Hombres y mujeres 25-45 años, AMBA, clase media, compran online, usan tech para deporte y trabajo...',
    profileDifferential:'Qué te hace diferente',
    profileDifferentialPh:'Ej: Respuesta de WhatsApp <10min vs 4hs competencia. Garantía local 6 meses. 4.8★ en 300 reseñas...',
    profileMainPain:'Problema #1 que resolvés',
    profileMainPainPh:'Ej: Acceso a tech moderna sin pagar precio premium de Apple/Samsung...',
    continueSessionTitle:'Tenés una sesión sin terminar',
    continueSessionDesc:'Podés retomar donde dejaste o empezar de cero.',
    continueSessionLast:'Última actividad',
    continueSessionContinue:'Continuar donde dejaste',
    continueSessionFresh:'Empezar de cero',
    sessionBlockLabel:'Bloque',
    sessionReviewLabel:'Resumen ejecutivo',
    sessionDoneLabel:'Completado',
    guideMeBtn:'¿No sabés por dónde? Te guío',
    guideMeBtnShort:'Te guío',
    journeyPickTitle:'¿Qué querés lograr?',
    journeyPickDesc:'Elegí tu objetivo y te armo un camino estratégico con las herramientas en el orden que más rinde.',
    journeyObj_brandClarity:'Clarificar mi marca y mensaje',
    journeyObj_attractCustomers:'Atraer más clientes / vender más',
    journeyObj_createContent:'Crear contenido que conecte',
    journeyObj_diagnose:'Diagnosticar dónde estoy parado',
    journeyObj_growSocial:'Crecer en redes sociales',
    journeyPlanTitle:'Tu camino sugerido',
    journeyPlanDesc:'Cada paso prepara el terreno para el siguiente. Podés saltar uno si ya lo hiciste antes.',
    journeyStart:'Empezar primer paso',
    journeyActiveTitle:'Tu camino en curso',
    journeyActiveProgress:'completado',
    journeyActiveNext:'Próximo paso',
    journeyActiveContinue:'Continuar',
    journeyActiveAbandon:'Abandonar este camino',
    journeyAbandonConfirm:'¿Seguro que querés abandonar? El progreso de cada herramienta queda guardado igual.',
    journeyAbandonYes:'Sí, abandonar',
    journeyAbandonCancel:'Cancelar',
    journeyDoneTitle:'¡Camino completado!',
    journeyDoneDesc:'Terminaste todos los pasos del camino sugerido. Podés ver las entregas de cada herramienta o empezar otro camino.',
    journeyNextStepCta:'Continuar con el camino: próximo paso',
    tipFabrisio:'Tip de Fabrisio',
    tipDismiss:'Entendido',
    tipsReset:'Mostrar tips otra vez',
    tipsResetDone:'✓ Tips reseteados — aparecerán de nuevo al entrar a cada tool',
  },
  en: {
    appName:'Fabrisio sin Humo', subtitle:'AI-powered strategy & consulting builder',
    heroDesc:'Professional toolbox to diagnose, strategize and scale your business. No BS.',
    startBtn:'Start', next:'Next', back:'Back', skip:'Skip',
    dontKnow:"I don't know / Help me think", askClaude:'Ask Fabrisio',
    send:'Send', step:'Step', of:'of', selectMultiple:'You can pick several',
    chatPlaceholder:'Ask whatever you need...', chatEmpty:"Tell me what's blocking you.",
    bizTypeTitle:'What kind of business do you have?',
    bizTypeDesc:'This adapts ALL tools to your reality.',
    bizTypeContinue:'Continue', bizTypeChange:'Change',
    bizTypes:{
      ecommerce:{label:'E-commerce / Retail',desc:'Physical products, online store'},
      service:{label:'Professional service',desc:'Consulting, agency, freelance'},
      b2b:{label:'B2B',desc:'Software, corporate solutions'},
      health:{label:'Health & wellness',desc:'Clinic, practice, therapist, gym'},
      education:{label:'Education / Info-products',desc:'Courses, mentoring, training'},
      local:{label:'Local / In-person',desc:'Restaurant, salon, real estate'}
    },
    toolboxTitle:'Toolbox', toolboxSubtitle:'Your complete consulting kit',
    toolboxDesc:'Pick the problem you want to solve today.',
    toolboxSearch:'Search tool...', toolboxRecommended:'Recommended for your business',
    toolboxAll:'All', toolboxEmpty:"Couldn't find tools.", toolboxBack:'Back to tools',
    toolStart:'Start', toolSoon:'Soon',
    toolLevelBasico:'Basic', toolLevelIntermedio:'Intermediate', toolLevelAvanzado:'Advanced',
    toolTimeMin:'min',
    catDiagnosis:'Diagnosis & Strategy', catMarketing:'Marketing & Acquisition',
    catContent:'Content & Production', catOperations:'Operations & Analysis',
    catGrowth:'Growth & Scaling',
    catDiagnosisDesc:'Understand where you stand', catMarketingDesc:'Attract customers',
    catContentDesc:'Create content that connects', catOperationsDesc:'Optimize business health',
    catGrowthDesc:'Next level',
    loginTitle:'Access Fabrisio sin Humo',
    loginDesc:'Enter your access password to continue.',
    loginPlaceholder:'Access password...', loginBtn:'Access',
    loginContact:"Don't have access? Contact Fabrisio on WhatsApp.",
    error:'Something went wrong', retry:'Retry', generating:'Fabrisio is thinking...', cancel:'Cancel',
    entryTitle:'How do you want to start?', entryDesc:'Pick the mode that suits you.',
    entryGuided:'Question by question', entryGuidedDesc:'Tidy mode. Guided.',
    entryPreload:'Preload from URL/social', entryPreloadDesc:'Paste your URL and I pre-fill.',
    reviewTitle:'Executive summary', reviewDesc:'Confirm before building.',
    confirmReview:'Is everything correct?', yesGenerate:'Yes, generate', noAdjust:'No, adjust',
    approveContinue:'Approve and continue', finalizeStrategy:'Finalize',
    refine:'Refine this block', refineLabel:'What to refine?',
    refinePlaceholder:'Ex: More detail, add X...', applyRefine:'Apply refinement',
    finalTitle:'Done!', finalDesc:'Your output is complete.',
    exportMd:'Export Markdown', exportPdf:'Export PDF (HTML)',
    exportEditorial:'Export as editorial book',
    newConsult:'New consultation', exec:'Executive Summary',
    preloadUrlLabel:'Website URL', preloadUrlPlaceholder:'https://your-site.com',
    preloadSocialLabel:'Social media content',
    preloadSocialPlaceholder:'Paste Instagram bio, representative posts...',
    preloadFetching:'Accessing site...', preloadAnalyzing:'Analyzing...',
    preloadSuccess:'Done! Pre-filled.', preloadFailed:"Couldn't access site.",
    autoDetected:'Auto-detected', clearField:'Clear',
    fromProfile:'From your profile',
    vagueTitle:'I need more specifics', vagueRefine:'Refine answer', vagueContinue:'Continue anyway',
    profileTitle:'Which represents you best?',
    profileDesc:'Questions adapt to your profile.',
    myProfile:'My profile',
    myProfileTitle:'Your business profile',
    myProfileDesc:'These fields are reused automatically across tools. Edit them when they change.',
    myProfileFilledCount:'of 5 filled',
    myProfileSave:'Save changes',
    myProfileSaved:'✓ Profile saved',
    myProfileDelete:'Delete profile',
    myProfileDeleteConfirm:'Sure? This deletes all 5 fields. Can\'t be undone.',
    myProfileDeleteYes:'Yes, delete all',
    myProfileDeleteCancel:'Cancel',
    myProfileEmpty:'(empty)',
    profileBusinessName:'Business or account name',
    profileBusinessNamePh:'Ex: TechShop, @real.nutrition, SunCabins...',
    profileBusinessDescription:'What you do / what you offer',
    profileBusinessDescriptionPh:'Ex: Accessible tech e-commerce. Smartwatches, headphones, accessories. Avg ticket $40...',
    profileIdealCustomer:'Ideal customer or follower',
    profileIdealCustomerPh:'Ex: Men and women 25-45, urban, middle class, buy online, use tech for sports and work...',
    profileDifferential:'What makes you different',
    profileDifferentialPh:'Ex: WhatsApp reply <10min vs 4h competitors. Local 6-month warranty. 4.8★ on 300 reviews...',
    profileMainPain:'Problem #1 you solve',
    profileMainPainPh:'Ex: Access to modern tech without paying Apple/Samsung premium...',
    continueSessionTitle:'You have an unfinished session',
    continueSessionDesc:'Pick up where you left off, or start fresh.',
    continueSessionLast:'Last activity',
    continueSessionContinue:'Continue where you left off',
    continueSessionFresh:'Start fresh',
    sessionBlockLabel:'Block',
    sessionReviewLabel:'Executive summary',
    sessionDoneLabel:'Completed',
    guideMeBtn:"Don't know where to start? I'll guide you",
    guideMeBtnShort:"Guide me",
    journeyPickTitle:'What do you want to achieve?',
    journeyPickDesc:"Pick your goal and I'll build a strategic path with the tools in the order that works best.",
    journeyObj_brandClarity:'Clarify my brand and message',
    journeyObj_attractCustomers:'Attract more customers / sell more',
    journeyObj_createContent:'Create content that connects',
    journeyObj_diagnose:'Diagnose where I stand',
    journeyObj_growSocial:'Grow on social media',
    journeyPlanTitle:'Your suggested path',
    journeyPlanDesc:'Each step sets up the next. You can skip one if you already did it before.',
    journeyStart:'Start first step',
    journeyActiveTitle:'Your active path',
    journeyActiveProgress:'completed',
    journeyActiveNext:'Next step',
    journeyActiveContinue:'Continue',
    journeyActiveAbandon:'Abandon this path',
    journeyAbandonConfirm:'Sure? Each tool\'s progress stays saved anyway.',
    journeyAbandonYes:'Yes, abandon',
    journeyAbandonCancel:'Cancel',
    journeyDoneTitle:'Path completed!',
    journeyDoneDesc:'You finished all the suggested steps. You can review each tool\'s output or start another path.',
    journeyNextStepCta:'Continue path: next step',
    tipFabrisio:'Tip from Fabrisio',
    tipDismiss:'Got it',
    tipsReset:'Show tips again',
    tipsResetDone:'✓ Tips reset — they\'ll appear again when you enter each tool',
  }
};

const TOOLS = {
  'brand-story': {
    id:'brand-story', category:'diagnosis',
    name:{es:'Brand Story Interview',en:'Brand Story Interview'},
    description:{es:'Construí la historia comercial de tu marca. Tu voz, sin reformulaciones.',en:'Build your brand story. Your voice, no reformulations.'},
    level:'basico', time:'20-30', available:true,
    recommendedFor:['service','b2b','education','health','ecommerce','local'],
    illustrationId:'brand-story', entryModes:['guided'], requiresProfile:true,
    profiles:{
      es:[
        {id:'entrepreneur',label:'Emprendedor/a',desc:'Tenés un negocio o proyecto propio.'},
        {id:'professional',label:'Profesional independiente',desc:'Ofrecés servicios bajo tu nombre.'},
        {id:'seller',label:'Vendedor/a o comercial',desc:'Vendés para una empresa.'},
        {id:'personalBrand',label:'Marca personal / Creador',desc:'Tu activo principal es tu figura.'}
      ],
      en:[
        {id:'entrepreneur',label:'Entrepreneur',desc:'You have your own business.'},
        {id:'professional',label:'Independent professional',desc:'Services under your name.'},
        {id:'seller',label:'Salesperson',desc:'You sell for a company.'},
        {id:'personalBrand',label:'Personal brand / Creator',desc:'Your figure is your main asset.'}
      ]
    },
    questions:[
      {phase:'origin',key:'bsOrigin1',type:'textarea'},
      {phase:'origin',key:'bsOrigin2',type:'textarea'},
      {phase:'origin',key:'bsOrigin3',type:'textarea'},
      {phase:'offer',key:'bsOffer1',type:'textarea'},
      {phase:'offer',key:'bsOffer2',type:'textarea'},
      {phase:'offer',key:'bsOffer3',type:'textarea',optional:true},
      {phase:'audience',key:'bsAudience1',type:'textarea'},
      {phase:'audience',key:'bsAudience2',type:'textarea'},
      {phase:'audience',key:'bsAudience3',type:'textarea'},
      {phase:'values',key:'bsValues1',type:'textarea'},
      {phase:'values',key:'bsValues2',type:'textarea'},
      {phase:'values',key:'bsValues3',type:'textarea'},
      {phase:'challenges',key:'bsChallenges1',type:'textarea'},
      {phase:'challenges',key:'bsChallenges2',type:'textarea'},
      {phase:'challenges',key:'bsChallenges3',type:'textarea'},
      {phase:'future',key:'bsFuture1',type:'textarea'},
      {phase:'future',key:'bsFuture2',type:'textarea'}
    ],
    phases:{
      es:{origin:'1. Origen',offer:'2. Oferta',audience:'3. Cliente y Diferencial',values:'4. Valores y Propósito',challenges:'5. Desafíos',future:'6. Lo que viene'},
      en:{origin:'1. Origin',offer:'2. Offer',audience:'3. Client & Edge',values:'4. Values',challenges:'5. Challenges',future:'6. Future'}
    },
    outputBlocks:[
      {id:'bsLiteralDoc',title:{es:'Documento Brand Story (voz literal)',en:'Brand Story Document'}},
      {id:'bsStrategicReading',title:{es:'Lectura estratégica',en:'Strategic reading'}}
    ]
  },
  'foda-estrategico': {
    id:'foda-estrategico', category:'diagnosis',
    name:{es:'FODA Estratégico',en:'Strategic SWOT'},
    description:{es:'Análisis FODA + matriz CAME + plan de acción priorizado.',en:'SWOT + CAME matrix + prioritized action plan.'},
    level:'intermedio', time:'30-45', available:true,
    recommendedFor:['ecommerce','service','b2b','health','education','local'],
    illustrationId:'swot-analysis', entryModes:['guided'],
    questions:[
      {phase:'identification',key:'fodaIdentification',type:'textarea'},
      {phase:'strengths',key:'fodaMainStrength',type:'textarea'},
      {phase:'strengths',key:'fodaOtherStrengths',type:'textarea'},
      {phase:'weaknesses',key:'fodaMainWeakness',type:'textarea'},
      {phase:'weaknesses',key:'fodaOtherWeaknesses',type:'textarea'},
      {phase:'opportunities',key:'fodaMainOpportunity',type:'textarea'},
      {phase:'opportunities',key:'fodaOtherOpportunities',type:'textarea'},
      {phase:'threats',key:'fodaMainThreat',type:'textarea'},
      {phase:'threats',key:'fodaOtherThreats',type:'textarea'},
      {phase:'competitive',key:'fodaCompetitors',type:'textarea',optional:true,skippable:true}
    ],
    phases:{
      es:{identification:'Identificación',strengths:'Fortalezas',weaknesses:'Debilidades',opportunities:'Oportunidades',threats:'Amenazas',competitive:'Competitivo'},
      en:{identification:'Identification',strengths:'Strengths',weaknesses:'Weaknesses',opportunities:'Opportunities',threats:'Threats',competitive:'Competitive'}
    },
    outputBlocks:[
      {id:'fodaSynthesis',title:{es:'Síntesis + FODA',en:'Synthesis + SWOT'}},
      {id:'fodaCAME',title:{es:'Matriz CAME',en:'CAME Matrix'}},
      {id:'fodaActionPlan',title:{es:'Priorización + Plan de Acción',en:'Prioritization + Action Plan'}}
    ]
  },
  'paid-media-strategy': {
    id:'paid-media-strategy', category:'marketing',
    name:{es:'Estrategia de Paid Media',en:'Paid Media Strategy'},
    description:{es:'Plan completo de Meta, Google y TikTok Ads.',en:'Complete plan for Meta, Google and TikTok Ads.'},
    level:'intermedio', time:'25-40', available:true,
    recommendedFor:['ecommerce','service','health','education','local'],
    illustrationId:'paid-media', entryModes:['preload','guided'],
    questions:[
      {phase:'business',key:'product',type:'textarea'},
      {phase:'business',key:'problem',type:'textarea'},
      {phase:'business',key:'differential',type:'textarea'},
      {phase:'customer',key:'demographics',type:'textarea'},
      {phase:'customer',key:'lifeSituation',type:'textarea'},
      {phase:'customer',key:'desires',type:'textarea'},
      {phase:'customer',key:'fears',type:'textarea'},
      {phase:'customer',key:'mainPain',type:'textarea'},
      {phase:'customer',key:'social',type:'multiselect'},
      {phase:'success',key:'case1',type:'textarea'},
      {phase:'success',key:'case2',type:'textarea',optional:true},
      {phase:'success',key:'case3',type:'textarea',optional:true},
      {phase:'success',key:'metrics',type:'textarea'},
      {phase:'ads',key:'currentAds',type:'textarea',skippable:true},
      {phase:'ads',key:'currentCampaigns',type:'textarea'},
      {phase:'ads',key:'objective',type:'select'},
      {phase:'ads',key:'cta',type:'textarea'},
      {phase:'ads',key:'audience',type:'textarea'},
      {phase:'ads',key:'budget',type:'textarea'}
    ],
    phases:{
      es:{business:'Negocio',customer:'Cliente ideal',success:'Casos de éxito',ads:'Ads actuales'},
      en:{business:'Business',customer:'Ideal customer',success:'Success cases',ads:'Current ads'}
    },
    outputBlocks:[
      {id:'pmBlock1',title:{es:'Bloque 1: Estrategia + Funnel',en:'Block 1: Strategy + Funnel'}},
      {id:'pmBlock2',title:{es:'Bloque 2: Campañas + Segmentación + Presupuesto',en:'Block 2: Campaigns + Targeting + Budget'}},
      {id:'pmBlock3',title:{es:'Bloque 3: Creatividades + Copy + Testing',en:'Block 3: Creatives + Copy + Testing'}}
    ]
  },
  'ideas-virales-1':{
    id:'ideas-virales-1',category:'marketing',
    name:{es:'Generador de Ideas Virales',en:'Viral Ideas Generator'},
    description:{es:'Ideas de contenido con potencial viral, adaptadas a tu marca y plataforma.',en:'Content ideas with viral potential, adapted to your brand and platform.'},
    level:'basico',time:'15-25',available:true,
    recommendedFor:['ecommerce','service','health','local','education'],
    illustrationId:'viral',entryModes:['guided'],
    questions:[
      {phase:'context',key:'viralAbout',type:'textarea'},
      {phase:'context',key:'viralAudience',type:'textarea'},
      {phase:'context',key:'viralPlatform',type:'select'},
      {phase:'voice',key:'viralTone',type:'select'},
      {phase:'voice',key:'viralAngle',type:'textarea',optional:true},
      {phase:'performance',key:'viralFrequency',type:'select'},
      {phase:'performance',key:'viralBestPosts',type:'textarea',optional:true}
    ],
    phases:{
      es:{context:'Contexto',voice:'Voz y tono',performance:'Performance y ritmo'},
      en:{context:'Context',voice:'Voice & tone',performance:'Performance & cadence'}
    },
    outputBlocks:[
      {id:'viralIdeasList',title:{es:'Bloque 1: 10-15 Ideas Virales',en:'Block 1: 10-15 Viral Ideas'}},
      {id:'viralCalendar',title:{es:'Bloque 2: Calendario de Publicación (4 semanas)',en:'Block 2: Publishing Calendar (4 weeks)'}}
    ]
  },
  'ideas-instagram':{
    id:'ideas-instagram',category:'marketing',
    name:{es:'Ideas de Contenido para Instagram',en:'Instagram Content Ideas'},
    description:{es:'15 ideas específicas para Instagram + estrategia de cuenta. Adaptado al algoritmo y formatos nativos.',en:'15 Instagram-specific ideas + account strategy. Adapted to algorithm and native formats.'},
    level:'basico',time:'15-25',available:true,
    recommendedFor:['ecommerce','service','health','local','education'],
    illustrationId:'instagram',entryModes:['guided'],
    questions:[
      {phase:'account',key:'igAbout',type:'textarea'},
      {phase:'account',key:'igIdealFollower',type:'textarea'},
      {phase:'account',key:'igCurrentFollowers',type:'select'},
      {phase:'goal',key:'igPriority',type:'select'},
      {phase:'goal',key:'igFormatFocus',type:'multiselect'},
      {phase:'style',key:'igVibe',type:'textarea',optional:true}
    ],
    phases:{
      es:{account:'Tu cuenta',goal:'Objetivo de la etapa',style:'Estilo y referencias'},
      en:{account:'Your account',goal:'Stage goal',style:'Style & references'}
    },
    outputBlocks:[
      {id:'igIdeasList',title:{es:'Bloque 1: 15 Ideas de Contenido',en:'Block 1: 15 Content Ideas'}},
      {id:'igStrategy',title:{es:'Bloque 2: Estrategia de Cuenta',en:'Block 2: Account Strategy'}}
    ]
  }
};

const LOCKED_TOOLS = [
  {id:'optimizador-meta-ads',category:'marketing',level:'avanzado',time:'20-35',illustrationId:'paid-media',recommendedFor:['ecommerce','service']},
  {id:'ideas-virales-2',category:'marketing',level:'intermedio',time:'15-25',illustrationId:'viral',recommendedFor:['ecommerce','service','health']},
  {id:'storytelling-heroe',category:'content',level:'intermedio',time:'25-35',illustrationId:'hero',recommendedFor:['service','b2b','education']},
  {id:'guiones-video-1',category:'content',level:'intermedio',time:'20-30',illustrationId:'video',recommendedFor:['ecommerce','service','health']},
  {id:'guiones-video-2',category:'content',level:'avanzado',time:'20-30',illustrationId:'video',recommendedFor:['ecommerce','service','health']},
  {id:'producir-reel',category:'content',level:'basico',time:'20-30',illustrationId:'reel',recommendedFor:['ecommerce','service','local']},
  {id:'video-ai',category:'content',level:'avanzado',time:'30-45',illustrationId:'ai-video',recommendedFor:['ecommerce','service','b2b']},
  {id:'growth-leads',category:'growth',level:'avanzado',time:'40-60',illustrationId:'growth',recommendedFor:['ecommerce','service','b2b']}
];

const LOCKED_NAMES = {
  'optimizador-meta-ads':{es:{name:'Optimizador de Meta Ads',desc:'Auditoría y optimización de campañas existentes.'},en:{name:'Meta Ads Optimizer',desc:'Audit and optimize campaigns.'}},
  'ideas-virales-2':{es:{name:'Generador de Ideas Virales Pro',desc:'Versión avanzada con frameworks de viralidad.'},en:{name:'Viral Ideas Pro',desc:'Advanced viral frameworks.'}},
  'storytelling-heroe':{es:{name:'Storytelling: Viaje del Héroe',desc:'Aplicá el viaje del héroe a tu marca.'},en:{name:"Hero's Journey",desc:"Apply hero's journey."}},
  'guiones-video-1':{es:{name:'Guiones para Video Ads',desc:'Scripts listos para producir.'},en:{name:'Video Ad Scripts',desc:'Ready-to-produce scripts.'}},
  'guiones-video-2':{es:{name:'Guiones para Video Ads Pro',desc:'Versión avanzada con hooks.'},en:{name:'Video Scripts Pro',desc:'Advanced with hooks.'}},
  'producir-reel':{es:{name:'Producir Reel de Instagram',desc:'Plan completo de producción.'},en:{name:'Instagram Reel',desc:'Complete Reel plan.'}},
  'video-ai':{es:{name:'Director de Video con IA',desc:'Prompts para video generativo.'},en:{name:'AI Video Director',desc:'AI video prompts.'}},
  'growth-leads':{es:{name:'Growth Architect: Leads',desc:'Arquitectura de generación de leads.'},en:{name:'Growth Architect',desc:'Lead gen architecture.'}}
};

const BIZ_Q = {
  es:{
    product:{title:'¿Cuál es tu producto o servicio?',desc:'Nombre y descripción.',placeholder:'Ej: Estación Bit — e-commerce de smartwatches...'},
    problem:{title:'¿Qué problema resuelve?',desc:'El pain real.',placeholder:'Ej: Quieren tech sin gastar fortuna...'},
    differential:{title:'¿Cuál es tu diferencial?',desc:'Ventaja real, específica.',placeholder:'Ej: Precios mayoristas, envío 48hs, garantía local...'},
    demographics:{title:'Cliente ideal: demografía',desc:'Edad, género, ubicación.',placeholder:'Ej: 25-45 años, AMBA, clase media...'},
    lifeSituation:{title:'Cliente ideal: situación de vida',desc:'¿En qué momento está?',placeholder:'Ej: Trabaja en relación de dependencia...'},
    desires:{title:'Cliente ideal: deseos',desc:'¿Qué quiere conseguir?',placeholder:'Ej: Verse moderno, controlar salud...'},
    fears:{title:'Cliente ideal: miedos',desc:'¿Qué desconfianza tiene?',placeholder:'Ej: "¿Será trucho?"...'},
    mainPain:{title:'El problema #1 del cliente',desc:'El dolor principal.',placeholder:'Ej: Sentir que se queda atrás...'},
    social:{title:'¿Qué redes usa tu cliente?',desc:'Para decidir plataformas.',options:['Instagram','Facebook','TikTok','YouTube','LinkedIn','Twitter/X','WhatsApp']},
    case1:{title:'Caso de éxito #1',desc:'Problema + resultado.',placeholder:'Ej: Bajó 8kg con smartwatch en 3 meses...'},
    case2:{title:'Caso de éxito #2 (opcional)',desc:'',placeholder:'Otro caso...'},
    case3:{title:'Caso de éxito #3 (opcional)',desc:'',placeholder:'Otro caso...'},
    metrics:{title:'Métricas históricas',desc:'Ventas, ROAS, CPL.',placeholder:'Ej: 500 ventas/mes, ROAS 3.5x...'},
    currentAds:{title:'¿Ya hacés ads?',desc:'Plataformas, agencia/interno.',placeholder:'Ej: Meta Ads 1 año, interno...'},
    currentCampaigns:{title:'Campañas actuales',desc:'Objetivo, presupuesto, CPL.',placeholder:'Ej: Tráfico, $30k/día, ROAS 2.8x...'},
    objective:{title:'Objetivo de la próxima campaña',desc:'¿Leads, ventas o branding?',options:['Generar leads calificados','Aumentar ventas directas','Branding / posicionamiento','Lanzamiento de producto','Reactivar clientes']},
    cta:{title:'CTA principal',desc:'¿Qué querés que haga?',placeholder:'Ej: Comprá ahora con 20% off...'},
    audience:{title:'¿A qué audiencia apuntás?',desc:'Audiencias que funcionan.',placeholder:'Ej: Intereses tech, lookalike de compradores...'},
    budget:{title:'Presupuesto y métricas objetivo',desc:'Inversión y KPIs.',placeholder:'Ej: $50k/día, ROAS 4x...'},
    fodaIdentification:{title:'Identificación del negocio',desc:'Nombre + qué hace + a quién.',placeholder:'Ej: Estación Bit — tech accesible para clase media...'},
    fodaMainStrength:{title:'Principal Fortaleza',desc:'La que MÁS diferencia. Con datos concretos.',placeholder:'Ej: WhatsApp <10min vs 4hs competencia. 4.8★ en 300 reseñas...'},
    fodaOtherStrengths:{title:'Otras 2-4 Fortalezas',desc:'Específicas y operativas.',placeholder:'Ej:\n- Stock propio, no dropshipping\n- 200+ productos curados...'},
    fodaMainWeakness:{title:'Principal Debilidad',desc:'Lo que MÁS limita. Honesto.',placeholder:'Ej: 70% dependencia Meta Ads. Si cambia el algoritmo, caemos...'},
    fodaOtherWeaknesses:{title:'Otras 2-4 Debilidades',desc:'Operativas, financieras.',placeholder:'Ej:\n- Sin canal orgánico sólido\n- Marca poco conocida fuera AMBA...'},
    fodaMainOpportunity:{title:'Principal Oportunidad',desc:'EXTERNA, no interna.',placeholder:'Ej: Inflación impulsa segmento tech accesible +30% anual...'},
    fodaOtherOpportunities:{title:'Otras 2-4 Oportunidades',desc:'Externas.',placeholder:'Ej:\n- IA para atención 24/7\n- WhatsApp Business API...'},
    fodaMainThreat:{title:'Principal Amenaza',desc:'Riesgo externo serio.',placeholder:'Ej: Recesión podría reducir consumo no esencial 20-30%...'},
    fodaOtherThreats:{title:'Otras 2-4 Amenazas',desc:'Otros riesgos externos.',placeholder:'Ej:\n- Marcas chinas con precios 30% más bajos\n- Scammers dañando confianza...'},
    fodaCompetitors:{title:'Análisis competitivo (opcional)',desc:'2-3 competidores directos.',placeholder:'Ej:\n1. Tienda X — precios más altos\n2. ML Full — atención mala\n3. Tienda Z — envíos lentos...'},
    bsOrigin1:{title:'¿Cómo se llama tu negocio o marca?',desc:'Nombre concreto.',placeholder:'Ej: Estación Bit...'},
    bsOrigin2:{title:'¿Cuándo y cómo empezaste?',desc:'Año + qué hacías antes.',placeholder:'Ej: Arranqué en 2017, antes era contador...'},
    bsOrigin3:{title:'¿Qué te llevó a esto?',desc:'El "para qué" inicial.',placeholder:'Ej: Detecté que no había e-commerce serio de tech...'},
    bsOffer1:{title:'¿Qué ofrecés hoy?',desc:'Concreto.',placeholder:'Ej: Smartwatches, auriculares, accesorios tech...'},
    bsOffer2:{title:'¿Qué problema resolvés?',desc:'El dolor.',placeholder:'Ej: Acceso a tech sin pagar premium...'},
    bsOffer3:{title:'Algo extra de tu oferta (opcional)',desc:'',placeholder:'Ej: Garantía, modalidades...'},
    bsAudience1:{title:'¿A quién apuntás?',desc:'Perfil concreto.',placeholder:'Ej: Dueños PyME 35-55, facturación $5M-$100M...'},
    bsAudience2:{title:'¿Qué te hace diferente?',desc:'Específico. NO "calidad" ni "atención".',placeholder:'Ej: Soy emprendedor activo, no consultor teórico...'},
    bsAudience3:{title:'¿Caso de éxito con cifras?',desc:'Resultados concretos.',placeholder:'Ej: Cliente $2M→$5M/mes en 3 meses...'},
    bsValues1:{title:'¿Qué 3 valores te representan?',desc:'Max 3. Concretos.',placeholder:'Ej: 1) Honestidad brutal 2) Pensamiento de dueño 3) Resultados medibles...'},
    bsValues2:{title:'¿Cuál es tu propósito?',desc:'Más allá del dinero.',placeholder:'Ej: Demostrar que se puede emprender en serio en Argentina...'},
    bsValues3:{title:'¿Qué querés lograr en 1-3 años?',desc:'Concreto.',placeholder:'Ej: Consultora de 5 personas, Estación Bit +30% anual...'},
    bsChallenges1:{title:'Momento más difícil',desc:'Concreto.',placeholder:'Ej: 2020 pandemia, cabañas cayeron a cero...'},
    bsChallenges2:{title:'¿Cómo lo superaste?',desc:'Qué hiciste.',placeholder:'Ej: Reconvertí a alquileres mensuales, bajé costos 40%...'},
    bsChallenges3:{title:'Aprendizaje de ese proceso',desc:'El insight.',placeholder:'Ej: Nunca depender de un solo flujo de ingresos...'},
    bsFuture1:{title:'Objetivos próximos meses',desc:'3-12 meses.',placeholder:'Ej: Q1: lanzar plataforma. Q2: 5 clientes pagos...'},
    bsFuture2:{title:'¿Ideas nuevas que querés explorar?',desc:'',placeholder:'Ej: SaaS para PyMEs, podcast, expansión...'},
    viralAbout:{title:'¿De qué se trata tu cuenta o negocio?',desc:'Qué hacés, qué ofrecés, en qué nicho estás.',placeholder:'Ej: Soy nutricionista deportiva, trabajo con runners amateurs en CABA. Doy planes personalizados y educo sobre nutrición sin fanatismos...'},
    viralAudience:{title:'¿A quién querés que llegue ese contenido?',desc:'Audiencia ideal: demografía + intereses + dolor.',placeholder:'Ej: Hombres y mujeres 28-45, runners que entrenan 3-4 veces por semana, quieren mejorar performance sin contar calorías ni hacer dietas extremas...'},
    viralPlatform:{title:'¿En qué plataforma vas a publicar?',desc:'Esto define el formato y duración.',options:['Instagram (Reels)','TikTok','YouTube Shorts','Multi (Reels + TikTok + Shorts)','LinkedIn (video o texto)']},
    viralTone:{title:'¿Cuál es el tono de tu marca?',desc:'Cómo querés sonar.',options:['Educativo y claro','Humorístico / irónico','Polémico / contrarian','Inspiracional / motivacional','Técnico / experto','Cercano / coloquial']},
    viralAngle:{title:'¿Algún tema o ángulo específico que querés explorar? (opcional)',desc:'Para enfocar las ideas en algo concreto.',placeholder:'Ej: errores comunes en la alimentación pre-carrera, mitos que escucho todos los días, cómo entrenar con un trabajo de oficina...'},
    viralFrequency:{title:'¿Con qué frecuencia podés publicar?',desc:'Para armar un calendario realista.',options:['1 post por semana','2-3 posts por semana','4-5 posts por semana','Diario (6-7 por semana)']},
    viralBestPosts:{title:'¿Qué posts tuyos funcionaron mejor antes? (opcional)',desc:'Pegá títulos, descripciones o el ángulo. Sirve para detectar patrones.',placeholder:'Ej: Un Reel donde explicaba por qué la avena no es el mejor desayuno: 50k views, 200 comentarios. Un carrusel sobre suplementos: 30k...'},
    igAbout:{title:'¿De qué se trata tu cuenta de Instagram?',desc:'Nicho + propuesta de valor.',placeholder:'Ej: Cuenta de cocina rápida para padres que trabajan. Recetas de 15 minutos con ingredientes de supermercado. Sin filtros raros ni cosas pretenciosas.'},
    igIdealFollower:{title:'¿Quién es tu seguidor ideal?',desc:'Demografía + qué le interesa + por qué te seguiría.',placeholder:'Ej: Mamás y papás 30-45 años, trabajan jornada completa, llegan tarde a casa y no saben qué cocinar. Quieren comer bien sin pasar 1 hora en la cocina.'},
    igCurrentFollowers:{title:'¿Cuántos seguidores tenés hoy?',desc:'Para adaptar la estrategia al tamaño de tu cuenta.',options:['Menos de 1.000','1.000 a 10.000','10.000 a 50.000','Más de 50.000','No importa / cuenta nueva']},
    igPriority:{title:'¿Qué priorizás en esta etapa?',desc:'El objetivo principal manda la estrategia.',options:['Crecer en seguidores','Mejorar engagement','Vender (productos/servicios)','Construir comunidad','Posicionarme como experto/a']},
    igFormatFocus:{title:'¿En qué formatos te querés enfocar?',desc:'Podés elegir varios. El plan se adapta al mix.',options:['Reels','Carruseles','Stories','Lives','Post de feed','Mix balanceado']},
    igVibe:{title:'Estética, vibe o cuentas de referencia (opcional)',desc:'Para alinear el estilo con tu marca.',placeholder:'Ej: minimalista tipo @cuenta1, energía positiva tipo @cuenta2, profesional pero cercano. Evitar lo aspiracional fake de gurúes.'}
  },
  en:{
    product:{title:'What is your product or service?',desc:'Name and description.',placeholder:'Ex: Tech e-commerce...'},
    problem:{title:'What problem does it solve?',desc:'Real pain.',placeholder:'Ex: Want tech without premium prices...'},
    differential:{title:'Your competitive edge?',desc:'Real advantage.',placeholder:'Ex: Wholesale prices, fast shipping...'},
    demographics:{title:'Ideal customer demographics',desc:'Age, gender, location.',placeholder:'Ex: 25-45, major cities...'},
    lifeSituation:{title:'Customer life situation',desc:'What stage?',placeholder:'Ex: Corporate job...'},
    desires:{title:'Customer desires',desc:'What do they want?',placeholder:'Ex: Look modern...'},
    fears:{title:'Customer fears',desc:'Distrust.',placeholder:'Ex: "Is it original?"...'},
    mainPain:{title:"Customer's #1 pain",desc:'Main pain.',placeholder:'Ex: Feeling left behind...'},
    social:{title:'Social media they use?',desc:'Platforms.',options:['Instagram','Facebook','TikTok','YouTube','LinkedIn','Twitter/X','WhatsApp']},
    case1:{title:'Success case #1',desc:'Problem + result.',placeholder:'Ex: Lost 8kg in 3 months...'},
    case2:{title:'Success case #2 (optional)',desc:'',placeholder:'Another case...'},
    case3:{title:'Success case #3 (optional)',desc:'',placeholder:'Another case...'},
    metrics:{title:'Historical metrics',desc:'Sales, ROAS.',placeholder:'Ex: 500 sales/month, ROAS 3.5x...'},
    currentAds:{title:'Running ads?',desc:'Platforms.',placeholder:'Ex: Meta Ads 1 year...'},
    currentCampaigns:{title:'Current campaigns',desc:'Budget, CPL.',placeholder:'Ex: Traffic $1k/day...'},
    objective:{title:'Next campaign goal',desc:'Leads, sales, branding?',options:['Generate leads','Increase sales','Branding','Product launch','Reactivate']},
    cta:{title:'Main CTA',desc:'User action.',placeholder:'Ex: Buy now 20% off...'},
    audience:{title:'Target audience?',desc:'Working audiences.',placeholder:'Ex: Tech interests...'},
    budget:{title:'Budget and KPIs',desc:'Investment.',placeholder:'Ex: $1.5k/day, ROAS 4x...'},
    fodaIdentification:{title:'Business identification',desc:'Name + what.',placeholder:'Ex: TechShop — accessible tech...'},
    fodaMainStrength:{title:'Main Strength',desc:'Most differentiating. With data.',placeholder:'Ex: WhatsApp <10min vs 4h competitor...'},
    fodaOtherStrengths:{title:'Other 2-4 Strengths',desc:'Specific.',placeholder:'Ex:\n- Own stock\n- Curated catalog...'},
    fodaMainWeakness:{title:'Main Weakness',desc:'Honest.',placeholder:'Ex: 70% dependent on Meta Ads...'},
    fodaOtherWeaknesses:{title:'Other 2-4 Weaknesses',desc:'Operational.',placeholder:'Ex:\n- No organic channel\n- Unknown outside main city...'},
    fodaMainOpportunity:{title:'Main Opportunity',desc:'EXTERNAL.',placeholder:'Ex: Inflation driving accessible tech +30%...'},
    fodaOtherOpportunities:{title:'Other 2-4 Opportunities',desc:'External.',placeholder:'Ex:\n- AI for 24/7 service...'},
    fodaMainThreat:{title:'Main Threat',desc:'External risk.',placeholder:'Ex: Recession could reduce non-essential...'},
    fodaOtherThreats:{title:'Other 2-4 Threats',desc:'External.',placeholder:'Ex:\n- Chinese brands 30% cheaper...'},
    fodaCompetitors:{title:'Competitive analysis (optional)',desc:'2-3 direct competitors.',placeholder:'Ex:\n1. Store X — prices higher...'},
    bsOrigin1:{title:'What is your business called?',desc:'Name.',placeholder:'Ex: TechShop...'},
    bsOrigin2:{title:'When and how did you start?',desc:'Year + before.',placeholder:'Ex: Started 2017...'},
    bsOrigin3:{title:'What led you here?',desc:'The why.',placeholder:'Ex: Detected no serious e-commerce...'},
    bsOffer1:{title:'What do you offer today?',desc:'Concrete.',placeholder:'Ex: Smartwatches, headphones...'},
    bsOffer2:{title:'What problem do you solve?',desc:'The pain.',placeholder:'Ex: Access to tech without premium...'},
    bsOffer3:{title:'Extra info (optional)',desc:'',placeholder:'Ex: Warranty, modalities...'},
    bsAudience1:{title:'Who do you target?',desc:'Concrete profile.',placeholder:'Ex: SME owners 35-55...'},
    bsAudience2:{title:'What makes you different?',desc:'Specific. NOT "quality".',placeholder:'Ex: Active entrepreneur, not theoretical...'},
    bsAudience3:{title:'Success case with figures?',desc:'Concrete results.',placeholder:'Ex: Client went $2M to $5M/month...'},
    bsValues1:{title:'3 values that represent you?',desc:'Max 3.',placeholder:'Ex: 1) Honesty 2) Owner mindset 3) Measurable results...'},
    bsValues2:{title:'Your purpose?',desc:'Beyond money.',placeholder:'Ex: Prove serious entrepreneurship is possible...'},
    bsValues3:{title:'Goals in 1-3 years?',desc:'Concrete.',placeholder:'Ex: 5-person consultancy...'},
    bsChallenges1:{title:'Hardest moment',desc:'Concrete.',placeholder:'Ex: 2020 pandemic, revenue dropped to zero...'},
    bsChallenges2:{title:'How did you overcome it?',desc:'What you did.',placeholder:'Ex: Pivoted to monthly rentals, cut costs 40%...'},
    bsChallenges3:{title:'Learning from that',desc:'The insight.',placeholder:'Ex: Never depend on single revenue stream...'},
    bsFuture1:{title:'Coming months goals',desc:'3-12 months.',placeholder:'Ex: Q1: launch platform. Q2: 5 paid clients...'},
    bsFuture2:{title:'New ideas to explore?',desc:'',placeholder:'Ex: SaaS, podcast, expansion...'},
    viralAbout:{title:'What is your account or business about?',desc:'What you do, what you offer, which niche.',placeholder:'Ex: I\'m a sports nutritionist working with amateur runners. Personalized plans and education without dogma...'},
    viralAudience:{title:'Who do you want this content to reach?',desc:'Ideal audience: demographics + interests + pain.',placeholder:'Ex: 28-45, runners training 3-4 times a week, want to improve performance without counting calories...'},
    viralPlatform:{title:'Which platform are you publishing on?',desc:'Defines format and duration.',options:['Instagram (Reels)','TikTok','YouTube Shorts','Multi (Reels + TikTok + Shorts)','LinkedIn (video or text)']},
    viralTone:{title:'Brand tone',desc:'How you want to sound.',options:['Educational & clear','Humorous / ironic','Polemic / contrarian','Inspirational','Technical / expert','Casual / conversational']},
    viralAngle:{title:'Any specific topic or angle to explore? (optional)',desc:'To focus the ideas on something concrete.',placeholder:'Ex: common pre-race nutrition mistakes, myths I hear daily, training around a desk job...'},
    viralFrequency:{title:'How often can you publish?',desc:'For a realistic calendar.',options:['1 post per week','2-3 posts per week','4-5 posts per week','Daily (6-7 per week)']},
    viralBestPosts:{title:'Posts of yours that worked best before? (optional)',desc:'Paste titles, captions, or the angle. Helps detect patterns.',placeholder:'Ex: A Reel explaining why oatmeal isn\'t the best breakfast: 50k views, 200 comments. A carousel on supplements: 30k...'},
    igAbout:{title:'What is your Instagram account about?',desc:'Niche + value proposition.',placeholder:'Ex: Quick cooking account for working parents. 15-minute recipes with supermarket ingredients. No weird filters or pretentious stuff.'},
    igIdealFollower:{title:'Who is your ideal follower?',desc:'Demographics + interests + why they\'d follow you.',placeholder:'Ex: Working parents 30-45, full-time jobs, get home late and don\'t know what to cook. Want to eat well without spending an hour in the kitchen.'},
    igCurrentFollowers:{title:'How many followers do you have today?',desc:'To adapt the strategy to your account size.',options:['Less than 1,000','1,000 to 10,000','10,000 to 50,000','More than 50,000','Doesn\'t matter / new account']},
    igPriority:{title:'What do you prioritize this stage?',desc:'The main goal drives the strategy.',options:['Grow followers','Improve engagement','Sell (products/services)','Build community','Position myself as an expert']},
    igFormatFocus:{title:'What formats do you want to focus on?',desc:'Multiple choice. Plan adapts to the mix.',options:['Reels','Carousels','Stories','Lives','Feed post','Balanced mix']},
    igVibe:{title:'Aesthetic, vibe, or reference accounts (optional)',desc:'To align style with your brand.',placeholder:'Ex: minimalist like @account1, positive energy like @account2, professional but warm. Avoid the fake aspirational guru style.'}
  }
};

const DEMO = {
  'paid-media-strategy':{
    product:'Estación Bit — e-commerce de tech accesible. Smartwatches, auriculares, luces LED. 200+ productos. Ticket promedio $40k ARS.',
    problem:'La gente quiere tech moderna pero las marcas premium están fuera de presupuesto. Buscan calidad accesible sin riesgo de productos truchos.',
    differential:'WhatsApp <10min en horario hábil vs 4-6hs competencia. Garantía local 6 meses. Stock propio. 4.8★ en 300 reseñas verificadas.',
    demographics:'Hombres y mujeres 22-45 años. AMBA + ciudades del interior. Clase media y media-baja.',
    lifeSituation:'Trabajan 8-10hs/día. 3+ hs de celular. Hacen deporte. Compran online pero prefieren tiendas argentinas para soporte.',
    desires:'Verse modernos, mejorar productividad/salud, buena calidad de audio sin pagar fortunas.',
    fears:'"¿Será trucho?" "¿Y si se rompe?" "¿Funciona con mi celular?" "¿Si lo devuelvo me responden?"',
    mainPain:'Sentir que se quedan atrás tecnológicamente porque no pueden pagar Apple Watch ni AirPods.',
    social:['Instagram','Facebook','TikTok','WhatsApp'],
    case1:'María (32, BsAs) compró smartwatch para running. Bajó 6kg en 3 meses. Volvió a comprar 2 veces más.',
    case2:'Lucas (28, Córdoba), programador, compró auriculares. Funcionaron impecable con Mac. Recomendó a 5 compañeros.',
    case3:'Empresa de eventos compró 15 luces LED. Ticket $850k. Repitió compra 4 meses después.',
    metrics:'450 ventas/mes, ticket $40k, ROAS 3.5x, conversión 2.3%, recurrencia 28% en 6 meses.',
    currentAds:'Meta Ads 2 años interno, Ads Manager. Google Ads menos consistente. TikTok 6 meses mixto.',
    currentCampaigns:'Meta: Tráfico ($25k/día ROAS 3.2x), DPA ($15k/día ROAS 4.8x), Retargeting ($8k/día ROAS 6.2x).',
    objective:'Aumentar ventas directas',
    cta:'Comprá ahora con envío gratis. Garantía local 6 meses.',
    audience:'Intereses tech, fitness. Lookalike 1% compradores 180d. Retargeting visitantes 30d.',
    budget:'$80k-100k ARS/día. ROAS objetivo 4.5x, CPL máx $600.'
  },
  'foda-estrategico':{
    fodaIdentification:'Estación Bit — e-commerce argentino de tech accesible para clase media-baja. 7 años, 450 ventas/mes, ticket $40k ARS.',
    fodaMainStrength:'WhatsApp <10min vs 4-6hs competencia. Conversión chat-a-venta 35% vs 15% mercado. 4.8★ en 300+ reseñas verificadas.',
    fodaOtherStrengths:'- Stock propio San Luis, no dropshipping\n- 200+ productos curados y testeados\n- 7 años de equipo dueño operando\n- Garantía local 6 meses con repuestos\n- ROAS 3.5x sostenido 24 meses',
    fodaMainWeakness:'70% facturación dependiente de Meta Ads. Sin SEO ni email marketing. Si Meta cambia algoritmo o restringe cuenta, caemos directamente.',
    fodaOtherWeaknesses:'- Marca poco reconocida fuera de AMBA\n- Capital de trabajo limitado\n- Sin producto propio, solo reventa\n- Sin programa de fidelización formal\n- Sin local físico',
    fodaMainOpportunity:'Crisis argentina reconfigurando hábitos: clase media busca alternativas accesibles a marcas premium. Segmento "tech accesible" +30% anual en LATAM.',
    fodaOtherOpportunities:'- IA permite atención automatizada 24/7\n- ML cerrando vendedores informales\n- WhatsApp Business API con automatizaciones\n- Gen Z más abierta a tech sin marca premium',
    fodaMainThreat:'Recesión sostenida podría reducir consumo no esencial 20-30%. Si inflación supera ingresos, postergan compras.',
    fodaOtherThreats:'- Marcas chinas (Xiaomi, Realme) con precios 20-30% más bajos\n- Meta Ads CPL +40% últimos 18 meses\n- Restricciones importación trabando stock\n- Sitios scammers dañando confianza del segmento',
    fodaCompetitors:'1. TodoTecnología.com.ar — más reconocimiento, precios 20% más altos, atención lenta\n2. TecnoStore ML Full — más variedad, atención post-venta pésima\n3. GadgetMania — precios similares, envíos 7-10 días sin garantía local'
  },
  'brand-story':{
    bsOrigin1:'Soy Fabrisio, "Fabrisio sin Humo". Ayudo a emprendedores PyME argentinos a usar marketing digital, AI y estrategia sin chamuyo ni atajos.',
    bsOrigin2:'Arranqué a mostrar mi trabajo en LinkedIn y redes hace 2 años. Antes trabajaba 100% con clientes referidos. Llevo 25 años emprendiendo: contador público con MBA — pharmacy, cabañas, e-commerce (Estación Bit), criadero de cerdos, franquicias.',
    bsOrigin3:'Cansancio de ver "gurúes" hablando de cosas que nunca implementaron. Todo lo que recomiendo ya lo probé en alguna de mis empresas. Quiero llegar a PyMEs argentinas peleando solas contra inflación y consultores caros que no entregan.',
    bsOffer1:'1) Consultorías 1:1 a dueños PyME ($150k-300k/sesión). 2) Asesorías por proyecto (Meta Ads, AI, e-commerce desde $500k). 3) Contenido gratuito y newsletter semanal con casos reales.',
    bsOffer2:'Llegan agobiados, con ventas pero sin sistema. Después de trabajar conmigo tienen mapa claro de prioridades, ROAS medible, y sistema que funciona sin mí.',
    bsOffer3:'Consultoría inicial gratuita 30min. Máximo 8 clientes simultáneos. Garantía: si en 30 días no ves valor concreto, devuelvo el dinero.',
    bsAudience1:'Dueños PyME argentina, 35-60 años, facturación $5M-$100M, retail/servicios/agropecuario. Facturan pero sienten que podrían más.',
    bsAudience2:'No soy consultor teórico. 25 años de gestión real en sectores distintos. Cuando recomiendo algo, lo aplico antes en mis propios negocios. Estación Bit es mi laboratorio.',
    bsAudience3:'Cliente PyME e-commerce BsAs, $2M/mes ROAS 1.8x. En 3 meses: $5M/mes ROAS 4.2x. Clave: oferta Hormozi + audiencias profundas + retargeting por olas. Hoy tienen sistema propio.',
    bsValues1:'1) Honestidad brutal — digo lo que veo, no lo que quieren escuchar. 2) Pensamiento de dueño — ningún consejo si no me jugaría mi plata. 3) Resultados medibles — ROI, ROAS, no vanity metrics.',
    bsValues2:'Demostrar que se puede emprender en serio en Argentina sin chamuyo. La gente con experiencia real tiene que liderar, no influencers que nunca facturaron un peso propio.',
    bsValues3:'Convertir "Fabrisio sin Humo" en consultora de 5-8 personas. Estación Bit +30% anual. Lanzar libro o curso intensivo. 50 clientes PyME atendidos por año.',
    bsChallenges1:'2020-2021, pandemia. Cabañas en Potrero con 90% de ocupación cayeron a cero. E-commerce con problemas de stock por importaciones. Casi pierdo dos negocios al mismo tiempo.',
    bsChallenges2:'Reconvertí cabañas a alquileres mensuales para tele-trabajadores. Bajé costos 40%, renegocié proveedores, pivotee Estación Bit a productos que sí podía traer. Mantuve liquidez diversificada.',
    bsChallenges3:'Nunca depender de un solo flujo de ingresos ni de una variable externa. La diversificación es seguro de vida. Los planes B se construyen ANTES de necesitarlos.',
    bsFuture1:'Q1: lanzar plataforma Fabrisio sin Humo. Q2: 5 clientes pagos consultoría. Q3: primer caso de estudio AI criadero. Q4: 10 clientes activos + newsletter 5k suscriptores.',
    bsFuture2:'SaaS consultoría guiada con AI para PyMEs. Podcast con emprendedores argentinos reales. Expansión Estación Bit. Libro sobre 25 años emprendiendo en Argentina.'
  }
};

const BIZ_LABELS = {ecommerce:'E-commerce / Retail',service:'Servicio profesional',b2b:'B2B',health:'Salud y bienestar',education:'Educación / Infoproductos',local:'Local / Servicio presencial'};
const CRITICAL_KEYS = new Set(['differential','fodaMainStrength','fodaMainWeakness','bsAudience2','bsValues1','bsOffer2','bsOrigin3']);

// ============ PERFIL DEL NEGOCIO (persistente entre tools) ============
type ProfileKey = 'businessName' | 'businessDescription' | 'idealCustomer' | 'differential' | 'mainPain';
const PROFILE_STORAGE_KEY = 'fshumo_profile';

// Mapea preguntas de cada tool a conceptos del perfil compartido.
// Solo incluir matches semánticamente claros: si hay duda, NO mapear (es más seguro re-preguntar que ensuciar el perfil).
const PROFILE_MAPPING: Record<string, Record<string, ProfileKey>> = {
  'paid-media-strategy': {
    product: 'businessDescription',
    differential: 'differential',
    mainPain: 'mainPain',
  },
  'foda-estrategico': {
    fodaIdentification: 'businessDescription',
  },
  'ideas-virales-1': {
    viralAbout: 'businessDescription',
    viralAudience: 'idealCustomer',
  },
  'ideas-instagram': {
    igAbout: 'businessDescription',
    igIdealFollower: 'idealCustomer',
  },
  // brand-story NO se mapea — su lógica es voz personal sagrada (ver feedback_pragmatic_typing)
};

function loadProfile(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProfile(profile: Record<string, string>) {
  try { localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)); } catch {}
}

function updateProfileField(key: ProfileKey, value: string) {
  if (!value || typeof value !== 'string' || !value.trim()) return;
  const profile = loadProfile();
  profile[key] = value.trim();
  saveProfile(profile);
}

// Dado un toolId y los datos del wizard, devuelve qué keys/valores deberían pre-llenarse desde el perfil.
function getProfilePrefill(toolId: string): { values: Record<string, string>, filledKeys: Record<string, boolean> } {
  const mapping = PROFILE_MAPPING[toolId];
  if (!mapping) return { values: {}, filledKeys: {} };
  const profile = loadProfile();
  const values: Record<string, string> = {};
  const filledKeys: Record<string, boolean> = {};
  Object.entries(mapping).forEach(([questionKey, profileKey]) => {
    const v = profile[profileKey];
    if (v) { values[questionKey] = v; filledKeys[questionKey] = true; }
  });
  return { values, filledKeys };
}

// Dado un toolId y una key/value del wizard, persiste al perfil si la key está mapeada.
function pushToProfile(toolId: string, questionKey: string, value: any) {
  const mapping = PROFILE_MAPPING[toolId];
  if (!mapping) return;
  const profileKey = mapping[questionKey];
  if (!profileKey) return;
  if (typeof value !== 'string') return;
  updateProfileField(profileKey, value);
}

// ============ SESIONES (persistencia de outputs entre cierres del tab) ============
const SESSIONS_STORAGE_KEY = 'fshumo_sessions';
const SESSIONS_SCHEMA_VERSION = 1;

type SavedSession = {
  schemaVersion: number;
  toolId: string;
  data: Record<string, any>;
  reviewText: string;
  outputs: Record<string, string>;
  curBlock: number;
  stepIdx: number;
  screen: string;
  entryMode: string;
  toolProfile: string;
  skipPhase: boolean;
  autoFilled: Record<string, boolean>;
  profileFilled: Record<string, boolean>;
  vagueOverride: Record<string, boolean>;
  savedAt: number;
};

function loadAllSessions(): Record<string, SavedSession> {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function loadSession(toolId: string): SavedSession | null {
  const sessions = loadAllSessions();
  const s = sessions[toolId];
  if (!s || s.schemaVersion !== SESSIONS_SCHEMA_VERSION) return null;
  // Sólo devolvemos sesiones que realmente tienen progreso (data o reviewText o outputs)
  const hasProgress = Object.keys(s.data || {}).length > 0 || !!s.reviewText || Object.keys(s.outputs || {}).length > 0;
  if (!hasProgress) return null;
  return s;
}

function saveSessionData(toolId: string, snap: Omit<SavedSession, 'schemaVersion' | 'toolId' | 'savedAt'>) {
  const sessions = loadAllSessions();
  sessions[toolId] = { ...snap, toolId, schemaVersion: SESSIONS_SCHEMA_VERSION, savedAt: Date.now() };
  try { localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions)); } catch {}
}

function deleteSessionData(toolId: string) {
  const sessions = loadAllSessions();
  delete sessions[toolId];
  try { localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions)); } catch {}
}

function getSessionSummary(toolId: string, session: SavedSession, lng: any): string {
  const tool = (TOOLS as any)[toolId];
  if (session.screen === 'final') return lng.sessionDoneLabel || 'Completed';
  if (session.screen === 'output') {
    const total = tool?.outputBlocks?.length || 0;
    return `${lng.sessionBlockLabel || 'Block'} ${session.curBlock + 1}/${total}`;
  }
  if (session.screen === 'review') return lng.sessionReviewLabel || 'Executive summary';
  if (session.screen === 'wizard') {
    const total = tool?.questions?.length || 0;
    return `${lng.step || 'Step'} ${session.stepIdx + 1}/${total}`;
  }
  return '';
}

function timeAgo(timestamp: number, lang: string): string {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  if (m < 1) return lang === 'es' ? 'recién' : 'just now';
  if (m < 60) return lang === 'es' ? `hace ${m} min` : `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === 'es' ? `hace ${h} h` : `${h} h ago`;
  const d = Math.floor(h / 24);
  return lang === 'es' ? `hace ${d} d` : `${d} d ago`;
}

// ============ JOURNEY (modo guiado) ============
type JourneyStep = { toolId: string; reason: { es: string; en: string } };
const JOURNEY_PLANS: Record<string, JourneyStep[]> = {
  'brand-clarity': [
    { toolId: 'brand-story',         reason: { es: 'Tu historia y posicionamiento real son la base de todo lo demás', en: 'Your real story and positioning are the base of everything else' } },
    { toolId: 'foda-estrategico',    reason: { es: 'Una vez clara la voz, detectá fortalezas y diferenciales para amplificar', en: 'Once the voice is clear, detect strengths and differentials to amplify' } },
  ],
  'attract-customers': [
    { toolId: 'brand-story',         reason: { es: 'Primero definí cómo te presentás. Sin claridad no hay campaña que rinda', en: "First define how you present yourself. Without clarity no campaign performs" } },
    { toolId: 'foda-estrategico',    reason: { es: 'Mapeá oportunidades reales del mercado antes de invertir presupuesto', en: 'Map real market opportunities before investing budget' } },
    { toolId: 'paid-media-strategy', reason: { es: 'Activá adquisición con campañas estratégicas en Meta, Google y TikTok', en: 'Activate acquisition with strategic campaigns on Meta, Google and TikTok' } },
  ],
  'create-content': [
    { toolId: 'brand-story',         reason: { es: 'Tu voz y diferencial son la base del contenido que va a destacar', en: 'Your voice and differential are the foundation of content that stands out' } },
    { toolId: 'ideas-virales-1',     reason: { es: 'Generá ideas con potencial viral adaptadas a tu marca y plataforma', en: 'Generate viral ideas adapted to your brand and platform' } },
    { toolId: 'ideas-instagram',     reason: { es: 'Estrategia específica para Instagram con mix de formatos nativos', en: 'IG-specific strategy with native formats mix' } },
  ],
  'diagnose': [
    { toolId: 'foda-estrategico',    reason: { es: 'FODA + matriz CAME + plan de acción priorizado por impacto y esfuerzo', en: 'SWOT + CAME matrix + action plan prioritized by impact and effort' } },
    { toolId: 'brand-story',         reason: { es: 'Validá que tu mensaje se alinea con el diagnóstico estratégico', en: 'Validate your message aligns with the strategic diagnosis' } },
  ],
  'grow-social': [
    { toolId: 'ideas-instagram',     reason: { es: 'Empezá con una estrategia de cuenta IG sólida y mix de formatos', en: 'Start with a solid IG account strategy and format mix' } },
    { toolId: 'ideas-virales-1',     reason: { es: 'Sumá ideas para escalar a TikTok, Shorts y otras plataformas', en: 'Add ideas to scale to TikTok, Shorts and other platforms' } },
  ],
};

type SavedJourney = { schemaVersion: number; objective: string; tools: string[]; currentIndex: number; savedAt: number };
const JOURNEY_STORAGE_KEY = 'fshumo_journey';
const JOURNEY_SCHEMA_VERSION = 1;

function loadJourney(): SavedJourney | null {
  try {
    const raw = localStorage.getItem(JOURNEY_STORAGE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    if (j.schemaVersion !== JOURNEY_SCHEMA_VERSION) return null;
    return j;
  } catch { return null; }
}

function saveJourneyData(j: Omit<SavedJourney, 'schemaVersion' | 'savedAt'>) {
  try {
    localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify({ ...j, schemaVersion: JOURNEY_SCHEMA_VERSION, savedAt: Date.now() }));
  } catch {}
}

function deleteJourneyData() {
  try { localStorage.removeItem(JOURNEY_STORAGE_KEY); } catch {}
}

// ============ TIPS DE FABRISIO (banner contextual primera vez por tool) ============
const TOOL_TIPS: Record<string, { es: string; en: string }> = {
  'brand-story': {
    es: 'Tu voz es sagrada acá. Respondé como hablás, no como creés que "queda bien". Si una respuesta te suena genérica, refinala con detalles personales — ahí está la magia.',
    en: 'Your voice is sacred here. Answer how you talk, not how you think "sounds right". If an answer feels generic, refine it with personal details — that\'s where the magic is.',
  },
  'foda-estrategico': {
    es: 'Cuanto más concretas tus fortalezas y debilidades (con datos), más útil el plan. "Buena atención" no sirve; "4.8★ en 300 reseñas" sí.',
    en: 'The more concrete your strengths and weaknesses (with data), the more useful the plan. "Good service" is useless; "4.8★ in 300 reviews" works.',
  },
  'paid-media-strategy': {
    es: 'Si ya hacés ads, pegá métricas reales (ROAS, CPL, CTR). Si no, respondé "arranco de cero" — el output se adapta a tu situación.',
    en: 'If you already run ads, paste real metrics (ROAS, CPL, CTR). If not, answer "starting from scratch" — output adapts to your situation.',
  },
  'ideas-virales-1': {
    es: 'Cuanto más específico tu nicho y audiencia, más afiladas las ideas. Evitá descripciones genéricas tipo "gente que quiere mejorar".',
    en: 'The more specific your niche and audience, the sharper the ideas. Avoid generic descriptions like "people who want to improve".',
  },
  'ideas-instagram': {
    es: 'Si tenés posts viejos que funcionaron, pegá el dato (views, comentarios). Mejor detectar patrones tuyos que best-practices genéricas.',
    en: 'If you have old posts that worked, paste the data (views, comments). Better to detect your own patterns than generic best-practices.',
  },
};

const TIPS_SEEN_STORAGE_KEY = 'fshumo_tips_seen';

function loadTipsSeen(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(TIPS_SEEN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function markTipSeen(toolId: string) {
  try {
    const seen = loadTipsSeen();
    seen[toolId] = true;
    localStorage.setItem(TIPS_SEEN_STORAGE_KEY, JSON.stringify(seen));
  } catch {}
}

function resetTipsSeen() {
  try { localStorage.removeItem(TIPS_SEEN_STORAGE_KEY); } catch {}
}

function detectVague(key: string, value: any): string | null {
  if (!value || typeof value !== 'string') return null;
  const tr = value.trim();
  const n = tr.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if (CRITICAL_KEYS.has(key) && tr.length < 30) return 'La respuesta es muy corta. Necesitamos al menos un ejemplo concreto con datos para que el análisis tenga peso real.';
  const cliches = ['buena atencion','buena atención','atencion al cliente','atención al cliente','calidad','compromiso','profesionalismo','siempre me gusto','siempre me gustó','atencion personalizada','precio justo','mejor precio','somos los mejores','pasion por lo que hago','pasión por lo que hago','good service','quality','commitment','we are the best'];
  if (cliches.some(c => n.includes(c)) && tr.length < 80) return 'Esa respuesta es la que dan todos. ¿Qué hacés CONCRETAMENTE que la mayoría no hace? Dame un dato, un caso o una práctica que lo demuestre.';
  const weak = ['todo tipo de','mucha gente','depende','en general','normalmente','a veces','all kinds of','everyone','depends','in general'];
  if (CRITICAL_KEYS.has(key) && weak.some(w => n.includes(w)) && tr.length < 100) return 'Tu respuesta está siendo muy general. Sé más específico: ¿quién exactamente? ¿qué caso concreto? ¿qué números?';
  if ((key==='fodaMainStrength'||key==='bsAudience3') && !/\d/.test(tr) && tr.length < 120) return 'Tu respuesta no tiene números ni datos verificables. Agregale al menos un dato concreto para que sea defendible.';
  return null;
}

async function fetchSite(url: string) {
  let u = url.trim();
  if (!u.startsWith('http')) u = 'https://'+u;
  for (const fetchFn of [
    () => fetch(u, {mode:'cors'}),
    () => fetch(`https://corsproxy.io/?${encodeURIComponent(u)}`),
    () => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}`).then(r=>r.json()).then(d=>({ok:!!d.contents,text:()=>d.contents}))
  ]) {
    try { const r = await fetchFn(); if (r && r.ok) { const h = await r.text(); return cleanHtml(h); } } catch(e: any) {}
  }
  throw new Error('CORS_BLOCKED');
}

function cleanHtml(html: string) {
  let c = html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/<!--[\s\S]*?-->/g,'');
  const tm = c.match(/<title[^>]*>([^<]+)<\/title>/i);
  const dm = c.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  let t = c.replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  if (t.length>7000) t=t.substring(0,7000)+'...';
  return (tm?`TITLE: ${tm[1]}\n`:'')+(dm?`META: ${dm[1]}\n`:'')+`\nCONTENT:\n${t}`;
}

async function callClaude(accessPassword: string, messages: any[], sys: string) {
  const r = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Access-Password': accessPassword },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 4000, system: sys, messages })
  });
  if (!r.ok) {
    let errMsg = `Error ${r.status}`;
    try { const err = await r.json(); errMsg = err.error || errMsg; } catch {}
    throw new Error(errMsg);
  }
  const d = await r.json();
  return d.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
}

function buildPrompt(lang: string, data: any, mode: string, bizType: string, toolId: string) {
  const li = lang==='es'?'Hablás SIEMPRE en español rioplatense (vos/tenés/querés). Nunca tú/tienes.':'You ALWAYS speak in clear, professional English. No-BS tone.';
  const bi = bizType?`\nTIPO DE NEGOCIO: ${(BIZ_LABELS as any)[bizType]||bizType}. Adaptá terminología y métricas.`:'';
  const base = `Sos Fabrisio, consultor senior con +25 años de experiencia.\n${li}${bi}\n\nTu marca es "Fabrisio sin Humo" — datos, ejemplos concretos, resultados reales. Sin chamuyo.`;
  const ctx = `\n\nCONTEXTO DEL NEGOCIO:\n${Object.entries(data).filter(([,v])=>v&&v.toString().trim()).map(([k,v])=>`- ${k}: ${Array.isArray(v)?v.join(', '):v}`).join('\n')}`;

  if (toolId==='paid-media-strategy') {
    const pm = base+`\n\nEspecialista en Meta Ads, Google Ads y TikTok Ads. Aplicás Hormozi, Cialdini, Schwartz, Brunson.`;
    if (mode==='preload') return pm+`\n\nDevolvé SOLO un JSON válido: {"product","problem","differential","demographics","lifeSituation","desires","fears","mainPain","social":[],"case1","case2","case3","metrics"}. Sin markdown. Sin texto extra.`;
    if (mode==='help') return pm+`\n\nPreguntas guía cortas, UNA por turno.`;
    if (mode==='review') return pm+ctx+`\n\nRESUMEN EJECUTIVO máx 7 bullets. Markdown.`;
    if (mode==='pmBlock1') return pm+ctx+`\n\nBLOQUE 1 Markdown:\n# Estrategia General\n- Objetivo con KPI\n- KPIs satélite (3-5)\n- Posicionamiento\n- Oferta (Hormozi en tabla)\n- Stack de valor\n- Nivel Schwartz + tipo de copy\n- Ángulo principal + 2-3 secundarios\n# Funnel\n- TOFU/MOFU/BOFU con %\n- Hook→Story→Offer`;
    if (mode==='pmBlock2') return pm+ctx+`\n\nBLOQUE 2 Markdown:\n# Campañas (por plataforma)\n# Segmentación (intereses, lookalikes, exclusiones)\n# Retargeting por olas (tabla 3 olas)\n# Presupuesto (3 escenarios low/mid/high, regla 70/20/10)`;
    if (mode==='pmBlock3') return pm+ctx+`\n\nBLOQUE 3 Markdown:\n# Creatividades (5 hooks, tipos, 2 scripts)\n# Copywriting (5 headlines Schwartz, 3 CTAs, PAS/AIDA, gatillos Cialdini, top 3 objeciones)\n# Testing (3 A/B con hipótesis)\n# Optimización (KPIs, umbrales)\n# Recomendaciones Extra`;
    if (mode==='refine') return pm+ctx+`\n\nDevolvé bloque ACTUALIZADO completo en Markdown.`;
  }

  if (toolId==='foda-estrategico') {
    const foda = base+`\n\nConsultor estratégico FODA + CAME + priorización impacto-esfuerzo. NUNCA entregás FODA sin CAME. Detectás patrones cruzados. No inventás datos.`;
    if (mode==='help') return foda+`\n\nPreguntas guía, UNA por turno. Si respuesta vaga, pedí especificidad.`;
    if (mode==='review') return foda+ctx+`\n\nRESUMEN máx 6 bullets + veredicto del consultor. Markdown.`;
    if (mode==='fodaSynthesis') return foda+ctx+`\n\nBLOQUE 1 Markdown:\n# Síntesis Estratégica (3-5 oraciones, veredicto, patrones cruzados)\n# FODA Detallado\n## ✅ Fortalezas (4-6 ítems específicos)\n## ⚠️ Debilidades (4-6 honestas)\n## 🎯 Oportunidades (4-6 EXTERNAS)\n## 🚨 Amenazas (4-6)\n## ⚡ Observaciones del consultor (si hay contradicciones)`;
    if (mode==='fodaCAME') return foda+ctx+`\n\nBLOQUE 2 Markdown:\n# Matriz CAME / TOWS\nPara cada cuadrante: 2-4 estrategias específicas con cruce explícito (ej: F2+O3 →...).\n## 🟢 OFENSIVAS (F+O) — capturar mercado\n## 🟡 DEFENSIVAS (F+A) — proteger posición\n## 🟠 REORIENTACIÓN (D+O) — corregir para crecer\n## 🔴 SUPERVIVENCIA (D+A) — proteger vulnerable`;
    if (mode==='fodaActionPlan') return foda+ctx+`\n\nBLOQUE 3 Markdown:\n# Priorización Impacto vs Esfuerzo\n## 🟢 Quick Wins (alto impacto/bajo esfuerzo)\n## 🟠 Grandes Apuestas (alto/alto)\n## 🟡 Fill-ins (bajo/bajo)\n## 🔴 Descartadas (justificar)\n# Plan de Acción\n## 🔴 Inmediatas (2-4sem): qué/quién/cuándo/métrica\n## 🟠 Mediano plazo (1-6m): hitos 3m y 6m\n## 🟢 Estratégicas (6-18m): visión/condiciones/KPI\n# Riesgos a Monitorear (3-5 indicadores)`;
    if (mode==='refine') return foda+ctx+`\n\nDevolvé bloque ACTUALIZADO en Markdown.`;
  }

  if (toolId==='brand-story') {
    const bs = base+`\n\nConsultor en marca personal y storytelling comercial. VOZ DEL USUARIO ES SAGRADA — nunca reformulés, resumás o reinterpretés sus respuestas. Solo corregís typos. Detectás diferencial real (no declarado). No inventás.`;
    if (mode==='help') return bs+`\n\nSi respuesta vaga/cliché, pedí especificidad. Si bloqueado, ofrecé 2-3 ejemplos.`;
    if (mode==='review') return bs+ctx+`\n\nRESUMEN máx 6 bullets: identificación, inicio+transformación, oferta, diferencial REAL detectado, audiencia. Cerrá con frase sobre material narrativo.`;
    if (mode==='bsLiteralDoc') return bs+ctx+`\n\nDOCUMENTO LITERAL en Markdown. REGLA CRÍTICA: Preservá la voz EXACTA. NO reformules. Solo corregís typos obvios.\n\n# Brand Story\n\n## 1. Origen y Punto de Partida\n**[Pregunta textual]**\n> [Respuesta EXACTA como blockquote]\n(etc para las 6 secciones)\n\nSi falta respuesta: *"[Falta respuesta]"*. NO agregues comentarios propios.`;
    if (mode==='bsStrategicReading') return bs+ctx+`\n\nLECTURA ESTRATÉGICA en Markdown (interpretativa, ojo de consultor):\n# 🎯 Lectura Estratégica\n## 1. Posicionamiento detectado (3-5 oraciones)\n## 2. Diferencial real vs declarado\n## 3. Elementos narrativos clave (3-6)\n## 4. Ángulos para ventas (3-5)\n## 5. Hooks para contenido (3-5)\n## 6. Lo que afilaría (1-3)\n## 7. Sugerencias 30 días (3-5 acciones)`;
    if (mode==='refine') return bs+ctx+`\n\nSi es doc literal: NO cambies respuestas, solo formato. Si es lectura estratégica: incorporá ajustes.`;
  }

  if (toolId==='ideas-virales-1') {
    const vir = base+`\n\nEspecialista en contenido viral con conocimiento profundo del algoritmo de Instagram, TikTok y YouTube Shorts.\n\nFILOSOFÍA NO NEGOCIABLE:\n1. Ideas CONCRETAS no vagas. Cada idea tiene hook, estructura y porqué.\n2. Hook fuerte (primeros 3 segundos): pregunta provocadora, dato contraintuitivo, contradicción, demostración visual.\n3. Estructura clara: 3-5 puntos máximo, ritmo rápido.\n4. NUNCA copiar clichés del nicho ("3 errores que..." cuando ya lo dijeron 100 cuentas). Buscar ángulos frescos.\n5. Justificar por qué cada idea podría viralizar (qué patrón explota, qué emoción dispara).\n6. Si el usuario tiene posts que funcionaron, USAR esos patrones como base.`;
    if (mode==='help') return vir+`\n\nUNA pregunta guía por turno. Si la respuesta es genérica, pedí ejemplos concretos.`;
    if (mode==='review') return vir+ctx+`\n\nRESUMEN EJECUTIVO en Markdown máx 5 bullets: nicho/cuenta, audiencia, plataforma + frecuencia, tono detectado, ángulo o patrón si lo hay. Cerrá con UNA frase del consultor sobre qué oportunidad ves para viralizar.`;
    if (mode==='viralIdeasList') return vir+ctx+`\n\nGenerá BLOQUE 1 en Markdown:\n# 🔥 10-15 Ideas Virales\n\nPara cada idea (numerada del 1 al 10-15):\n## [Número]. [Título corto de la idea]\n**Hook (primeros 3s):** [frase exacta o pregunta exacta para abrir]\n**Estructura:** [3-5 bullets con qué pasa en cada momento]\n**Por qué podría funcionar:** [1-2 oraciones: qué patrón de viralidad explota, qué emoción dispara]\n**Formato:** [Reel / Carrusel / Short / etc — coherente con la plataforma elegida]\n\nAl final agregá:\n## ⚡ Tres ideas con MÁS potencial\nIndicá cuáles 3 priorizarías y por qué.`;
    if (mode==='viralCalendar') return vir+ctx+`\n\nGenerá BLOQUE 2 en Markdown:\n# 📅 Calendario de Publicación (4 semanas)\n\nUsá la frecuencia elegida por el usuario para definir cuántos posts por semana. Distribuí las ideas del Bloque 1 a lo largo de 4 semanas en una tabla:\n\n| Semana | Día | Idea (referencia # del Bloque 1) | Formato | Best time |\n|---|---|---|---|---|\n| 1 | Lunes | #3 | Reel | 18-20hs |\n| ... | ... | ... | ... | ... |\n\nDespués agregá:\n## 🎯 Mix recomendado\n- % educativo vs entretenimiento vs vende\n- Por qué este mix para esta audiencia\n## ⏰ Tips de timing\n- Mejores horarios para esta plataforma + zona horaria de Argentina (asumir UTC-3 si no se aclara)\n- Días fuertes vs días flojos\n## 📈 Qué medir\n- 3-5 métricas concretas para evaluar viralización en las primeras 24-48hs.`;
    if (mode==='refine') return vir+ctx+`\n\nDevolvé el bloque ACTUALIZADO en Markdown incorporando el ajuste del usuario. Mantené la estructura.`;
  }

  if (toolId==='ideas-instagram') {
    const ig = base+`\n\nEspecialista en estrategia de Instagram con conocimiento profundo del algoritmo 2026 y formatos nativos (Reels, Carruseles, Stories, Lives, posts de feed).\n\nFILOSOFÍA NO NEGOCIABLE:\n1. Ideas ESPECÍFICAS para esta cuenta — NO genéricas tipo "5 tips de [nicho]". Buscar ángulos propios.\n2. Adaptar al tamaño de cuenta: cuentas chicas (<10k) priorizar discovery (Reels educativos + carruseles cortos). Cuentas medianas/grandes priorizar retención y comunidad (Lives, series, contenido más profundo).\n3. Cada idea coherente con el formato nativo elegido: Reels = hook + cambio rápido + payoff; Carruseles = primer slide gancho + slides con valor + último slide CTA; Stories = pregunta o sticker; Lives = tema concreto + invitado o solo; Feed = imagen fuerte + caption profundo.\n4. NUNCA proponer clichés del nicho ("3 errores que cometés con X" cuando ya lo dijeron 100 cuentas).\n5. CTA realista por formato (Reels: "guardalo y comentá", Stories: "respondé con un emoji", Lives: "venite con tu pregunta").`;
    if (mode==='help') return ig+`\n\nUNA pregunta guía por turno. Si la respuesta es vaga, pedí concreto.`;
    if (mode==='review') return ig+ctx+`\n\nRESUMEN EJECUTIVO en Markdown máx 5 bullets: cuenta (qué es), seguidor ideal, tamaño actual + objetivo de etapa, formatos elegidos, estética detectada. Cerrá con UNA frase del consultor: qué oportunidad ves para esta cuenta específica.`;
    if (mode==='igIdeasList') return ig+ctx+`\n\nGenerá BLOQUE 1 en Markdown:\n# 📱 15 Ideas de Contenido\n\nDistribuir las 15 ideas según el mix de formatos elegido (ej. si pidió Reels+Carruseles, ~7 Reels + ~8 Carruseles; si pidió Mix balanceado, distribuir entre los 5 formatos principales).\n\nPara cada idea (numerada 1 al 15):\n## [#]. [Título corto] · *[Formato]*\n**Hook (3 primeros segundos / primer slide):** [texto exacto]\n**Estructura:** [3-5 bullets con qué pasa en cada momento, adaptado al formato]\n**Por qué funciona para esta cuenta:** [1-2 oraciones específicas a su nicho y tamaño]\n**CTA sugerido:** [acción concreta]\n\nAl final agregá:\n## ⚡ Top 3 ideas para empezar\nElegir las 3 con mayor probabilidad de funcionar para el objetivo declarado y por qué.`;
    if (mode==='igStrategy') return ig+ctx+`\n\nGenerá BLOQUE 2 en Markdown:\n# 🎯 Estrategia de Cuenta\n\n## Mix recomendado de formatos\nTabla con % aproximado de cada formato según el objetivo y tamaño:\n| Formato | % semanal | Por qué |\n|---|---|---|\n\n## Ritmo de publicación\n- Frecuencia ideal según el tamaño actual\n- Por qué ese ritmo y no más/menos\n- Cuándo del día publicar (horarios fuertes para esta audiencia, asumir UTC-3 si no se aclara)\n\n## 3 hooks recurrentes (templates)\nFórmulas concretas que puede REUSAR cambiando el contenido. Ejemplo:\n- *"[Cosa que parece obvia] en realidad es [contradicción]. Mirá esto..."*\n\n## Qué evitar para no caer en cliché del nicho\n3-5 trampas comunes en el nicho del usuario y cómo diferenciarse.\n\n## Métricas a mirar las primeras 2 semanas\n3-5 indicadores concretos para evaluar si la estrategia funciona (no solo views/likes — engagement rate, saves, shares, perfil visits, etc.).`;
    if (mode==='refine') return ig+ctx+`\n\nDevolvé el bloque ACTUALIZADO en Markdown incorporando el ajuste del usuario. Mantené la estructura.`;
  }

  return base;
}

function MdRender({text}: {text: string}) {
  if (!text) return null;
  const lines = text.split('\n');
  const els: any[] = [];
  let inTable=false, tableRows: string[]=[], listItems: string[]=[];
  const pi = (t: string) => t.replace(/\*\*(.+?)\*\*/g,'<strong class="text-white font-semibold">$1</strong>').replace(/\*(.+?)\*/g,'<em class="text-zinc-200">$1</em>').replace(/`(.+?)`/g,'<code class="bg-zinc-800 text-yellow-300 px-1 py-0.5 rounded text-xs">$1</code>');
  const fl = () => { if (listItems.length>0) { els.push(<ul key={`l${els.length}`} className="space-y-2 my-3">{listItems.map((it,i)=><li key={i} className="flex gap-3 text-zinc-300"><span className="text-yellow-400 mt-1.5 flex-shrink-0">▸</span><span dangerouslySetInnerHTML={{__html:pi(it)}}/></li>)}</ul>); listItems=[]; }};
  const ft = () => { if (tableRows.length>0) { const [hdr,,...body]=tableRows; els.push(<div key={`t${els.length}`} className="my-4 overflow-x-auto"><table className="w-full text-sm border border-zinc-800 rounded-lg overflow-hidden"><thead className="bg-zinc-900/80"><tr>{hdr.split('|').slice(1,-1).map((h: string,i: number)=><th key={i} className="px-3 py-2 text-left font-semibold text-yellow-400 border-b border-zinc-800">{h.trim()}</th>)}</tr></thead><tbody>{body.map((row,ri)=><tr key={ri} className="border-b border-zinc-800/60 last:border-0">{row.split('|').slice(1,-1).map((c: string,i: number)=><td key={i} className="px-3 py-2 text-zinc-300" dangerouslySetInnerHTML={{__html:pi(c.trim())}}/>)}</tr>)}</tbody></table></div>); tableRows=[]; }};
  lines.forEach((line: string,idx: number)=>{
    if (line.startsWith('|')&&line.endsWith('|')) { fl(); inTable=true; tableRows.push(line); return; }
    else if (inTable) { ft(); inTable=false; }
    if (line.startsWith('# ')) { fl(); els.push(<h1 key={idx} className="text-2xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>); }
    else if (line.startsWith('## ')) { fl(); els.push(<h2 key={idx} className="text-xl font-bold text-yellow-400 mt-5 mb-2">{line.slice(3)}</h2>); }
    else if (line.startsWith('### ')) { fl(); els.push(<h3 key={idx} className="text-lg font-semibold text-zinc-100 mt-4 mb-2">{line.slice(4)}</h3>); }
    else if (line.startsWith('> ')) { fl(); els.push(<blockquote key={idx} className="border-l-4 border-yellow-400 bg-yellow-400/5 pl-4 py-2 my-3 italic text-zinc-200">{pi(line.slice(2))}</blockquote>); }
    else if (line.match(/^[-*]\s/)) listItems.push(line.replace(/^[-*]\s/,''));
    else if (line.match(/^\d+\.\s/)) listItems.push(line.replace(/^\d+\.\s/,''));
    else if (line.trim()==='') fl();
    else { fl(); els.push(<p key={idx} className="text-zinc-300 leading-relaxed my-2" dangerouslySetInnerHTML={{__html:pi(line)}}/>); }
  });
  fl(); ft();
  return <div className="space-y-1">{els}</div>;
}

function ToolIllustration({illustrationId,isLocked}: {illustrationId: string; isLocked?: boolean}) {
  const gold=isLocked?'#52525b':'#facc15', dim=isLocked?'#3f3f46':'#eab308', dark='#0a0a0b';
  const svgs = {
    'paid-media':(<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><rect x="30" y="65" width="14" height="20" fill={dim} opacity="0.5" rx="1"/><rect x="50" y="55" width="14" height="30" fill={dim} opacity="0.65" rx="1"/><rect x="70" y="42" width="14" height="43" fill={dim} opacity="0.8" rx="1"/><rect x="90" y="30" width="14" height="55" fill={gold} rx="1"/><rect x="110" y="20" width="14" height="65" fill={gold} rx="1"/><circle cx="155" cy="35" r="18" fill="none" stroke={gold} strokeWidth="1" opacity="0.3"/><circle cx="155" cy="35" r="12" fill="none" stroke={gold} strokeWidth="1" opacity="0.5"/><circle cx="155" cy="35" r="6" fill="none" stroke={gold} strokeWidth="1.5"/><circle cx="155" cy="35" r="2.5" fill={gold}/></svg>),
    'swot-analysis':(<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><rect x="35" y="15" width="60" height="35" fill={gold} opacity="0.18" rx="3"/><rect x="105" y="15" width="60" height="35" fill={gold} opacity="0.1" rx="3"/><rect x="35" y="55" width="60" height="35" fill={gold} opacity="0.1" rx="3"/><rect x="105" y="55" width="60" height="35" fill={gold} opacity="0.18" rx="3"/><text x="65" y="35" fontSize="9" fontWeight="bold" fill={gold} textAnchor="middle">F</text><text x="135" y="35" fontSize="9" fontWeight="bold" fill={gold} textAnchor="middle" opacity="0.7">O</text><text x="65" y="76" fontSize="9" fontWeight="bold" fill={gold} textAnchor="middle" opacity="0.7">D</text><text x="135" y="76" fontSize="9" fontWeight="bold" fill={gold} textAnchor="middle">A</text><line x1="100" y1="15" x2="100" y2="90" stroke={gold} strokeWidth="0.8" opacity="0.5"/><line x1="35" y1="52.5" x2="165" y2="52.5" stroke={gold} strokeWidth="0.8" opacity="0.5"/></svg>),
    'brand-story':(<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><path d="M40 50 Q 70 25, 100 50 T 160 50" stroke={gold} strokeWidth="2" fill="none" opacity="0.8"/><circle cx="40" cy="50" r="5" fill={gold}/><circle cx="70" cy="32" r="4" fill={gold} opacity="0.7"/><circle cx="100" cy="50" r="4" fill={gold} opacity="0.7"/><circle cx="130" cy="68" r="4" fill={gold} opacity="0.7"/><circle cx="160" cy="50" r="5" fill={gold}/></svg>),
    'viral':(<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><circle cx="100" cy="50" r="8" fill={gold}/><circle cx="100" cy="50" r="18" fill="none" stroke={gold} strokeWidth="1" opacity="0.6"/><circle cx="100" cy="50" r="30" fill="none" stroke={gold} strokeWidth="0.7" opacity="0.35"/><circle cx="60" cy="30" r="3" fill={gold} opacity="0.7"/><circle cx="145" cy="25" r="2.5" fill={gold} opacity="0.6"/><circle cx="155" cy="65" r="3" fill={gold} opacity="0.7"/><circle cx="50" cy="75" r="2.5" fill={gold} opacity="0.6"/><line x1="100" y1="50" x2="60" y2="30" stroke={gold} strokeWidth="0.5" opacity="0.4"/><line x1="100" y1="50" x2="145" y2="25" stroke={gold} strokeWidth="0.5" opacity="0.4"/><line x1="100" y1="50" x2="155" y2="65" stroke={gold} strokeWidth="0.5" opacity="0.4"/><line x1="100" y1="50" x2="50" y2="75" stroke={gold} strokeWidth="0.5" opacity="0.4"/></svg>),
    'instagram':(<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><rect x="55" y="22" width="90" height="56" rx="14" fill="none" stroke={gold} strokeWidth="2"/><circle cx="100" cy="50" r="14" fill="none" stroke={gold} strokeWidth="2"/><circle cx="100" cy="50" r="6" fill={gold}/><circle cx="132" cy="32" r="2.5" fill={gold}/></svg>),
    'hero':(<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><circle cx="40" cy="65" r="6" fill={gold} opacity="0.4"/><path d="M40 65 Q 60 30, 100 50 T 160 35" stroke={gold} strokeWidth="2" fill="none"/><polygon points="155,30 168,35 155,40" fill={gold}/></svg>),
    'video':(<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><rect x="50" y="20" width="100" height="60" rx="4" fill="none" stroke={gold} strokeWidth="1.5"/><line x1="60" y1="40" x2="120" y2="40" stroke={gold} strokeWidth="1" opacity="0.6"/><line x1="60" y1="50" x2="135" y2="50" stroke={gold} strokeWidth="1" opacity="0.6"/><line x1="60" y1="60" x2="110" y2="60" stroke={gold} strokeWidth="1" opacity="0.6"/><polygon points="135,42 145,48 135,54" fill={gold}/></svg>),
    'reel':(<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><rect x="75" y="15" width="50" height="70" rx="4" fill="none" stroke={gold} strokeWidth="1.5"/><circle cx="100" cy="50" r="14" fill={gold} opacity="0.2"/><polygon points="95,42 95,58 110,50" fill={gold}/></svg>),
    'ai-video':(<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><rect x="50" y="25" width="100" height="50" rx="4" fill="none" stroke={gold} strokeWidth="1.5"/><polygon points="92,40 92,60 112,50" fill={gold}/><text x="100" y="86" fontSize="8" fill={gold} textAnchor="middle" fontWeight="bold">AI</text></svg>),
    'growth':(<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full"><rect x="30" y="75" width="22" height="12" fill={dim} opacity="0.4" rx="1"/><rect x="52" y="63" width="22" height="24" fill={dim} opacity="0.55" rx="1"/><rect x="74" y="51" width="22" height="36" fill={dim} opacity="0.7" rx="1"/><rect x="96" y="39" width="22" height="48" fill={gold} opacity="0.85" rx="1"/><rect x="118" y="27" width="22" height="60" fill={gold} rx="1"/><path d="M155 35 L168 22 L168 30 L175 25 L172 35 L180 38 L168 41 L168 49 Z" fill={gold}/></svg>)
  };
  return <div className="w-full h-full flex items-center justify-center">{(svgs as any)[illustrationId]||<svg viewBox="0 0 200 100" className="w-full h-full"><rect x="80" y="35" width="40" height="30" fill={gold} opacity="0.3" rx="3"/></svg>}</div>;
}

export default function App() {
  const [lang, setLang] = useState('es');
  const [screen, setScreen] = useState('landing');
  const [accessPassword, setAccessPassword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [bizType, setBizType] = useState('');
  const [toolId, setToolId] = useState('');
  const [toolProfile, setToolProfile] = useState('');
  const [entryMode, setEntryMode] = useState('');
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<Record<string, any>>({});
  const [autoFilled, setAutoFilled] = useState<Record<string, boolean>>({});
  const [skipPhase, setSkipPhase] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<{role: string; content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [curBlock, setCurBlock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refineMode, setRefineMode] = useState<any>(null);
  const [refineInput, setRefineInput] = useState('');
  const [preloadUrl, setPreloadUrl] = useState('');
  const [preloadSocial, setPreloadSocial] = useState('');
  const [preloadStatus, setPreloadStatus] = useState('');
  const [vagueWarning, setVagueWarning] = useState<string | null>(null);
  const [vagueOverride, setVagueOverride] = useState<Record<string, boolean>>({});
  const [toolSearch, setToolSearch] = useState('');
  const [toolCatFilter, setToolCatFilter] = useState('');
  const [profileFilled, setProfileFilled] = useState<Record<string, boolean>>({});
  const [myProfileDraft, setMyProfileDraft] = useState<Record<string, string>>({});
  const [myProfileSaved, setMyProfileSaved] = useState(false);
  const [myProfileDeleteAsk, setMyProfileDeleteAsk] = useState(false);
  const [journey, setJourney] = useState<SavedJourney | null>(null);
  const [journeyDraftObjective, setJourneyDraftObjective] = useState<string>('');
  const [journeyAbandonAsk, setJourneyAbandonAsk] = useState(false);
  const [tipsSeen, setTipsSeen] = useState<Record<string, boolean>>({});

  const lng = (t as any)[lang];
  const currentTool = (TOOLS as any)[toolId];

  useEffect(() => {
    const saved = sessionStorage.getItem('fshumo_pw');
    if (saved) setAccessPassword(saved);
    setJourney(loadJourney());
    setTipsSeen(loadTipsSeen());
  }, []);

  const dismissTip = (id: string) => {
    markTipSeen(id);
    setTipsSeen(prev => ({ ...prev, [id]: true }));
  };

  const resetAllTips = () => {
    resetTipsSeen();
    setTipsSeen({});
  };

  // Auto-save de la sesión activa: cada cambio relevante persiste a localStorage
  useEffect(() => {
    if (!toolId) return;
    if (!['wizard','review','output','final'].includes(screen)) return;
    saveSessionData(toolId, {
      data, reviewText, outputs, curBlock, stepIdx, screen,
      entryMode, toolProfile, skipPhase, autoFilled, profileFilled, vagueOverride,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId, screen, stepIdx, curBlock, data, reviewText, outputs, entryMode, toolProfile, skipPhase, autoFilled, profileFilled, vagueOverride]);

  const getQ = (key: string) => {
    if (toolId==='brand-story' && toolProfile) {
      const bq = (BIZ_Q as any)[lang];
      if (bq[key]) return bq[key];
    }
    return (BIZ_Q as any)[lang]?.[key] || {title:key,desc:'',placeholder:''};
  };

  const getToolName = (id: string) => (TOOLS as any)[id]?.name[lang] || (LOCKED_NAMES as any)[id]?.[lang]?.name || id;
  const getToolDesc = (id: string) => (TOOLS as any)[id]?.description[lang] || (LOCKED_NAMES as any)[id]?.[lang]?.desc || '';

  const skippablePhase = currentTool?.questions?.find((q: any)=>q.skippable)?.phase;
  const visibleFlow = currentTool ? (skipPhase && skippablePhase ? currentTool.questions.filter((q: any)=>q.phase!==skippablePhase) : currentTool.questions) : [];
  const curStep = visibleFlow[stepIdx];

  const handleStart = () => { setError(''); if (!accessPassword) setScreen('apikey'); else setScreen('biztype'); };
  const handleLogin = () => {
    if (!passwordInput.trim()) return;
    setError('');
    setAccessPassword(passwordInput.trim());
    sessionStorage.setItem('fshumo_pw', passwordInput.trim());
    setPasswordInput('');
    setScreen('biztype');
  };
  const pickBiz = (t: string) => { setBizType(t); setScreen('toolbox'); };

  const startToolFresh = (id: string) => {
    const { values, filledKeys } = getProfilePrefill(id);
    setData(values);
    setProfileFilled(filledKeys);
    setAutoFilled({});
    setReviewText('');
    setOutputs({});
    setCurBlock(0);
    setStepIdx(0);
    setSkipPhase(false);
    setVagueWarning(null);
    setVagueOverride({});
    const tool = (TOOLS as any)[id];
    if (tool.requiresProfile) { setScreen('profile'); return; }
    if (tool.entryModes.length > 1) { setScreen('entry'); return; }
    setEntryMode(tool.entryModes[0]);
    if (tool.entryModes[0]==='preload') setScreen('preload');
    else { setScreen('wizard'); }
  };

  const pickTool = (id: string) => {
    if (!(TOOLS as any)[id]) return;
    setToolId(id); setError('');
    // ¿Hay sesión guardada para esta tool? Si sí, mostrar pantalla intermedia.
    const saved = loadSession(id);
    if (saved) {
      setScreen('continueSession');
      return;
    }
    // Sin sesión guardada: flujo normal
    startToolFresh(id);
  };

  const continueSavedSession = () => {
    const s = loadSession(toolId);
    if (!s) { backToToolbox(); return; }
    setData(s.data || {});
    setReviewText(s.reviewText || '');
    setOutputs(s.outputs || {});
    setCurBlock(s.curBlock || 0);
    setStepIdx(s.stepIdx || 0);
    setEntryMode(s.entryMode || '');
    setToolProfile(s.toolProfile || '');
    setSkipPhase(s.skipPhase || false);
    setAutoFilled(s.autoFilled || {});
    setProfileFilled(s.profileFilled || {});
    setVagueOverride(s.vagueOverride || {});
    setScreen(s.screen || 'wizard');
  };

  const startFreshSession = () => {
    deleteSessionData(toolId);
    startToolFresh(toolId);
  };

  const pickProfile = (pid: string) => {
    setToolProfile(pid);
    const tool = (TOOLS as any)[toolId];
    if (tool.entryModes.length > 1) { setScreen('entry'); return; }
    setEntryMode('guided'); setStepIdx(0); setScreen('wizard');
  };

  const pickEntry = (mode: string) => {
    setEntryMode(mode);
    if (mode==='preload') setScreen('preload');
    else { setStepIdx(0); setScreen('wizard'); }
  };

  const handleAnalyzePreload = async () => {
    if (!preloadUrl.trim() && !preloadSocial.trim()) { setError(lang==='es'?'Pegá una URL o contenido de redes para analizar.':'Paste a URL or social content.'); return; }
    setError('');
    let webContent = '';
    if (preloadUrl.trim()) {
      setPreloadStatus('fetching');
      try { webContent = await fetchSite(preloadUrl); }
      catch(e: any) {
        if (e.message==='CORS_BLOCKED') { setPreloadStatus('fetch_failed'); if (!preloadSocial.trim()) { setError(lng.preloadFailed); setPreloadStatus(''); return; } }
        else { setError(e.message); setPreloadStatus(''); return; }
      }
    }
    setPreloadStatus('analyzing');
    try {
      const combined = [webContent?`=== SITIO (${preloadUrl}) ===\n${webContent}`:'', preloadSocial.trim()?`=== REDES ===\n${preloadSocial.trim()}`:''].filter(Boolean).join('\n\n');
      const result = await callClaude(accessPassword, [{role:'user',content:combined}], buildPrompt(lang,{},'preload',bizType,toolId));
      let cleaned = result.trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();
      const parsed = JSON.parse(cleaned);
      const nd={...data}, nf={...autoFilled};
      Object.entries(parsed as Record<string, any>).forEach(([k,v])=>{ if (v&&(Array.isArray(v)?v.length>0:v.toString().trim())) { nd[k]=v; nf[k]=true; } });
      setData(nd); setAutoFilled(nf); setPreloadStatus('done');
      setTimeout(()=>{ setStepIdx(0); setScreen('wizard'); }, 1500);
    } catch(e: any) { setError(`${lng.error}: ${e.message}`); setPreloadStatus(''); }
  };

  const handleSkipPreload = () => { setError(''); setStepIdx(0); setScreen('wizard'); };
  const clearField = (key: string) => { const nd={...data},nf={...autoFilled},pf={...profileFilled}; delete nd[key]; delete nf[key]; delete pf[key]; setData(nd); setAutoFilled(nf); setProfileFilled(pf); };

  const handleNext = () => {
    if (curStep && !vagueOverride[curStep.key] && curStep.type==='textarea') {
      const w = detectVague(curStep.key, data[curStep.key]);
      if (w) { setVagueWarning(w); return; }
    }
    if (curStep) pushToProfile(toolId, curStep.key, data[curStep.key]);
    if (stepIdx < visibleFlow.length-1) setStepIdx(stepIdx+1);
    else genReview();
  };
  const handleBack = () => { if (stepIdx>0) setStepIdx(stepIdx-1); else backToToolbox(); };
  const handleSkipSection = () => { setSkipPhase(true); genReview(); };
  const acceptVague = () => { if (curStep) pushToProfile(toolId, curStep.key, data[curStep.key]); setVagueOverride(p=>({...p,[curStep.key]:true})); setVagueWarning(null); if (stepIdx<visibleFlow.length-1) setStepIdx(stepIdx+1); else genReview(); };
  const refineVague = () => setVagueWarning(null);

  const genReview = async () => {
    setScreen('review'); setLoading(true); setError('');
    try { const r = await callClaude(accessPassword,[{role:'user',content:lang==='es'?'Generá el resumen ejecutivo.':'Generate the executive summary.'}],buildPrompt(lang,data,'review',bizType,toolId)); setReviewText(r); }
    catch(e: any) { setError(e.message); }
    setLoading(false);
  };

  const genBlock = async (bi: number) => {
    if (!currentTool) return;
    const block = currentTool.outputBlocks[bi];
    setLoading(true); setError('');
    try { const r = await callClaude(accessPassword,[{role:'user',content:lang==='es'?`Generá ${block.id}.`:`Generate ${block.id}.`}],buildPrompt(lang,data,block.id,bizType,toolId)); setOutputs(p=>({...p,[block.id]:r})); }
    catch(e: any) { setError(e.message); }
    setLoading(false);
  };

  const approveBlock = async (bi: number) => { const next=bi+1; if (next>=currentTool.outputBlocks.length) setScreen('final'); else { setCurBlock(next); await genBlock(next); } };

  const handleRefine = async (bi: number) => {
    if (!refineInput.trim()) return;
    const block = currentTool.outputBlocks[bi];
    setLoading(true); setError('');
    try { const r = await callClaude(accessPassword,[{role:'user',content:`Bloque actual:\n\n${outputs[block.id]}\n\nAjuste: ${refineInput}\n\nDevolvé el bloque actualizado.`}],buildPrompt(lang,data,'refine',bizType,toolId)); setOutputs(p=>({...p,[block.id]:r})); setRefineMode(null); setRefineInput(''); }
    catch(e: any) { setError(e.message); }
    setLoading(false);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const msgs = [...chatMsgs,{role:'user',content:chatInput}];
    setChatMsgs(msgs); setChatInput(''); setChatLoading(true);
    try {
      const q = getQ(curStep?.key||'');
      const r = await callClaude(accessPassword, msgs.concat([{role:'user',content:lang==='es'?`Contexto: "${q.title}". Ayudame, UNA pregunta por turno.`:`Context: "${q.title}". Help me, ONE question per turn.`}]), buildPrompt(lang,data,'help',bizType,toolId));
      setChatMsgs([...msgs,{role:'assistant',content:r}]);
    } catch(e: any) { setChatMsgs([...msgs,{role:'assistant',content:`Error: ${e.message}`}]); }
    setChatLoading(false);
  };

  const exportMd = () => {
    try {
      const name = getToolName(toolId);
      let md = `# ${lng.appName} — ${name}\n\n## ${lng.exec}\n\n${reviewText||''}\n\n`;
      currentTool.outputBlocks.forEach((b: any)=>{ md+=`---\n\n## ${b.title[lang]||b.title.es}\n\n${outputs[b.id]||''}\n\n`; });
      md += `---\n\n*${lang==='es'?'Generado con Fabrisio sin Humo':'Generated with Fabrisio sin Humo'}*\n`;
      const blob = new Blob([md],{type:'text/markdown;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`${toolId}-${Date.now()}.md`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url),100);
    } catch(e: any) { setError(`Export error: ${e.message}`); }
  };

  const exportHtml = (editorial=false) => {
    try {
      const md2html = (text: string) => {
        if (!text) return '';
        const lines = text.split('\n'); const html: string[] = []; let inList=false, inTable=false, tableRows: string[]=[];
        const pi = (t: string) => t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+?)\*/g,'<em>$1</em>').replace(/`(.+?)`/g,'<code>$1</code>');
        const fl = ()=>{ if(inList){html.push('</ul>');inList=false;} };
        const ft = ()=>{ if(tableRows.length>0){ const [h,,...b]=tableRows; html.push('<table><thead><tr>'); h.split('|').slice(1,-1).forEach((hd: string)=>html.push(`<th>${hd.trim()}</th>`)); html.push('</tr></thead><tbody>'); b.forEach((row: string)=>{html.push('<tr>');row.split('|').slice(1,-1).forEach((c: string)=>html.push(`<td>${pi(c.trim())}</td>`));html.push('</tr>');}); html.push('</tbody></table>'); tableRows=[]; inTable=false; }};
        lines.forEach((line: string)=>{
          if(line.startsWith('|')&&line.endsWith('|')){fl();inTable=true;tableRows.push(line);return;}
          else if(inTable) ft();
          if(line.startsWith('# ')){fl();html.push(`<h1>${pi(line.slice(2))}</h1>`);}
          else if(line.startsWith('## ')){fl();html.push(`<h2>${pi(line.slice(3))}</h2>`);}
          else if(line.startsWith('### ')){fl();html.push(`<h3>${pi(line.slice(4))}</h3>`);}
          else if(line.startsWith('> ')){fl();html.push(`<blockquote>${pi(line.slice(2))}</blockquote>`);}
          else if(line.match(/^[-*]\s/)){if(!inList){html.push('<ul>');inList=true;}html.push(`<li>${pi(line.replace(/^[-*]\s/,''))}</li>`);}
          else if(line.match(/^\d+\.\s/)){if(!inList){html.push('<ul>');inList=true;}html.push(`<li>${pi(line.replace(/^\d+\.\s/,''))}</li>`);}
          else if(line.trim()==='') fl();
          else{fl();html.push(`<p>${pi(line)}</p>`);}
        });
        fl();ft();return html.join('\n');
      };

      const fecha = new Date().toLocaleDateString(lang==='es'?'es-AR':'en-US',{year:'numeric',month:'long',day:'numeric'});
      const name = getToolName(toolId);

      const editorialCss = editorial ? `
        body{font-family:Georgia,serif;background:#faf6f0;color:#2c2520;padding:0;}
        .print-bar{background:#fef3c7;border:2px solid #d97706;padding:18px;margin:20px auto;max-width:720px;border-radius:8px;text-align:center;font-family:sans-serif;}
        .print-bar button{background:#78350f;color:#fef3c7;border:none;padding:12px 28px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12pt;margin-top:8px;}
        .container{max-width:720px;margin:0 auto;padding:40px 30px 80px;}
        .cover{text-align:center;padding:100px 20px 80px;border-bottom:1px solid #d4c5b0;margin-bottom:60px;page-break-after:always;}
        .cover-eyebrow{font-family:sans-serif;font-size:11pt;letter-spacing:4px;text-transform:uppercase;color:#8b1538;margin-bottom:20px;}
        .cover-title{font-size:40pt;font-weight:700;color:#2c2520;margin:0 0 16px;line-height:1.1;}
        .cover-date{font-family:sans-serif;font-size:9pt;color:#8b7355;margin-top:60px;text-transform:uppercase;letter-spacing:2px;}
        .section{page-break-after:always;padding-top:10px;}.section:last-of-type{page-break-after:auto;}
        .section-tag{display:inline-block;background:#8b1538;color:#fef3c7;padding:6px 14px;border-radius:4px;font-family:sans-serif;font-size:9pt;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:20px;}
        h1{font-size:28pt;font-weight:700;color:#2c2520;border-bottom:2px solid #8b1538;padding-bottom:8px;margin:22px 0 14px;}
        h2{font-size:18pt;color:#8b1538;font-style:italic;margin:24px 0 10px;}
        h3{font-size:14pt;color:#2c2520;font-family:sans-serif;margin:16px 0 8px;}
        p{margin:12px 0;text-align:justify;line-height:1.75;}
        ul{padding-left:28px;margin:14px 0;}li{margin:8px 0;}
        blockquote{background:#f5ede0;border-left:4px solid #8b1538;padding:16px 24px;margin:16px 0 24px;font-style:italic;color:#3d352c;font-size:14pt;border-radius:0 4px 4px 0;}
        table{border-collapse:collapse;width:100%;margin:14px 0;font-size:10pt;}
        th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #e4e4e7;}
        th{background:#fef3c7;color:#78350f;font-weight:700;border-bottom:2px solid #8b1538;}
        .footer{margin-top:60px;padding-top:20px;border-top:1px solid #d4c5b0;text-align:center;color:#8b7355;font-family:sans-serif;font-size:9pt;font-style:italic;}
        @media print{.print-bar{display:none;}body{background:white;}}
      ` : `
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#18181b;background:#faf9f7;padding:24px;font-size:11pt;}
        .print-bar{background:#fef3c7;border:2px solid #facc15;padding:18px;border-radius:10px;margin-bottom:24px;text-align:center;}
        .print-bar button{background:#facc15;color:#18181b;border:none;padding:12px 28px;border-radius:8px;font-weight:700;cursor:pointer;font-size:12pt;margin-top:8px;}
        .container{max-width:720px;margin:0 auto;}
        .cover{page-break-after:always;min-height:85vh;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:60px 40px;background:#18181b;color:#fff;border-radius:12px;}
        .cover-brand{font-size:13pt;font-weight:700;letter-spacing:1.5px;margin-bottom:8px;color:#facc15;}
        .cover-title{font-size:30pt;font-weight:800;line-height:1.05;margin:20px 0;}
        .cover-date{font-size:9pt;color:#71717a;margin-top:30px;text-transform:uppercase;letter-spacing:2px;}
        .section{page-break-after:always;}.section:last-of-type{page-break-after:auto;}
        .section-tag{display:inline-block;background:#facc15;color:#18181b;padding:6px 14px;border-radius:6px;font-size:9pt;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:20px;}
        h1{font-size:22pt;margin:22px 0 14px;border-bottom:3px solid #facc15;padding-bottom:8px;font-weight:800;}
        h2{font-size:16pt;color:#ca8a04;margin:22px 0 10px;font-weight:700;}
        h3{font-size:13pt;margin:16px 0 8px;font-weight:600;}
        p{margin:8px 0;}ul{padding-left:22px;margin:10px 0;}li{margin:6px 0;}
        blockquote{background:#fef3c7;border-left:4px solid #facc15;padding:14px 20px;margin:14px 0;font-style:italic;}
        table{border-collapse:collapse;width:100%;margin:14px 0;font-size:10pt;}
        th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #e4e4e7;}
        th{background:#fef3c7;color:#78350f;font-weight:700;border-bottom:2px solid #facc15;}
        .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e4e4e7;text-align:center;color:#71717a;font-size:9pt;font-style:italic;}
        @media print{.print-bar{display:none;}body{background:white;}.container{max-width:100%;padding:0;}}
      `;

      let sectionsHtml = '';
      if (reviewText) {
        sectionsHtml += `<div class="section"><span class="section-tag">${lng.exec}</span>${md2html(reviewText)}</div>`;
      }
      currentTool.outputBlocks.forEach((block: any,i: number)=>{
        if (!outputs[block.id]) return;
        sectionsHtml += `<div class="section"><span class="section-tag">${block.title[lang]||block.title.es}</span>${md2html(outputs[block.id])}</div>`;
      });

      const coverHtml = editorial ? `
        <div class="cover">
          <div class="cover-eyebrow">${lang==='es'?'Historia Comercial · Brand Story':'Commercial Story · Brand Story'}</div>
          <div class="cover-title">${name}</div>
          <div class="cover-date">${lng.appName} · ${fecha}</div>
        </div>` : `
        <div class="cover">
          <div class="cover-brand">${lng.appName.toUpperCase()}</div>
          <div class="cover-title">${name}</div>
          <div class="cover-date">${fecha}</div>
        </div>`;

      const fullHtml = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><title>${name}</title><style>@page{size:A4;margin:18mm;}*{box-sizing:border-box;}${editorialCss}</style></head><body>
<div class="print-bar"><strong>📄 ${lang==='es'?'Listo para guardar como PDF':'Ready to save as PDF'}</strong><br><button onclick="window.print()">${lang==='es'?'🖨️ Guardar como PDF':'🖨️ Save as PDF'}</button></div>
<div class="container">${coverHtml}${sectionsHtml}<div class="footer">${lang==='es'?'Generado con Fabrisio sin Humo — Estrategia real, sin chamuyo.':'Generated with Fabrisio sin Humo — Real strategy, no BS.'}</div></div>
</body></html>`;

      const blob = new Blob([fullHtml],{type:'text/html;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`${toolId}-${editorial?'editorial-':''}${Date.now()}.html`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url),100);
    } catch(e: any) { setError(`Export error: ${e.message}`); }
  };

  const backToToolbox = () => {
    setData({}); setAutoFilled({}); setProfileFilled({}); setStepIdx(0); setSkipPhase(false);
    setReviewText(''); setOutputs({}); setCurBlock(0); setChatMsgs([]);
    setPreloadUrl(''); setPreloadSocial(''); setPreloadStatus('');
    setError(''); setToolId(''); setEntryMode(''); setToolProfile('');
    setVagueWarning(null); setVagueOverride({});
    setScreen('toolbox');
  };

  const resetAll = () => { backToToolbox(); setBizType(''); setScreen('landing'); };

  const openMyProfile = () => {
    const current = loadProfile();
    setMyProfileDraft({
      businessName: current.businessName || '',
      businessDescription: current.businessDescription || '',
      idealCustomer: current.idealCustomer || '',
      differential: current.differential || '',
      mainPain: current.mainPain || '',
    });
    setMyProfileSaved(false);
    setMyProfileDeleteAsk(false);
    setScreen('myProfile');
  };

  const saveMyProfile = () => {
    const cleaned: Record<string, string> = {};
    (['businessName','businessDescription','idealCustomer','differential','mainPain'] as ProfileKey[]).forEach(k => {
      const v = (myProfileDraft[k] || '').trim();
      if (v) cleaned[k] = v;
    });
    saveProfile(cleaned);
    setMyProfileSaved(true);
    setTimeout(() => setMyProfileSaved(false), 2500);
  };

  const deleteMyProfile = () => {
    saveProfile({});
    setMyProfileDraft({ businessName:'', businessDescription:'', idealCustomer:'', differential:'', mainPain:'' });
    setMyProfileDeleteAsk(false);
    setMyProfileSaved(true);
    setTimeout(() => setMyProfileSaved(false), 2500);
  };

  // ============ JOURNEY handlers ============
  const openJourneyPick = () => { setJourneyDraftObjective(''); setScreen('journeyPick'); };
  const pickJourneyObjective = (objective: string) => { setJourneyDraftObjective(objective); setScreen('journeyPlan'); };
  const startJourney = () => {
    const plan = JOURNEY_PLANS[journeyDraftObjective];
    if (!plan || plan.length === 0) return;
    const tools = plan.map(s => s.toolId);
    saveJourneyData({ objective: journeyDraftObjective, tools, currentIndex: 0 });
    setJourney(loadJourney());
    pickTool(tools[0]);
  };
  const continueJourney = () => {
    if (!journey) return;
    const next = journey.tools[journey.currentIndex];
    if (next) pickTool(next);
  };
  const advanceJourneyAfterTool = () => {
    if (!journey) return;
    const newIdx = journey.currentIndex + 1;
    if (newIdx >= journey.tools.length) {
      // Camino completado, lo borramos
      deleteJourneyData();
      setJourney(null);
      return;
    }
    saveJourneyData({ objective: journey.objective, tools: journey.tools, currentIndex: newIdx });
    setJourney(loadJourney());
  };
  const abandonJourney = () => {
    deleteJourneyData();
    setJourney(null);
    setJourneyAbandonAsk(false);
  };

  const Header = ({right=null}: any) => {
    const canGoHome = screen!=='landing' && screen!=='toolbox' && screen!=='biztype';
    return (
      <header className="border-b border-zinc-800 sticky top-0 bg-zinc-950/80 backdrop-blur-lg z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={()=>{ if (canGoHome) backToToolbox(); }} disabled={!canGoHome} className={`flex items-center gap-2 ${canGoHome?'hover:opacity-80 cursor-pointer':'cursor-default'} transition-opacity`} title={canGoHome?(lang==='es'?'Volver a herramientas':'Back to toolbox'):''}>
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center"><Flame className="w-4 h-4 text-zinc-950" strokeWidth={2.5}/></div>
            <span className="font-bold text-sm">{lng.appName}</span>
          </button>
          <div className="flex items-center gap-3">
            {right}
            <button onClick={()=>setLang(lang==='es'?'en':'es')} className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded-md text-xs"><Globe className="w-3 h-3"/>{lang==='es'?'ES':'EN'}</button>
          </div>
        </div>
      </header>
    );
  };

  if (screen==='landing') return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,204,21,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(250,204,21,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"/>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-[120px]"/>
      <div className="relative max-w-6xl mx-auto px-6 py-6">
        <header className="flex items-center justify-between mb-20">
          <div className="flex items-center gap-2"><div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center"><Flame className="w-5 h-5 text-zinc-950" strokeWidth={2.5}/></div><span className="font-bold text-lg tracking-tight">{lng.appName}</span></div>
          <button onClick={()=>setLang(lang==='es'?'en':'es')} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 text-sm"><Globe className="w-4 h-4"/>{lang==='es'?'ES':'EN'}</button>
        </header>
        <div className="text-center max-w-3xl mx-auto pt-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-medium mb-6"><Sparkles className="w-3 h-3"/>{lng.subtitle}</div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="block">{lang==='es'?'Estrategia real.':'Real strategy.'}</span>
            <span className="block text-yellow-400">{lang==='es'?'Sin chamuyo.':'No BS.'}</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">{lng.heroDesc}</p>
          <button onClick={handleStart} className="group inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-yellow-400/20">{lng.startBtn}<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/></button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20">
            {[{icon:Target,t:lang==='es'?'Diagnóstico real':'Real diagnosis',d:lang==='es'?'Preguntas que importan':'Questions that matter'},{icon:BarChart3,t:lang==='es'?'Estrategia por bloques':'Strategy by blocks',d:lang==='es'?'Funnel + campañas + creatividades':'Funnel + campaigns + creatives'},{icon:FileText,t:lang==='es'?'Exportable':'Exportable',d:lang==='es'?'Te lo llevás listo para ejecutar':'Take it ready to execute'}].map((f,i)=>(
              <div key={i} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-left">
                <div className="w-10 h-10 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-3"><f.icon className="w-5 h-5 text-yellow-400"/></div>
                <h3 className="font-semibold mb-1">{f.t}</h3><p className="text-sm text-zinc-400">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (screen==='apikey') return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex w-20 h-20 bg-yellow-400 rounded-2xl items-center justify-center mb-5"><Flame className="w-10 h-10 text-zinc-950" strokeWidth={2.5}/></div>
          <h1 className="text-3xl font-bold mb-2">{lng.appName}</h1>
          <p className="text-zinc-400 text-sm">{lng.loginDesc}</p>
        </div>
        <div className="space-y-4">
          <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&passwordInput.trim()&&handleLogin()} placeholder={lng.loginPlaceholder} className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-yellow-400 outline-none text-lg text-center tracking-widest" autoFocus/>
          <button onClick={handleLogin} disabled={!passwordInput.trim()} className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-950 font-bold text-lg rounded-xl transition-colors">{lng.loginBtn}</button>
          {error&&<div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center"><p className="text-red-300 text-sm">{error}</p></div>}
          <p className="text-center text-xs text-zinc-600">{lng.loginContact}</p>
        </div>
      </div>
    </div>
  );

  if (screen==='biztype') {
    const types = [{key:'ecommerce',icon:'🛒'},{key:'service',icon:'💼'},{key:'b2b',icon:'🏢'},{key:'health',icon:'🏥'},{key:'education',icon:'🎓'},{key:'local',icon:'🏠'}];
    return (
      <div className="min-h-screen bg-zinc-950 text-white"><Header/>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-medium mb-6"><Target className="w-3 h-3"/>{lang==='es'?'Paso 1':'Step 1'}</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{lng.bizTypeTitle}</h2>
          <p className="text-zinc-400 mb-10">{lng.bizTypeDesc}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {types.map(tp=>{
              const info=lng.bizTypes[tp.key]; const sel=bizType===tp.key;
              return <button key={tp.key} onClick={()=>setBizType(tp.key)} className={`text-left p-5 rounded-xl border transition-all ${sel?'bg-yellow-400/10 border-yellow-400':'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}>
                <div className="flex items-start gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${sel?'bg-yellow-400/20':'bg-zinc-800'}`}>{tp.icon}</div>
                  <div className="flex-1"><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-white">{info.label}</h3>{sel&&<Check className="w-4 h-4 text-yellow-400"/>}</div><p className="text-sm text-zinc-400">{info.desc}</p></div></div>
              </button>;
            })}
          </div>
          <div className="flex justify-end"><button onClick={()=>pickBiz(bizType)} disabled={!bizType} className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-950 font-semibold rounded-xl">{lng.bizTypeContinue}<ArrowRight className="w-4 h-4"/></button></div>
        </div>
      </div>
    );
  }

  if (screen==='toolbox') {
    const allTools = [...Object.values(TOOLS), ...LOCKED_TOOLS.map(lt=>({...lt,available:false,name:{es:(LOCKED_NAMES as any)[lt.id]?.es?.name||lt.id,en:(LOCKED_NAMES as any)[lt.id]?.en?.name||lt.id},description:{es:(LOCKED_NAMES as any)[lt.id]?.es?.desc||'',en:(LOCKED_NAMES as any)[lt.id]?.en?.desc||''}}))];
    let filtered = allTools;
    if (toolSearch.trim()) { const q=toolSearch.toLowerCase(); filtered=filtered.filter(tl=>(getToolName(tl.id).toLowerCase().includes(q)||getToolDesc(tl.id).toLowerCase().includes(q))); }
    if (toolCatFilter) filtered=filtered.filter(tl=>tl.category===toolCatFilter);
    const recommended = bizType ? allTools.filter(tl=>tl.available&&tl.recommendedFor?.includes(bizType)).slice(0,3) : [];
    const levelColors = {basico:'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',intermedio:'bg-blue-500/10 text-blue-400 border-blue-500/30',avanzado:'bg-orange-500/10 text-orange-400 border-orange-500/30'};
    const levelMap = {basico:lng.toolLevelBasico,intermedio:lng.toolLevelIntermedio,avanzado:lng.toolLevelAvanzado};
    const cats = [{id:'diagnosis',label:lng.catDiagnosis,desc:lng.catDiagnosisDesc,icon:Compass},{id:'marketing',label:lng.catMarketing,desc:lng.catMarketingDesc,icon:Megaphone},{id:'content',label:lng.catContent,desc:lng.catContentDesc,icon:Film},{id:'operations',label:lng.catOperations,desc:lng.catOperationsDesc,icon:PieChart},{id:'growth',label:lng.catGrowth,desc:lng.catGrowthDesc,icon:TrendingUp}];

    const CardComp = ({tool}: any) => {
      const locked = !tool.available;
      return (
        <button onClick={()=>tool.available&&pickTool(tool.id)} disabled={locked} className={`group relative text-left rounded-2xl border transition-all overflow-hidden ${locked?'bg-zinc-900/30 border-zinc-800/60 cursor-not-allowed opacity-70':'bg-zinc-900 border-zinc-800 hover:border-yellow-400/50 hover:bg-zinc-900/90 cursor-pointer hover:shadow-lg hover:shadow-yellow-400/5'}`}>
          <div className={`relative h-32 overflow-hidden ${locked?'bg-gradient-to-br from-zinc-900 to-zinc-950':'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950'}`}>
            {!locked&&<div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle at 30% 50%, rgba(250,204,21,0.15) 0%, transparent 60%)'}}/>}
            <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'linear-gradient(rgba(250,204,21,1) 1px,transparent 1px),linear-gradient(90deg,rgba(250,204,21,1) 1px,transparent 1px)',backgroundSize:'14px 14px'}}/>
            <div className="absolute inset-0 p-4 transition-transform duration-300 group-hover:scale-105"><ToolIllustration illustrationId={tool.illustrationId} isLocked={locked}/></div>
            {locked&&<div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-zinc-950/90 backdrop-blur-sm border border-zinc-700 rounded-full text-[10px] font-semibold text-zinc-400"><Lock className="w-2.5 h-2.5"/>{lng.toolSoon}</div>}
          </div>
          <div className="p-5">
            <h3 className={`font-semibold text-base mb-1.5 leading-tight ${locked?'text-zinc-400':'text-white'}`}>{getToolName(tool.id)}</h3>
            <p className={`text-sm leading-relaxed mb-4 ${locked?'text-zinc-600':'text-zinc-400'}`}>{getToolDesc(tool.id)}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${(levelColors as any)[tool.level]}`}>{(levelMap as any)[tool.level]}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-800/80 text-zinc-400 rounded-md border border-zinc-700"><Clock className="w-3 h-3"/>{tool.time} {lng.toolTimeMin}</span>
            </div>
            {!locked&&<div className="mt-4 inline-flex items-center gap-1.5 text-yellow-400 text-sm font-semibold group-hover:gap-2.5 transition-all">{lng.toolStart}<ArrowRight className="w-3.5 h-3.5"/></div>}
          </div>
        </button>
      );
    };

    return (
      <div className="min-h-screen bg-zinc-950 text-white"><Header right={<button onClick={openMyProfile} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded-md text-xs text-zinc-300 border border-zinc-800"><Users className="w-3 h-3"/>{lng.myProfile}</button>}/>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-medium mb-4"><Briefcase className="w-3 h-3"/>{lng.toolboxSubtitle}</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{lng.toolboxTitle}</h2>
            <p className="text-zinc-400 leading-relaxed text-lg max-w-2xl">{lng.toolboxDesc}</p>
            {bizType&&<div className="mt-4 inline-flex items-center gap-2 text-xs text-zinc-500"><span>{lang==='es'?'Negocio:':'Business:'}</span><span className="text-yellow-400 font-medium">{lng.bizTypes[bizType].label}</span><button onClick={()=>setScreen('biztype')} className="text-zinc-600 hover:text-yellow-400 underline">{lang==='es'?'cambiar':'change'}</button></div>}
          </div>

          {journey ? (
            <div className="mb-8 p-5 bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/30 rounded-2xl">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-yellow-400/15 border border-yellow-400/30 rounded-full text-yellow-400 text-xs font-semibold mb-3"><Compass className="w-3 h-3"/>{lng.journeyActiveTitle}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{(lng as any)['journeyObj_'+journey.objective.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]}</h3>
                  <p className="text-sm text-zinc-400">{journey.currentIndex}/{journey.tools.length} {lng.journeyActiveProgress}</p>
                  {journey.currentIndex < journey.tools.length && (
                    <p className="text-sm text-zinc-300 mt-2"><span className="text-zinc-500">{lng.journeyActiveNext}:</span> <span className="font-semibold text-yellow-400">{getToolName(journey.tools[journey.currentIndex])}</span></p>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={continueJourney} disabled={journey.currentIndex >= journey.tools.length} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-950 font-semibold rounded-lg text-sm"><ArrowRight className="w-4 h-4"/>{lng.journeyActiveContinue}</button>
                  {!journeyAbandonAsk ? (
                    <button onClick={()=>setJourneyAbandonAsk(true)} className="text-xs text-zinc-500 hover:text-red-400">{lng.journeyActiveAbandon}</button>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] text-zinc-400">{lng.journeyAbandonConfirm}</span>
                      <div className="flex gap-2">
                        <button onClick={abandonJourney} className="px-2.5 py-1 bg-red-500 hover:bg-red-400 text-white rounded text-xs font-semibold">{lng.journeyAbandonYes}</button>
                        <button onClick={()=>setJourneyAbandonAsk(false)} className="px-2.5 py-1 text-zinc-400 hover:text-white text-xs">{lng.journeyAbandonCancel}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button onClick={openJourneyPick} className="w-full mb-8 p-5 bg-zinc-900 hover:bg-zinc-900/70 border border-zinc-800 hover:border-yellow-400/40 rounded-2xl text-left transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400/10 border border-yellow-400/30 rounded-xl flex items-center justify-center flex-shrink-0"><Compass className="w-6 h-6 text-yellow-400"/></div>
                <div className="flex-1">
                  <div className="font-semibold text-white mb-0.5">{lng.guideMeBtn}</div>
                  <p className="text-sm text-zinc-400">{lng.journeyPickDesc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform flex-shrink-0"/>
              </div>
            </button>
          )}

          <div className="mb-8 space-y-3">
            <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/><input type="text" value={toolSearch} onChange={e=>setToolSearch(e.target.value)} placeholder={lng.toolboxSearch} className="w-full pl-11 pr-5 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-yellow-400 outline-none text-zinc-100 placeholder-zinc-600"/></div>
            <div className="flex flex-wrap gap-2">
              <button onClick={()=>setToolCatFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${toolCatFilter===''?'bg-yellow-400 text-zinc-950 border-yellow-400':'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'}`}>{lng.toolboxAll}</button>
              {cats.map(cat=><button key={cat.id} onClick={()=>setToolCatFilter(cat.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${toolCatFilter===cat.id?'bg-yellow-400 text-zinc-950 border-yellow-400':'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'}`}><cat.icon className="w-3 h-3"/>{cat.label}</button>)}
            </div>
          </div>
          {recommended.length>0&&!toolSearch&&!toolCatFilter&&(
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4 text-yellow-400"/><h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">{lng.toolboxRecommended}</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{recommended.map(tl=><CardComp key={tl.id} tool={tl}/>)}</div>
            </div>
          )}
          {filtered.length===0?<div className="text-center py-16 text-zinc-500"><Search className="w-12 h-12 mx-auto mb-4 text-zinc-700"/><p>{lng.toolboxEmpty}</p></div>:(
            <div className="space-y-12">
              {cats.map(cat=>{
                const catTools=filtered.filter(tl=>tl.category===cat.id);
                if (!catTools.length) return null;
                return <div key={cat.id}><div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-800"><div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center"><cat.icon className="w-5 h-5 text-yellow-400"/></div><div><h3 className="text-lg font-bold text-white">{cat.label}</h3><p className="text-xs text-zinc-500">{cat.desc}</p></div></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{catTools.map(tl=><CardComp key={tl.id} tool={tl}/>)}</div></div>;
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen==='journeyPick') {
    const objectives: { key: string; labelKey: string; icon: any }[] = [
      { key: 'brand-clarity',      labelKey: 'journeyObj_brandClarity',      icon: Sparkles },
      { key: 'attract-customers',  labelKey: 'journeyObj_attractCustomers',  icon: Target },
      { key: 'create-content',     labelKey: 'journeyObj_createContent',     icon: FileEdit },
      { key: 'diagnose',           labelKey: 'journeyObj_diagnose',          icon: BarChart3 },
      { key: 'grow-social',        labelKey: 'journeyObj_growSocial',        icon: TrendingUp },
    ];
    return (
      <div className="min-h-screen bg-zinc-950 text-white"><Header right={<button onClick={backToToolbox} className="text-xs text-zinc-500 hover:text-yellow-400">← {lng.toolboxBack}</button>}/>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-medium mb-6"><Compass className="w-3 h-3"/>{lng.guideMeBtnShort}</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{lng.journeyPickTitle}</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">{lng.journeyPickDesc}</p>
          <div className="space-y-3">
            {objectives.map(o => (
              <button key={o.key} onClick={()=>pickJourneyObjective(o.key)} className="w-full text-left p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-yellow-400/50 hover:bg-zinc-900/80 transition-all flex items-center gap-4 group">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-400/20"><o.icon className="w-5 h-5 text-yellow-400"/></div>
                <div className="flex-1 font-semibold text-white">{(lng as any)[o.labelKey]}</div>
                <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform"/>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen==='journeyPlan') {
    const plan = JOURNEY_PLANS[journeyDraftObjective];
    if (!plan) { setScreen('journeyPick'); return null; }
    const objectiveLabel = (lng as any)['journeyObj_'+journeyDraftObjective.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())];
    return (
      <div className="min-h-screen bg-zinc-950 text-white"><Header right={<button onClick={()=>setScreen('journeyPick')} className="text-xs text-zinc-500 hover:text-yellow-400">← {lang==='es'?'Cambiar objetivo':'Change goal'}</button>}/>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-medium mb-4"><Compass className="w-3 h-3"/>{objectiveLabel}</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{lng.journeyPlanTitle}</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">{lng.journeyPlanDesc}</p>
          <div className="space-y-4 mb-8">
            {plan.map((step, idx) => (
              <div key={idx} className="flex gap-4 p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                <div className="w-10 h-10 bg-yellow-400 text-zinc-950 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">{idx+1}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white mb-1">{getToolName(step.toolId)}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{(step.reason as any)[lang] || step.reason.es}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={startJourney} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-xl"><ArrowRight className="w-4 h-4"/>{lng.journeyStart}</button>
        </div>
      </div>
    );
  }

  if (screen==='continueSession') {
    const session = loadSession(toolId);
    if (!session) { startToolFresh(toolId); return null; }
    const toolName = getToolName(toolId);
    const summary = getSessionSummary(toolId, session, lng);
    const last = timeAgo(session.savedAt, lang);
    return (
      <div className="min-h-screen bg-zinc-950 text-white"><Header right={<button onClick={backToToolbox} className="text-xs text-zinc-500 hover:text-yellow-400">← {lng.toolboxBack}</button>}/>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/30 rounded-full text-yellow-400 text-xs font-medium mb-6">
            <RefreshCw className="w-3 h-3"/>{lng.continueSessionTitle}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{toolName}</h2>
          <p className="text-zinc-400 mb-8">{lng.continueSessionDesc}</p>

          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{lng.continueSessionLast}</span>
              <span className="text-xs text-zinc-400">{last}</span>
            </div>
            <div className="text-lg font-semibold text-white">{summary}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={continueSavedSession} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-xl">
              <ArrowRight className="w-4 h-4"/>{lng.continueSessionContinue}
            </button>
            <button onClick={startFreshSession} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl">
              <Eraser className="w-4 h-4"/>{lng.continueSessionFresh}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen==='myProfile') {
    const fields: { key: ProfileKey; label: string; placeholder: string }[] = [
      { key: 'businessName',         label: lng.profileBusinessName,        placeholder: lng.profileBusinessNamePh },
      { key: 'businessDescription',  label: lng.profileBusinessDescription, placeholder: lng.profileBusinessDescriptionPh },
      { key: 'idealCustomer',        label: lng.profileIdealCustomer,       placeholder: lng.profileIdealCustomerPh },
      { key: 'differential',         label: lng.profileDifferential,        placeholder: lng.profileDifferentialPh },
      { key: 'mainPain',             label: lng.profileMainPain,            placeholder: lng.profileMainPainPh },
    ];
    const filledCount = fields.filter(f => (myProfileDraft[f.key] || '').trim()).length;
    return (
      <div className="min-h-screen bg-zinc-950 text-white"><Header right={<button onClick={backToToolbox} className="text-xs text-zinc-500 hover:text-yellow-400">← {lng.toolboxBack}</button>}/>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-400/10 border border-blue-400/30 rounded-full text-blue-300 text-xs font-medium mb-6">
            <Users className="w-3 h-3"/>{filledCount} {lng.myProfileFilledCount}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{lng.myProfileTitle}</h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">{lng.myProfileDesc}</p>

          <div className="space-y-5">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-zinc-200 mb-2">{f.label}</label>
                <textarea
                  value={myProfileDraft[f.key] || ''}
                  onChange={e => setMyProfileDraft(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  rows={f.key === 'businessName' ? 1 : 3}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-yellow-400 outline-none text-zinc-100 placeholder-zinc-600 resize-none text-sm leading-relaxed"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-zinc-800">
            <button onClick={saveMyProfile} className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-lg">
              <Check className="w-4 h-4"/>{lng.myProfileSave}
            </button>
            <button onClick={backToToolbox} className="inline-flex items-center gap-2 px-4 py-2.5 text-zinc-400 hover:text-white text-sm">
              <ChevronLeft className="w-4 h-4"/>{lng.toolboxBack}
            </button>
            {myProfileSaved && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-medium">
                {lng.myProfileSaved}
              </span>
            )}
            <div className="flex-1"/>
            {!myProfileDeleteAsk ? (
              <button onClick={()=>setMyProfileDeleteAsk(true)} className="inline-flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 text-sm">
                <Eraser className="w-4 h-4"/>{lng.myProfileDelete}
              </button>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0"/>
                <span className="text-sm text-red-200">{lng.myProfileDeleteConfirm}</span>
                <button onClick={deleteMyProfile} className="px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-md text-xs font-semibold">{lng.myProfileDeleteYes}</button>
                <button onClick={()=>setMyProfileDeleteAsk(false)} className="px-3 py-1.5 text-zinc-400 hover:text-white text-xs">{lng.myProfileDeleteCancel}</button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center gap-3">
            <button onClick={resetAllTips} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 hover:text-yellow-400">
              <Sparkles className="w-3 h-3"/>{lng.tipsReset}
            </button>
            {Object.keys(tipsSeen).length === 0 && myProfileSaved && (
              <span className="text-xs text-emerald-400">{lng.tipsResetDone}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen==='profile') {
    const profiles = currentTool.profiles[lang]||currentTool.profiles.es;
    const icons = {entrepreneur:'🚀',professional:'💼',seller:'🤝',personalBrand:'🎙️'};
    return (
      <div className="min-h-screen bg-zinc-950 text-white"><Header right={<button onClick={backToToolbox} className="text-xs text-zinc-500 hover:text-yellow-400">← {lng.toolboxBack}</button>}/>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-medium mb-6">{getToolName(toolId)}</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{lng.profileTitle}</h2>
          <p className="text-zinc-400 mb-10">{lng.profileDesc}</p>
          <div className="space-y-3">
            {profiles.map((p: any)=>(
              <button key={p.id} onClick={()=>pickProfile(p.id)} className="w-full text-left p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-yellow-400/50 transition-all flex items-start gap-4 group">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-yellow-400/20">{(icons as any)[p.id]||'✨'}</div>
                <div className="flex-1"><h3 className="font-semibold text-white mb-1">{p.label}</h3><p className="text-sm text-zinc-400">{p.desc}</p></div>
                <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform mt-3"/>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen==='entry') {
    const modes = currentTool.entryModes;
    const cfg = {preload:{icon:Wand2,title:lng.entryPreload,desc:lng.entryPreloadDesc},guided:{icon:ListChecks,title:lng.entryGuided,desc:lng.entryGuidedDesc}};
    return (
      <div className="min-h-screen bg-zinc-950 text-white"><Header right={<button onClick={backToToolbox} className="text-xs text-zinc-500 hover:text-yellow-400">← {lng.toolboxBack}</button>}/>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-medium mb-6">{getToolName(toolId)}</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{lng.entryTitle}</h2>
          <p className="text-zinc-400 mb-10">{lng.entryDesc}</p>
          <div className="space-y-3">
            {modes.map((m: string)=>{ const c=(cfg as any)[m]; if(!c) return null; const Icon=c.icon; return (
              <button key={m} onClick={()=>pickEntry(m)} className="w-full text-left p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-yellow-400/50 transition-all flex items-start gap-4 group">
                <div className="w-12 h-12 bg-yellow-400/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-400/20"><Icon className="w-5 h-5 text-yellow-400"/></div>
                <div className="flex-1"><h3 className="font-semibold text-white mb-1">{c.title}</h3><p className="text-sm text-zinc-400">{c.desc}</p></div>
                <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform mt-3"/>
              </button>
            );})}
          </div>
        </div>
      </div>
    );
  }

  if (screen==='preload') {
    const isFetching=preloadStatus==='fetching', isAnalyzing=preloadStatus==='analyzing', isDone=preloadStatus==='done', isWorking=isFetching||isAnalyzing;
    return (
      <div className="min-h-screen bg-zinc-950 text-white"><Header/>
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-medium mb-6"><Sparkles className="w-3 h-3"/>{getToolName(toolId)}</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3"><Wand2 className="w-8 h-8 text-yellow-400"/>{lng.entryPreload}</h2>
          <p className="text-zinc-400 mb-10">{lng.entryPreloadDesc}</p>
          <div className="mb-6"><label className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-2"><Link2 className="w-4 h-4 text-yellow-400"/>{lng.preloadUrlLabel}</label><input type="url" value={preloadUrl} onChange={e=>setPreloadUrl(e.target.value)} placeholder={lng.preloadUrlPlaceholder} disabled={isWorking} className="w-full px-5 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-yellow-400 outline-none text-zinc-100 placeholder-zinc-600 disabled:opacity-50"/>{preloadStatus==='fetch_failed'&&<div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-2 text-sm"><AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5"/><span className="text-orange-200">{lng.preloadFailed}</span></div>}</div>
          <div className="mb-8"><label className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-2"><Users className="w-4 h-4 text-yellow-400"/>{lng.preloadSocialLabel}</label><textarea value={preloadSocial} onChange={e=>setPreloadSocial(e.target.value)} placeholder={lng.preloadSocialPlaceholder} disabled={isWorking} rows={6} className="w-full px-5 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-yellow-400 outline-none text-zinc-100 placeholder-zinc-600 resize-none disabled:opacity-50 text-sm"/></div>
          {isWorking&&<div className="mb-6 p-4 bg-yellow-400/5 border border-yellow-400/30 rounded-xl flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin text-yellow-400"/><span className="text-yellow-100 text-sm">{isFetching?lng.preloadFetching:lng.preloadAnalyzing}</span></div>}
          {isDone&&<div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3"><Check className="w-5 h-5 text-green-400"/><span className="text-green-200 text-sm">{lng.preloadSuccess}</span></div>}
          {error&&!isWorking&&<div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/><p className="text-red-200 text-sm flex-1">{error}</p></div>}
          <div className="flex flex-wrap gap-3">
            <button onClick={handleAnalyzePreload} disabled={isWorking||isDone||(!preloadUrl.trim()&&!preloadSocial.trim())} className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-950 font-semibold rounded-xl">{isWorking?<Loader2 className="w-5 h-5 animate-spin"/>:<Zap className="w-5 h-5"/>}{lang==='es'?'Analizar y pre-llenar':'Analyze and pre-fill'}</button>
            <button onClick={handleSkipPreload} disabled={isWorking} className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl disabled:opacity-40"><SkipForward className="w-4 h-4"/>{lang==='es'?'Saltar':'Skip'}</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen==='wizard') {
    if (!curStep) return null;
    const q = getQ(curStep.key);
    const val = data[curStep.key];
    const canProceed = curStep.optional||(Array.isArray(val)?val.length>0:(val&&val.toString().trim()));
    const progress = ((stepIdx+1)/visibleFlow.length)*100;
    const phaseLabels = currentTool.phases[lang]||currentTool.phases.es;
    const profLabel = toolProfile&&currentTool.profiles ? (currentTool.profiles[lang]||currentTool.profiles.es).find((p: any)=>p.id===toolProfile)?.label : '';
    const demoData = (DEMO as any)[toolId];

    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <header className="border-b border-zinc-800 sticky top-0 bg-zinc-950/80 backdrop-blur-lg z-10">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={()=>backToToolbox()} className="flex items-center gap-2 hover:opacity-80 cursor-pointer transition-opacity" title={lang==='es'?'Volver a herramientas':'Back to toolbox'}><div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center"><Flame className="w-4 h-4 text-zinc-950" strokeWidth={2.5}/></div><span className="font-bold text-sm">{lng.appName}</span></button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">{lng.step} {stepIdx+1} {lng.of} {visibleFlow.length}</span>
              {demoData&&<button onClick={()=>setData(p=>({...p,...demoData}))} className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-400 rounded-md text-xs font-medium">🧪 Demo</button>}
              <button onClick={()=>setLang(lang==='es'?'en':'es')} className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded-md text-xs"><Globe className="w-3 h-3"/>{lang==='es'?'ES':'EN'}</button>
            </div>
          </div>
          <div className="h-1 bg-zinc-800"><div className="h-full bg-yellow-400 transition-all duration-300" style={{width:`${progress}%`}}/></div>
        </header>
        <div className="max-w-3xl mx-auto px-6 py-12">
          {stepIdx===0 && TOOL_TIPS[toolId] && !tipsSeen[toolId] && (
            <div className="mb-6 p-4 bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/30 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><Flame className="w-4 h-4 text-zinc-950" strokeWidth={2.5}/></div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">💡 {lng.tipFabrisio}</div>
                <p className="text-sm text-zinc-200 leading-relaxed">{(TOOL_TIPS[toolId] as any)[lang] || TOOL_TIPS[toolId].es}</p>
              </div>
              <button onClick={()=>dismissTip(toolId)} className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 flex-shrink-0">{lng.tipDismiss}</button>
            </div>
          )}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400 mb-6">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"/>
            {phaseLabels[curStep.phase]}
            {profLabel&&<><span className="text-zinc-700">·</span><span className="text-yellow-400">{profLabel}</span></>}
            {bizType&&!profLabel&&<><span className="text-zinc-700">·</span><span className="text-yellow-400">{lng.bizTypes[bizType].label}</span></>}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{q.title}</h2>
          <p className="text-zinc-400 mb-4">{q.desc}</p>
          {autoFilled[curStep.key]&&<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/30 rounded-full text-yellow-400 text-xs font-medium mb-4"><Wand2 className="w-3.5 h-3.5"/><span>{lng.autoDetected}</span><button onClick={()=>clearField(curStep.key)} className="ml-1 hover:text-white"><Eraser className="w-3.5 h-3.5"/></button></div>}
          {!autoFilled[curStep.key]&&profileFilled[curStep.key]&&<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-400/10 border border-blue-400/30 rounded-full text-blue-300 text-xs font-medium mb-4"><Users className="w-3.5 h-3.5"/><span>{lng.fromProfile}</span><button onClick={()=>clearField(curStep.key)} className="ml-1 hover:text-white"><Eraser className="w-3.5 h-3.5"/></button></div>}
          <div className="mt-2">
            {curStep.type==='textarea'&&<textarea value={val||''} onChange={e=>setData({...data,[curStep.key]:e.target.value})} placeholder={q.placeholder} rows={6} className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-yellow-400 outline-none text-zinc-100 placeholder-zinc-600 resize-none"/>}
            {curStep.type==='select'&&<div className="space-y-2">{q.options.map((opt: string)=><button key={opt} onClick={()=>setData({...data,[curStep.key]:opt})} className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${val===opt?'bg-yellow-400/10 border-yellow-400 text-white':'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'}`}><div className="flex items-center justify-between"><span>{opt}</span>{val===opt&&<Check className="w-5 h-5 text-yellow-400"/>}</div></button>)}</div>}
            {curStep.type==='multiselect'&&<><p className="text-xs text-zinc-500 mb-3">{lng.selectMultiple}</p><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{q.options.map((opt: string)=>{const sel=Array.isArray(val)&&val.includes(opt);return<button key={opt} onClick={()=>{const arr=Array.isArray(val)?val:[];setData({...data,[curStep.key]:sel?arr.filter((x: string)=>x!==opt):[...arr,opt]});}} className={`px-4 py-3 rounded-xl border text-sm font-medium ${sel?'bg-yellow-400/10 border-yellow-400 text-white':'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300'}`}>{opt}</button>;})}</div></>}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button onClick={()=>setChatOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm text-zinc-300"><MessageCircle className="w-4 h-4 text-yellow-400"/>{lng.dontKnow}</button>
            {curStep.skippable&&<button onClick={handleSkipSection} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-sm text-zinc-300"><SkipForward className="w-4 h-4"/>{lang==='es'?'Saltar sección':'Skip section'}</button>}
          </div>
          {vagueWarning&&(
            <div className="mt-6 p-5 bg-yellow-400/10 border-2 border-yellow-400/40 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"/>
                <div><h4 className="font-semibold text-yellow-300 mb-1">{lng.vagueTitle}</h4><p className="text-sm text-yellow-100/90 leading-relaxed">{vagueWarning}</p></div>
              </div>
              <div className="flex flex-wrap gap-2 ml-8">
                <button onClick={refineVague} className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-lg text-sm"><FileEdit className="w-4 h-4"/>{lng.vagueRefine}</button>
                <button onClick={acceptVague} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-lg text-sm"><SkipForward className="w-4 h-4"/>{lng.vagueContinue}</button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-zinc-800">
            <button onClick={handleBack} className="inline-flex items-center gap-2 px-4 py-2.5 text-zinc-400 hover:text-white"><ChevronLeft className="w-4 h-4"/>{stepIdx===0?lng.toolboxBack:lng.back}</button>
            <button onClick={handleNext} disabled={!canProceed&&!curStep.optional} className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-950 font-semibold rounded-lg">{stepIdx===visibleFlow.length-1?(lang==='es'?'Generar':'Generate'):lng.next}<ChevronRight className="w-4 h-4"/></button>
          </div>
        </div>
        {chatOpen&&(
          <div className="fixed inset-0 z-50 flex justify-end" onClick={()=>setChatOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
            <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 flex flex-col h-screen" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-zinc-800"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center"><Flame className="w-4 h-4 text-zinc-950" strokeWidth={2.5}/></div><span className="font-semibold">{lng.askClaude}</span></div><button onClick={()=>setChatOpen(false)} className="p-1.5 hover:bg-zinc-900 rounded-lg"><X className="w-5 h-5"/></button></div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {chatMsgs.length===0&&<div className="text-center text-zinc-500 text-sm pt-12">{lng.chatEmpty}</div>}
                {chatMsgs.map((m,i)=><div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${m.role==='user'?'bg-yellow-400 text-zinc-950':'bg-zinc-900 text-zinc-200 border border-zinc-800'}`}>{m.content}</div></div>)}
                {chatLoading&&<div className="flex justify-start"><div className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-2xl"><Loader2 className="w-4 h-4 animate-spin text-yellow-400"/></div></div>}
              </div>
              <div className="p-4 border-t border-zinc-800"><div className="flex gap-2"><input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!chatLoading&&sendChat()} placeholder={lng.chatPlaceholder} className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-yellow-400 outline-none text-sm"/><button onClick={sendChat} disabled={!chatInput.trim()||chatLoading} className="p-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-950 rounded-lg"><Send className="w-4 h-4"/></button></div></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (screen==='review') return (
    <div className="min-h-screen bg-zinc-950 text-white"><Header/>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold mb-2">{lng.reviewTitle}</h2><p className="text-zinc-400 mb-8">{lng.reviewDesc}</p>
        {loading&&<div className="flex flex-col items-center py-20 gap-4"><Loader2 className="w-10 h-10 animate-spin text-yellow-400"/><p className="text-zinc-400">{lng.generating}</p></div>}
        {error&&<div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/><div><p className="font-semibold text-red-400">{lng.error}</p><p className="text-sm text-zinc-400 mt-1">{error}</p><button onClick={genReview} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm text-red-300"><RefreshCw className="w-4 h-4"/>{lng.retry}</button></div></div>}
        {reviewText&&!loading&&<>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 mb-8"><MdRender text={reviewText}/></div>
          <div className="p-5 bg-yellow-400/5 border border-yellow-400/20 rounded-xl"><p className="text-yellow-100 font-medium mb-4">{lng.confirmReview}</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={async()=>{setScreen('output');setCurBlock(0);await genBlock(0);}} className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-lg"><Check className="w-4 h-4"/>{lng.yesGenerate}</button>
              <button onClick={()=>{setScreen('wizard');setStepIdx(0);}} className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg">{lng.noAdjust}</button>
            </div>
          </div>
        </>}
      </div>
    </div>
  );

  if (screen==='output') {
    const blocks = currentTool.outputBlocks;
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Header right={<div className="flex items-center gap-2">{blocks.map((_: any,n: number)=><div key={n} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${n<curBlock?'bg-yellow-400 border-yellow-400 text-zinc-950':n===curBlock?'bg-yellow-400/20 border-yellow-400 text-yellow-400':'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>{n<curBlock?<Check className="w-3.5 h-3.5"/>:n+1}</div>)}</div>}/>
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
          {blocks.map((block: any,bi: number)=>{
            if (bi>curBlock) return null;
            const isCur=bi===curBlock, showLoad=isCur&&loading, showRef=refineMode===bi, blockText=outputs[block.id];
            return (
              <div key={block.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="bg-yellow-400/5 border-b border-zinc-800 px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-yellow-400 text-zinc-950 rounded-lg flex items-center justify-center font-bold text-sm">{bi+1}</div><h3 className="font-semibold">{block.title[lang]||block.title.es}</h3></div></div>
                <div className="p-6 md:p-8">
                  {showLoad&&<div className="flex flex-col items-center py-16 gap-4"><Loader2 className="w-10 h-10 animate-spin text-yellow-400"/><p className="text-zinc-400">{lng.generating}</p></div>}
                  {error&&isCur&&!showLoad&&<div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/><div><p className="font-semibold text-red-400">{lng.error}</p><p className="text-sm text-zinc-400 mt-1">{error}</p><button onClick={()=>genBlock(bi)} className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm text-red-300"><RefreshCw className="w-4 h-4"/>{lng.retry}</button></div></div>}
                  {blockText&&!showLoad&&<>
                    <MdRender text={blockText}/>
                    {isCur&&!showRef&&<div className="mt-8 pt-6 border-t border-zinc-800 flex flex-wrap gap-3">
                      <button onClick={()=>approveBlock(bi)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-lg"><Check className="w-4 h-4"/>{bi===blocks.length-1?lng.finalizeStrategy:lng.approveContinue}</button>
                      <button onClick={()=>setRefineMode(bi)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg"><RefreshCw className="w-4 h-4"/>{lng.refine}</button>
                    </div>}
                    {isCur&&showRef&&<div className="mt-8 pt-6 border-t border-zinc-800">
                      <p className="text-sm font-medium text-yellow-400 mb-3">{lng.refineLabel}</p>
                      <textarea value={refineInput} onChange={e=>setRefineInput(e.target.value)} placeholder={lng.refinePlaceholder} rows={3} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:border-yellow-400 outline-none text-sm resize-none"/>
                      <div className="flex gap-3 mt-3">
                        <button onClick={()=>handleRefine(bi)} disabled={!refineInput.trim()||loading} className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-950 font-semibold rounded-lg">{loading?<Loader2 className="w-4 h-4 animate-spin"/>:<Send className="w-4 h-4"/>}{lng.applyRefine}</button>
                        <button onClick={()=>{setRefineMode(null);setRefineInput('');}} className="px-4 py-2.5 text-zinc-400 hover:text-white text-sm">{lng.cancel}</button>
                      </div>
                    </div>}
                  </>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (screen==='final') return (
    <div className="min-h-screen bg-zinc-950 text-white"><Header/>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12"><div className="inline-flex w-16 h-16 bg-yellow-400/10 rounded-2xl items-center justify-center mb-4"><Trophy className="w-8 h-8 text-yellow-400"/></div><h2 className="text-4xl font-bold mb-3">{lng.finalTitle}</h2><p className="text-zinc-400 text-lg">{lng.finalDesc}</p></div>
        {journey && journey.tools[journey.currentIndex] === toolId && (() => {
          const isLast = journey.currentIndex + 1 >= journey.tools.length;
          const nextToolId = !isLast ? journey.tools[journey.currentIndex + 1] : null;
          return (
            <div className="max-w-2xl mx-auto mb-10 p-5 bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/30 rounded-2xl flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 bg-yellow-400 text-zinc-950 rounded-xl flex items-center justify-center flex-shrink-0"><Compass className="w-6 h-6"/></div>
              <div className="flex-1 min-w-0">
                {isLast ? (
                  <>
                    <div className="font-semibold text-white mb-0.5">{lng.journeyDoneTitle}</div>
                    <p className="text-sm text-zinc-400">{lng.journeyDoneDesc}</p>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-yellow-400 font-semibold mb-1">{journey.currentIndex + 1}/{journey.tools.length} · {lng.journeyActiveProgress}</div>
                    <div className="font-semibold text-white mb-0.5">{lng.journeyActiveNext}: {getToolName(nextToolId!)}</div>
                  </>
                )}
              </div>
              <button onClick={()=>{ advanceJourneyAfterTool(); if (nextToolId) pickTool(nextToolId); else backToToolbox(); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-lg text-sm">
                <ArrowRight className="w-4 h-4"/>{isLast ? lng.toolboxBack : lng.journeyNextStepCta}
              </button>
            </div>
          );
        })()}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {toolId==='brand-story'
            ? <button onClick={()=>exportHtml(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-xl shadow-lg shadow-yellow-400/20"><FileText className="w-5 h-5"/>{lng.exportEditorial}</button>
            : <button onClick={()=>exportHtml(false)} className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-semibold rounded-xl shadow-lg shadow-yellow-400/20"><FileText className="w-5 h-5"/>{lng.exportPdf}</button>
          }
          {toolId==='brand-story'&&<button onClick={()=>exportHtml(false)} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl"><FileText className="w-5 h-5"/>{lng.exportPdf}</button>}
          <button onClick={exportMd} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl"><Download className="w-5 h-5"/>{lng.exportMd}</button>
          <button onClick={backToToolbox} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl"><Briefcase className="w-5 h-5"/>{lng.toolboxBack}</button>
          <button onClick={resetAll} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-xl text-sm"><RefreshCw className="w-4 h-4"/>{lng.newConsult}</button>
        </div>
        {error&&<div className="max-w-xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/><p className="text-red-200 text-sm flex-1">{error}</p></div>}
        <div className="space-y-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8"><h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-4">{lng.exec}</h3><MdRender text={reviewText}/></div>
          {currentTool.outputBlocks.map((block: any)=><div key={block.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8"><h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-4">{block.title[lang]||block.title.es}</h3><MdRender text={outputs[block.id]}/></div>)}
        </div>
      </div>
    </div>
  );

  return null;
}