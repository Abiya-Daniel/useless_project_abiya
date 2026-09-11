export const RESPONSES_BY_TIER = {
  OVERLOAD_100: [
    {
      primary: "100% attendance. Enthina ippozhum classil varunne?",
      secondary: "Veettil poyi rest edukk.",
      action: "Ithrem padicha mathi. Veettil poyi rest edutho! 😂",
      announcement: "100% attendance. Enthina ippozhum classil varunne? Veettil poyi rest edukk.",
    }
  ],
  HIGH_85_99: [
    {
      primary: "Mone, ithrem nalla attendance okke undallo.",
      secondary: "Innu classil keranda.",
      action: "Veettil poyi relax cheytho.",
      announcement: "Mone, ithrem nalla attendance okke undallo. Innu classil keranda. Veettil poyi relax cheytho.",
    }
  ],
  SAFE_75_84: [
    {
      primary: "Attendance safe aanu mone.",
      secondary: "Innu leave eduthalum valiya scene onnum illa.",
      action: "Relaxed aayikko mone.",
      announcement: "Attendance safe aanu mone. Innu leave eduthalum valiya scene onnum illa.",
    }
  ],
  MID_50_74: [
    {
      primary: "Mone, attendance kurachu weak aanu.",
      secondary: "Classil keri irikku.",
      action: "Ippo athaanu best mone.",
      announcement: "Mone, attendance kurachu weak aanu. Classil keri irikku. Ippo athaanu best.",
    }
  ],
  LOW_BELOW_50: [
    {
      primary: "Ayyo mone! Ee attendance kandittu pedi aakunnu!",
      secondary: "Ninte attendance kandittu enikku thanne pedi aakunnu.",
      action: "Vegam classil kerikko! 🚨",
      announcement: "Ayyo mone! Ee attendance kandittu enikku thanne pedi aakunnu. Vegam classil kerikko!",
    }
  ]
};

// Exact Teacher Personality Quotes for each Attendance Tier
export const PERSONALITY_TIER_QUOTES = {
  friendly_teacher: {
    OVERLOAD_100: {
      primary: "Ayyo mone, 100% attendance aano?",
      secondary: "Nee classil vannu entha cheyyana?",
      action: "Veettil poyi oru rest edutho. 😊",
      announcement: "Ayyo mone, 100% attendance aano? Nee classil vannu entha cheyyana? Veettil poyi oru rest edutho."
    },
    HIGH_85_99: {
      primary: "Mone, ithrem nalla attendance okke undallo.",
      secondary: "Innu classil keranda.",
      action: "Veettil poyi relax cheytho. ☕",
      announcement: "Mone, ithrem nalla attendance okke undallo. Innu classil keranda. Veettil poyi relax cheytho."
    },
    SAFE_75_84: {
      primary: "Attendance safe aanu mone.",
      secondary: "Innu leave eduthalum valiya scene onnum illa.",
      action: "Relaxed aayikko mone. 😌",
      announcement: "Attendance safe aanu mone. Innu leave eduthalum valiya scene onnum illa."
    },
    MID_50_74: {
      primary: "Mone, attendance kurachu weak aanu.",
      secondary: "Classil keri irikku.",
      action: "Ippo athaanu best mone. 📚",
      announcement: "Mone, attendance kurachu weak aanu. Classil keri irikku. Ippo athaanu best."
    },
    LOW_BELOW_50: {
      primary: "Ayyo mone! Ee attendance kandittu pedi aakunnu!",
      secondary: "Ninte attendance kandittu enikku thanne pedi aakunnu.",
      action: "Vegam classil kerikko! 🚨",
      announcement: "Ayyo mone! Ee attendance kandittu enikku thanne pedi aakunnu. Vegam classil kerikko!"
    }
  },

  strict_teacher: {
    OVERLOAD_100: {
      primary: "100% attendance. Enthina ippozhum classil varunne?",
      secondary: "Veettil poyi rest edukk.",
      action: "Classil keranda. Pokko! 🛑",
      announcement: "100% attendance. Enthina ippozhum classil varunne? Veettil poyi rest edukk."
    },
    HIGH_85_99: {
      primary: "Attendance already excellent aanu.",
      secondary: "Innu class miss cheythalum kuzhappam illa.",
      action: "Pokko! 🚪",
      announcement: "Attendance already excellent aanu. Innu class miss cheythalum kuzhappam illa. Pokko."
    },
    SAFE_75_84: {
      primary: "Attendance acceptable aanu.",
      secondary: "Pakshe overconfidence venda.",
      action: "Maintain your discipline! ⚠️",
      announcement: "Attendance acceptable aanu. Pakshe overconfidence venda."
    },
    MID_50_74: {
      primary: "Attendance kuravaanu.",
      secondary: "Classil keri irikku.",
      action: "Excuse onnum venda! 📝",
      announcement: "Attendance kuravaanu. Classil keri irikku. Excuse onnum venda."
    },
    LOW_BELOW_50: {
      primary: "Ithaano ninte attendance?!",
      secondary: "Vegam akathottu kerikko.",
      action: "Ini oru class polum miss cheyyaruthu! 🚨",
      announcement: "Ithaano ninte attendance? Vegam akathottu kerikko. Ini oru class polum miss cheyyaruthu."
    }
  },

  angry_professor: {
    OVERLOAD_100: {
      primary: "100% attendance! Nee enthina ivide vannath?!",
      secondary: "Veettil poyi irikku!",
      action: "PO VEETIL! 🤬",
      announcement: "100% attendance! Nee enthina ivide vannath? Veettil poyi irikku!"
    },
    HIGH_85_99: {
      primary: "Ithrem attendance undayittum classil varanaam enno?!",
      secondary: "Classil varanam ennoru nirbandham undo?",
      action: "PO! 🚪💥",
      announcement: "Ithrem attendance undayittum classil varanam ennoru nirbandham undo? PO!"
    },
    SAFE_75_84: {
      primary: "Attendance okay aanu.",
      secondary: "Innu skip cheythal enikku oru problem illa.",
      action: "Next! ⏩",
      announcement: "Attendance okay aanu. Innu skip cheythal enikku oru problem illa. Next!"
    },
    MID_50_74: {
      primary: "Ithu attendance aano?!",
      secondary: "Akathottu kereda!",
      action: "Enthina purathu nilkkunne?! 😠",
      announcement: "Ithu attendance aano? Akathottu kereda! Enthina purathu nilkkunne?"
    },
    LOW_BELOW_50: {
      primary: "DA! NINTE ATTENDANCE ETHRA AANENNU ARIYO?!",
      secondary: "AKATHOTTU KERI IRIKKU!",
      action: "ENTRY FORCED IMMEDIATELY! 🚨",
      announcement: "DA! NINTE ATTENDANCE ETHRA AANENNU ARIYO? AKATHOTTU KERI IRIKKU!"
    }
  }
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
  }
};
