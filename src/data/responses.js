export const RESPONSES_BY_TIER = {
  OVERLOAD_100: [
    {
      primary: "100% attendance aanallo mone!",
      secondary: "Nee ini classil vannittu entha cheyyana?",
      action: "Ithrem padicha mathi. Veedil pokko. 😂",
      announcement: "Attendance overload! One hundred percent attendance! Nee ini classil keranda, veetil pokko mone!",
    },
    {
      primary: "🚨 ATTENDANCE OVERLOAD DETECTED!",
      secondary: "College record break cheyyan aano udesham?",
      action: "System crash aavum, ippol thanne sthalam vidu!",
      announcement: "System alert! Attendance overload! Classil keraan paadilla. Veedil pokko!",
    },
    {
      primary: "100% Attendance Monster!",
      secondary: "Professor polish cheyyaan bench polum bakki illa.",
      action: "Go home and take a break, bro!",
      announcement: "Hundred percent monster! Veedil poyi rest edutho!",
    }
  ],
  HIGH_85_99: [
    {
      primary: "Nee classil keranda mone...",
      secondary: "Ithrem padicha mathi.",
      action: "Veedil poyi rest edutho.",
      announcement: "Nee classil keranda mone. Ithrem padicha mathi. Veedil poyi rest edutho.",
    },
    {
      primary: "Attendance okke adipoli aanu!",
      secondary: "Classil vannal attendance koodilla mone.",
      action: "Nee already quota complete cheythu.",
      announcement: "Attendance okke adipoli aanu. Classil vannal attendance koodilla mone.",
    },
    {
      primary: "Professor ninne kandittu happy aanu.",
      secondary: "Ini classil irunnu bore adikkenda.",
      action: "Canteenil poyi chayakkudikku!",
      announcement: "Professor happy aanu. Canteenil poyi chayakkudikku mone!",
    },
    {
      primary: "Nee padipist aavan nokkenda.",
      secondary: "Kooduthal padichal thala vedanikkum.",
      action: "Veedil pokko mone.",
      announcement: "Nee classil keranda. Veedil pokko mone.",
    },
    {
      primary: "Door Status: CLOSED for High Scorers!",
      secondary: "Over-attendance leads to early retirement.",
      action: "Exit classroom zone immediately.",
      announcement: "Nee classil keranda mone. Quota complete aanu.",
    }
  ],
  SAFE_75_84: [
    {
      primary: "Attendance safe aanu.",
      secondary: "Nee innu skip cheythalum scene illa.",
      action: "Innathekk ithrem mathi. Relaxed aayikko.",
      announcement: "Attendance safe aanu. Nee innu skip cheythalum scene illa.",
    },
    {
      primary: "Classil kerunnath optional aanu.",
      secondary: "75% kinju boundary safe aanu.",
      action: "Door parayunnu: innu venda mone.",
      announcement: "Classil kerunnath optional aanu. Innu venda mone.",
    },
    {
      primary: "Safe zone spotted!",
      secondary: "Innu btech life enjoy cheyyaam.",
      action: "Grounded & relaxed mode activated.",
      announcement: "Attendance safe aanu. Relaxed aayikko mone.",
    }
  ],
  MID_50_74: [
    {
      primary: "Situation kurachu serious aanu.",
      secondary: "Classil kerikko mone...",
      action: "Iniyum leave edukkan pattilla!",
      announcement: "Situation kurachu serious aanu. Classil kerikko mone.",
    },
    {
      primary: "Ninte attendance ninne nokki karayunnu.",
      secondary: "Akathottu kerikko... vegam!",
      action: "Ini attendance save cheyyanam.",
      announcement: "Akathottu kerikko vegam. Attendance save cheyyanam.",
    },
    {
      primary: "75% missing Warning!",
      secondary: "Benches are waiting for you.",
      action: "Door status: OPEN for saving your semester!",
      announcement: "Warning! Classil kerikko mone, attendance kuravaanu.",
    }
  ],
  LOW_BELOW_50: [
    {
      primary: "🚨 NEE AKATHOTTU KERIKKO MONE!",
      secondary: "Ninte attendance kandittu pediyavunnu.",
      action: "Ini leave eduthal theernnu!",
      announcement: "🚨 NEE AKATHOTTU KERIKKO MONE! Ninte attendance kandittu pediyavunnu!",
    },
    {
      primary: "Attendance emergency aanu!",
      secondary: "Professorine kandittu sorry parayikko.",
      action: "Door thanne parayunnu — AKATHU KERU!",
      announcement: "Attendance emergency aanu. Classil kayari irikku vegam!",
    },
    {
      primary: "Single Digit Danger Level!",
      secondary: "HOD office vilikku munpu classil keru.",
      action: "Emergency Entry Approved!",
      announcement: "Nee akathottu kerikko mone! Emergency aanu!",
    },
    {
      primary: "Canteenil irunnath mathi!",
      secondary: "Bench blank aayi kidakkunnu.",
      action: "First row seats reserved for low attendance legends!",
      announcement: "Akathottu keru. Canteenil irunnath mathi!",
    }
  ]
};

export const PERSONALITY_OVERFLOW_QUOTES = {
  friendly_teacher: {
    HIGH: "Mone... ninakk kashtapadu ariyam. Innu veetil poyi nalla chaya kudichu urangu. Door lock cheythedukkaam ❤️",
    LOW: "Ayo mone! Attendance ithrem kuravo? Poyi front rowil irikku... teacher sahayikkam 😊",
  },
  strict_teacher: {
    HIGH: "NO ENTRY! 85% kooduthal ullavare njan classil iruthoolla! Turn around and march home!",
    LOW: "IMMEDIATELY ENTER! If you miss one more class, condonation fee Rs.5000 kattenda varum!",
  },
  angry_professor: {
    HIGH: "Nee ippo classil keriyillel pinne attendance chodikkanda! VEETIL PO DA!",
    LOW: "DAAA! AKATHOTTU KERIDA! Ninte attendance sheet kanditt enikku bhranthu pidikkunnu!",
  },
  malayali_uncle: {
    HIGH: "Mone... adutha veettile Sureshinte mon polum ithrem padikoolla. Ini veettil pokko, naattukaar kandaal enthu karudhum?",
    LOW: "Mone attendance okke nokkande? Naattil charcha aavum. Akathottu po vegam!",
  },
  hostel_warden: {
    HIGH: "Evide pokunnu? Hostelil poyi room pootti irikku! Classil spot illa!",
    LOW: "Night roll callil ninne kandilla! Ippo classil keriyillel gate poottum!",
  },
  pta_president: {
    HIGH: "PTA meetingil njan ninte achane abhinandikkam. Innu classil keranda, rest edutho!",
    LOW: "Njan ninte veettil vilikkaan povukayaanu! Vegam akathottu keru!",
  },
  motivational_sir: {
    HIGH: "Breakthrough comes from REST, not from classroom! Go home and build a startup!",
    LOW: "Wake up champion! This bench is your launchpad! STEP INSIDE RIGHT NOW!",
  },
  kili_poya_ai: {
    HIGH: "Attendance = 94% 😎 | Brain processing = 2% | Decision = VEETIL POKKO MONE 💥",
    LOW: "ATTENDANCE CRITICAL ERROR 404! 🤖 Bypassing door security... GET INSIDE HUMAN!",
  }
};
