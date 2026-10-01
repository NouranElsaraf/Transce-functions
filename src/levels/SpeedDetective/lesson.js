/**
 * Level 1 lesson companion: Egyptian-Arabic explanations, real-life bridges,
 * real-world / engineering uses and common misconceptions. Plain data.
 * @module SpeedDetective/lesson
 */
export default {
  reality: {
    en: [
      'Speedometers and fitness watches estimate your speed from how your position changes every fraction of a second.',
      'When Google Maps says “traffic is slowing down”, it is describing a rate of change.',
      'Your phone battery dropping 10% per hour is a rate of change too.',
    ],
    ar: [
      'عدّاد العربية والساعات الرياضية بيحسبوا سرعتك من تغيّر مكانك كل جزء من الثانية.',
      'لما جوجل مابس يقولك «الزحمة بتزيد» ده بيوصف معدل تغيّر.',
      'الموبايل لما بيفصل ١٠٪ كل ساعة؟ ده معدل تغيّر برضه.',
    ],
  },
  engineer: {
    en: [
      'Civil: the slope of a road or ramp (rise over run) decides whether a loaded truck can climb it safely.',
      'Electrical: current is the rate of change of charge, i = dq/dt.',
      'Mechanical: acceleration (rate of change of velocity) is what brakes, airbags and seatbelts are designed around.',
    ],
    ar: [
      'مدني: ميل الطريق أو الرامب هو اللي بيحدد التريلا المحمّلة هتطلعه بأمان ولا لأ.',
      'كهربا: التيار هو معدل تغيّر الشحنة مع الزمن، i = dq/dt.',
      'ميكانيكا: العجلة (معدل تغيّر السرعة) هي اللي بنصمم عليها الفرامل والإيرباج وحزام الأمان.',
    ],
  },
  misconceptions: [
    {
      en: ['“Fastest” means furthest along the road.', 'Position is not speed. The car in photo D is furthest, but it is barely moving. Speed is how fast the position changes.'],
      ar: ['«الأسرع هو اللي وصل أبعد»', 'المكان غير السرعة. العربية في صورة D أبعد واحدة بس تقريبًا واقفة. السرعة هي سرعة تغيّر المكان.'],
    },
    {
      en: ['A high point on the graph means high speed.', 'Height on a position graph is position. Steepness is speed. At the top of a hill the speed is zero.'],
      ar: ['«النقطة العالية في الرسمة يعني سرعة عالية»', 'الارتفاع في رسمة المكان هو المكان نفسه، والميل هو السرعة. وعند قمة المنحنى السرعة صفر أصلًا.'],
    },
    {
      en: ['The derivative is just putting h = 0 into the formula.', 'With h = 0 you get 0/0, which means nothing. The derivative is the number the ratio heads towards as h gets closer and closer to 0.'],
      ar: ['«المشتقة يعني أعوّض بـ h = صفر»', 'لو عوّضت بصفر هيطلعلك ٠/٠ ودي ملهاش معنى. المشتقة هي الرقم اللي النسبة بتقرب له وإحنا بنقرّب h من الصفر.'],
    },
  ],
  steps: {
    watch: {
      ask: {
        en: 'Every photo lasts exactly the same time. So what is different between them?',
        ar: 'كل صورة مدتها نفس الوقت بالظبط. طب إيه اللي مختلف بينهم؟',
      },
      masry: [
        'بص يا سيدي، كل صورة من دول اتصورت في نفس المدة بالظبط: ٠.٦ ثانية. يعني لو العربية سابت أثر طويل، معناها إنها قطعت مسافة كبيرة في نفس الوقت. ركّز في طول الأثر، مش في مكان العربية.',
        'شفت؟ السرعة ببساطة هي «قطعت كام متر في الثانية». أطول أثر = أسرع لحظة. إنت بتعمل الحساب ده كل يوم وإنت بتعدّي الشارع وبتقدّر العربية جاية بسرعة ولا لأ.',
      ],
    },
    tangent: {
      ask: {
        en: 'Watch the line that touches the curve. What does it look like when the car is fast? When it is slow?',
        ar: 'بص على الخط اللي بيلمس المنحنى: شكله إيه لما العربية بتجري؟ وشكله إيه لما بتهدّي؟',
      },
      masry: [
        'الرسمة دي هي حكاية المشوار كله: الأفقي هو الوقت والرأسي هو المكان. الخط الأحمر بيلمس المنحنى في نقطة واحدة. حرّكه وبص على رقم السرعة، هتلاقي حاجة بتربط ميلة الخط بالسرعة.',
        'كل ما الخط يبقى واقف أكتر (ميله أكبر)، العربية أسرع. الميل ده بالظبط هو السرعة في اللحظة دي. يعني الرسم البياني مش مجرد رسمة، ده عدّاد سرعة مستخبي.',
      ],
    },
    zoom: {
      ask: {
        en: 'As the gap gets tiny, does the average-speed number keep changing, or does it settle?',
        ar: 'وإنت بتصغّر الفرق، رقم السرعة المتوسطة لسه بيتغير ولا بيثبت؟',
      },
      masry: [
        'إحنا عارفين نحسب السرعة المتوسطة: المسافة على الوقت. بس عايزين السرعة في لحظة واحدة بالظبط، واللحظة مفيهاش وقت! الحل؟ نقرّب النقطتين من بعض لحد ما الفرق يبقى صغير جدًا ونشوف الرقم رايح فين.',
        'الرقم ثبت! ده اللي بنسميه المشتقة: تصغّر الفترة لحد ما تقرب من الصفر وتشوف النسبة رايحة لفين. القانون اللي ظهر ده مش حاجة تحفظها، ده بالظبط اللي إنت لسه عامله بإيدك.',
      ],
      bridge: {
        en: [
          'Speed = distance ÷ time needs two moments, but we want the speed at one instant. The limit solves exactly that problem.',
          'Your car’s speedometer shows your speed right now, not your average since you left home.',
          'Engineers compute instantaneous rates constantly: the climb rate of an aircraft, the current into a capacitor, the deceleration in a crash test.',
        ],
        ar: [
          'السرعة = مسافة ÷ زمن ومحتاجة لحظتين، وإحنا عايزين السرعة في لحظة واحدة. النهاية (limit) هي اللي بتحل المشكلة دي بالظبط.',
          'عدّاد العربية بيقولك سرعتك دلوقتي، مش متوسط سرعتك من ساعة ما نزلت من البيت.',
          'المهندس بيحسب معدلات لحظية طول الوقت: معدل صعود الطيارة، التيار الداخل للمكثف، والتباطؤ في اختبارات التصادم.',
        ],
      },
    },
    read: {
      ask: {
        en: 'Can you tell the whole story of the trip from the shape of the graph alone?',
        ar: 'تقدر تحكي حكاية المشوار كلها من شكل الرسمة بس؟',
      },
      masry: [
        'الرسمة طالعة، بعدين بتفرد، بعدين نازلة. فكّر: لما المكان بيزيد يبقى ماشي لقدام. لما يبطّل يزيد؟ ولما يبدأ يقل؟',
        'الميل صفر = واقف لحظة (زي لما تفرمل عشان ترجع). الميل بالسالب = راجع لورا. المشتقة مش بس بتقولك أد إيه بسرعة، دي كمان بتقولك رايح فين.',
      ],
    },
  },
};
